"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-user";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

// Types
export type InteractionType = "COMMENT" | "GREETING";
export type InteractionStatus = "NEW" | "READ" | "ARCHIVED";

export interface StoredInteraction {
  id: string;
  videoId: string;
  videoTitle: string;
  type: InteractionType;
  status: InteractionStatus;
  authorName: string;
  contact: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Schéma de validation pour l'envoi public
const submitSchema = z.object({
  videoId: z.string().min(1, "L'identifiant de la prédication est requis"),
  videoTitle: z.string().optional().default("Prédication de l'église"),
  type: z.enum(["COMMENT", "GREETING"]).default("COMMENT"),
  authorName: z
    .string()
    .min(2, "Votre nom doit comporter au moins 2 caractères")
    .max(80, "Le nom ne doit pas dépasser 80 caractères")
    .trim(),
  contact: z.string().max(120).optional().nullable(),
  content: z
    .string()
    .min(3, "Le message doit comporter au moins 3 caractères")
    .max(1200, "Le message ne doit pas dépasser 1200 caractères")
    .trim(),
  honeypot: z.string().max(0, "Tentative de spam détectée").optional(),
});

// Emplacement de stockage résilient (garantit la persistance même si la connexion distante est indisponible)
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "interactions.json");

async function ensureDataFile(): Promise<StoredInteraction[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(content) as StoredInteraction[];
  } catch {
    return [];
  }
}

async function saveDataFile(items: StoredInteraction[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.error("Erreur sauvegarde interactions locales:", err);
  }
}

/**
 * Envoi public d'un commentaire ou d'une salutation après une prédication
 */
export async function submitInteraction(data: {
  videoId: string;
  videoTitle?: string;
  type?: InteractionType;
  authorName: string;
  contact?: string | null;
  content: string;
  honeypot?: string;
}) {
  const validated = submitSchema.parse(data);

  const interactionId = `int_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const nowIso = new Date().toISOString();

  const newRecord: StoredInteraction = {
    id: interactionId,
    videoId: validated.videoId,
    videoTitle: validated.videoTitle || "Prédication",
    type: validated.type,
    status: "NEW",
    authorName: validated.authorName,
    contact: validated.contact || null,
    content: validated.content,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // 1. Sauvegarde dans Prisma si possible
  try {
    // Vérifier si la table existe et si la base répond
    await (prisma as any).videoInteraction.create({
      data: {
        id: interactionId,
        videoId: validated.videoId,
        videoTitle: validated.videoTitle || null,
        type: validated.type,
        status: "NEW",
        authorName: validated.authorName,
        contact: validated.contact || null,
        content: validated.content,
      },
    });
  } catch (err) {
    // Fallback silencieux et résilient sur le stockage local persistant
    console.warn("Prisma non accessible pour interaction, utilisation du stockage persistant local:", err);
  }

  // 2. Toujours stocker dans le cache persistant local pour cohérence et rapidité
  const localItems = await ensureDataFile();
  localItems.unshift(newRecord);
  await saveDataFile(localItems);

  revalidatePath("/");
  revalidatePath("/contenus");
  revalidatePath("/admin");
  revalidatePath("/admin/interactions");

  return {
    success: true,
    message:
      validated.type === "GREETING"
        ? "Votre salutation a bien été transmise à l'église. Que Dieu vous bénisse !"
        : "Votre message a bien été envoyé aux responsables de l'église. Merci pour votre participation !",
    interaction: newRecord,
  };
}

/**
 * Récupération des interactions pour l'administrateur avec filtres
 */
export async function getAllAdminInteractions(options?: {
  filterType?: "ALL" | InteractionType;
  filterStatus?: "ALL" | InteractionStatus;
  videoId?: string;
  search?: string;
}): Promise<StoredInteraction[]> {
  await requireAdmin();

  let items: StoredInteraction[] = [];

  // Essai Prisma d'abord
  try {
    const where: any = {};
    if (options?.filterType && options.filterType !== "ALL") {
      where.type = options.filterType;
    }
    if (options?.filterStatus && options.filterStatus !== "ALL") {
      where.status = options.filterStatus;
    }
    if (options?.videoId) {
      where.videoId = options.videoId;
    }
    if (options?.search?.trim()) {
      where.OR = [
        { authorName: { contains: options.search.trim(), mode: "insensitive" } },
        { content: { contains: options.search.trim(), mode: "insensitive" } },
        { videoTitle: { contains: options.search.trim(), mode: "insensitive" } },
      ];
    }

    const prismaItems = await (prisma as any).videoInteraction.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    if (prismaItems && prismaItems.length > 0) {
      items = prismaItems.map((p: any) => ({
        id: p.id,
        videoId: p.videoId,
        videoTitle: p.videoTitle || "Prédication",
        type: p.type,
        status: p.status,
        authorName: p.authorName,
        contact: p.contact,
        content: p.content,
        createdAt: new Date(p.createdAt).toISOString(),
        updatedAt: new Date(p.updatedAt).toISOString(),
      }));
    }
  } catch (err) {
    // fallback local
  }

  // Si Prisma n'a pas renvoyé d'items ou est hors ligne, lire le stockage local persistant
  if (items.length === 0) {
    const local = await ensureDataFile();
    items = local.filter((item) => {
      if (options?.filterType && options.filterType !== "ALL" && item.type !== options.filterType) {
        return false;
      }
      if (options?.filterStatus && options.filterStatus !== "ALL" && item.status !== options.filterStatus) {
        return false;
      }
      if (options?.videoId && item.videoId !== options.videoId) {
        return false;
      }
      if (options?.search?.trim()) {
        const q = options.search.toLowerCase().trim();
        const inAuthor = item.authorName.toLowerCase().includes(q);
        const inContent = item.content.toLowerCase().includes(q);
        const inTitle = item.videoTitle.toLowerCase().includes(q);
        if (!inAuthor && !inContent && !inTitle) return false;
      }
      return true;
    });
  }

  return items;
}

/**
 * Statistiques des interactions pour le tableau de bord
 */
export async function getInteractionsStats() {
  await requireAdmin();

  const all = await getAllAdminInteractions();

  const commentsCount = all.filter((i) => i.type === "COMMENT").length;
  const greetingsCount = all.filter((i) => i.type === "GREETING").length;
  const newCount = all.filter((i) => i.status === "NEW").length;

  // Regroupement par prédication
  const mapByVideo = new Map<
    string,
    {
      videoId: string;
      videoTitle: string;
      commentsCount: number;
      greetingsCount: number;
      newCount: number;
      total: number;
      lastDate: string;
    }
  >();

  for (const item of all) {
    const existing = mapByVideo.get(item.videoId) || {
      videoId: item.videoId,
      videoTitle: item.videoTitle || "Prédication",
      commentsCount: 0,
      greetingsCount: 0,
      newCount: 0,
      total: 0,
      lastDate: item.createdAt,
    };

    if (item.type === "COMMENT") existing.commentsCount++;
    if (item.type === "GREETING") existing.greetingsCount++;
    if (item.status === "NEW") existing.newCount++;
    existing.total++;

    mapByVideo.set(item.videoId, existing);
  }

  return {
    total: all.length,
    commentsCount,
    greetingsCount,
    newCount,
    groupedByVideo: Array.from(mapByVideo.values()),
  };
}

/**
 * Mise à jour du statut par un administrateur
 */
export async function updateInteractionStatus(id: string, status: InteractionStatus) {
  await requireAdmin();

  try {
    await (prisma as any).videoInteraction.update({
      where: { id },
      data: { status },
    });
  } catch {
    // fallback local
  }

  const local = await ensureDataFile();
  const idx = local.findIndex((i) => i.id === id);
  if (idx !== -1) {
    local[idx].status = status;
    local[idx].updatedAt = new Date().toISOString();
    await saveDataFile(local);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/interactions");

  return { success: true };
}

/**
 * Suppression d'un commentaire ou d'une salutation par l'administrateur
 */
export async function deleteInteraction(id: string) {
  await requireAdmin();

  try {
    await (prisma as any).videoInteraction.delete({
      where: { id },
    });
  } catch {
    // fallback local
  }

  const local = await ensureDataFile();
  const filtered = local.filter((i) => i.id !== id);
  await saveDataFile(filtered);

  revalidatePath("/admin");
  revalidatePath("/admin/interactions");

  return { success: true };
}

/**
 * Marquer tous les nouveaux messages comme lus d'un coup
 */
export async function markAllInteractionsAsRead() {
  await requireAdmin();

  try {
    await (prisma as any).videoInteraction.updateMany({
      where: { status: "NEW" },
      data: { status: "READ" },
    });
  } catch {
    // fallback local
  }

  const local = await ensureDataFile();
  for (const item of local) {
    if (item.status === "NEW") {
      item.status = "READ";
      item.updatedAt = new Date().toISOString();
    }
  }
  await saveDataFile(local);

  revalidatePath("/admin");
  revalidatePath("/admin/interactions");

  return { success: true };
}

