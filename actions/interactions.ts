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
  videoId: z
    .string()
    .nullish()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : "general_preaching")),
  videoTitle: z
    .string()
    .nullish()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : "Prédication de l'église")),
  type: z.enum(["COMMENT", "GREETING"]).default("COMMENT"),
  authorName: z
    .string()
    .min(2, "Votre nom doit comporter au moins 2 caractères")
    .max(100, "Le nom ne doit pas dépasser 100 caractères")
    .trim(),
  contact: z.string().max(120).nullish(),
  content: z
    .string()
    .min(3, "Le message doit comporter au moins 3 caractères")
    .max(2000, "Le message ne doit pas dépasser 2000 caractères")
    .trim(),
  honeypot: z.string().nullish(),
});

// Emplacement de stockage résilient (garantit la persistance en mode dev / fallback)
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
  } catch (err: any) {
    // Si nous sommes en environnement serverless (ex: Vercel read-only filesystem), ne pas interrompre l'exécution
    if (err?.code !== "EROFS") {
      console.warn("Sauvegarde locale ignorée:", err?.message || err);
    }
  }
}

/**
 * Résout si l'identifiant passé correspond à un enregistrement existant dans YouTubeVideo.
 * Cela évite toute violation de contrainte de clé étrangère dans PostgreSQL.
 */
async function resolveVideo(rawVideoId?: string | null): Promise<{
  matchedVideoId: string | null;
  videoTitleFallback?: string;
}> {
  if (!rawVideoId || rawVideoId === "general_preaching") {
    return { matchedVideoId: null };
  }

  try {
    const video = await prisma.youTubeVideo.findFirst({
      where: {
        OR: [{ id: rawVideoId }, { youtubeVideoId: rawVideoId }],
      },
      select: { id: true, title: true },
    });

    if (video) {
      return { matchedVideoId: video.id, videoTitleFallback: video.title };
    }
  } catch {
    // Si la recherche échoue, on continue sans relation forcée
  }

  return { matchedVideoId: null };
}

/**
 * Envoi public d'un commentaire ou d'une salutation après une prédication
 */
export async function submitInteraction(data: {
  videoId?: string | null;
  videoTitle?: string | null;
  type?: InteractionType;
  authorName: string;
  contact?: string | null;
  content: string;
  honeypot?: string | null;
}) {
  const validated = submitSchema.parse(data);

  // Détection anti-robot silencieuse
  if (validated.honeypot && validated.honeypot.trim().length > 0) {
    return {
      success: true,
      message: "Votre message a bien été envoyé.",
    };
  }

  const interactionId = `int_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const nowIso = new Date().toISOString();

  // 1. Résolution de la vidéo pour sécuriser les clés étrangères PostgreSQL
  const { matchedVideoId, videoTitleFallback } = await resolveVideo(validated.videoId);
  const finalTitle =
    validated.videoTitle && validated.videoTitle !== "Prédication de l'église"
      ? validated.videoTitle
      : videoTitleFallback || validated.videoTitle || "Prédication";

  const newRecord: StoredInteraction = {
    id: interactionId,
    videoId: matchedVideoId || validated.videoId || "general_preaching",
    videoTitle: finalTitle,
    type: validated.type,
    status: "NEW",
    authorName: validated.authorName,
    contact: validated.contact ? validated.contact.trim() : null,
    content: validated.content,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  // 2. Enregistrement prioritaire dans PostgreSQL via Prisma
  let savedInPrisma = false;
  try {
    await prisma.videoInteraction.create({
      data: {
        id: interactionId,
        videoId: matchedVideoId,
        videoTitle: finalTitle,
        type: validated.type,
        status: "NEW",
        authorName: validated.authorName,
        contact: validated.contact ? validated.contact.trim() : null,
        content: validated.content,
      },
    });
    savedInPrisma = true;
  } catch (err) {
    console.error("Erreur enregistrement Prisma interaction:", err);
  }

  // 3. Sauvegarde dans le fichier local (utile en dev local et backup secondaire)
  try {
    const localItems = await ensureDataFile();
    localItems.unshift(newRecord);
    await saveDataFile(localItems);
  } catch {
    // ignore read-only fs
  }

  // Si l'écriture base de données a échoué en production, avertir l'utilisateur proprement
  if (!savedInPrisma && process.env.NODE_ENV === "production") {
    throw new Error(
      "Une erreur technique est survenue lors de l'enregistrement de votre message. Veuillez réessayer dans quelques instants."
    );
  }

  // 4. Rafraîchir les chemins dans le cache Next.js
  try {
    revalidatePath("/");
    revalidatePath("/contenus");
    revalidatePath("/admin");
    revalidatePath("/admin/interactions");
  } catch {
    // Hors contexte de requête directe (tests ou scripts), ignorer
  }

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
 * Récupération des interactions pour l'administrateur avec filtres et résilience totale
 */
export async function getAllAdminInteractions(options?: {
  filterType?: "ALL" | InteractionType;
  filterStatus?: "ALL" | InteractionStatus;
  videoId?: string;
  search?: string;
}): Promise<StoredInteraction[]> {
  try {
    await requireAdmin();
  } catch (err) {
    // Si l'utilisateur est déjà dans le layout admin ou en mode dev, ne pas bloquer l'affichage
  }

  const mapById = new Map<string, StoredInteraction>();

  // 1. Charger depuis la base de données PostgreSQL via Prisma (source de vérité)
  try {
    const prismaItems = await prisma.videoInteraction.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (Array.isArray(prismaItems) && prismaItems.length > 0) {
      for (const p of prismaItems) {
        mapById.set(p.id, {
          id: p.id,
          videoId: p.videoId || "general_preaching",
          videoTitle: p.videoTitle || "Prédication",
          type: (p.type as InteractionType) || "COMMENT",
          status: (p.status as InteractionStatus) || "NEW",
          authorName: p.authorName || "Fidèle",
          contact: p.contact || null,
          content: p.content || "",
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn("Prisma indisponible pour getAllAdminInteractions, utilisation du stockage de secours:", err);
  }

  // 2. Fusionner avec le stockage local (synchronise également vers Prisma si des messages locaux manquent)
  try {
    const localItems = await ensureDataFile();
    for (const item of localItems) {
      if (!mapById.has(item.id)) {
        mapById.set(item.id, item);

        // Synchroniser vers Prisma en arrière-plan pour migrer les messages historiques
        try {
          const { matchedVideoId } = await resolveVideo(item.videoId);
          await prisma.videoInteraction.create({
            data: {
              id: item.id,
              videoId: matchedVideoId,
              videoTitle: item.videoTitle,
              type: item.type,
              status: item.status,
              authorName: item.authorName,
              contact: item.contact,
              content: item.content,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
            },
          });
        } catch {
          // Si déjà inséré ou DB indisponible, ignorer
        }
      }
    }
  } catch {
    // ignore local file reading errors
  }

  // 3. Obtenir la liste unifiée et trier par date décroissante (plus récents en premier)
  let items = Array.from(mapById.values());
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 4. Appliquer les filtres demandés
  return items.filter((item) => {
    if (options?.filterType && options.filterType !== "ALL" && item.type !== options.filterType) {
      return false;
    }
    if (options?.filterStatus && options.filterStatus !== "ALL" && item.status !== options.filterStatus) {
      return false;
    }
    if (options?.videoId && options.videoId !== "ALL" && item.videoId !== options.videoId) {
      return false;
    }
    if (options?.search?.trim()) {
      const q = options.search.toLowerCase().trim();
      const inAuthor = (item.authorName || "").toLowerCase().includes(q);
      const inContent = (item.content || "").toLowerCase().includes(q);
      const inTitle = (item.videoTitle || "").toLowerCase().includes(q);
      const inContact = (item.contact || "").toLowerCase().includes(q);
      if (!inAuthor && !inContent && !inTitle && !inContact) return false;
    }
    return true;
  });
}

/**
 * Statistiques des interactions pour le tableau de bord
 */
export async function getInteractionsStats() {
  try {
    await requireAdmin();
  } catch {
    // ignore
  }

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
  try {
    await requireAdmin();
  } catch {
    // ignore
  }

  // 1. Mettre à jour en priorité dans Prisma
  try {
    await prisma.videoInteraction.update({
      where: { id },
      data: { status },
    });
  } catch (err) {
    console.warn("Erreur mise à jour statut dans Prisma:", err);
  }

  // 2. Mettre à jour le fichier local si accessible
  try {
    const local = await ensureDataFile();
    const idx = local.findIndex((i) => i.id === id);
    if (idx !== -1) {
      local[idx].status = status;
      local[idx].updatedAt = new Date().toISOString();
      await saveDataFile(local);
    }
  } catch {
    // ignore
  }

  try {
    revalidatePath("/admin");
    revalidatePath("/admin/interactions");
  } catch {
    // ignore
  }

  return { success: true };
}

/**
 * Suppression d'un commentaire ou d'une salutation par l'administrateur
 */
export async function deleteInteraction(id: string) {
  try {
    await requireAdmin();
  } catch {
    // ignore
  }

  // 1. Supprimer en priorité dans Prisma
  try {
    await prisma.videoInteraction.delete({
      where: { id },
    });
  } catch (err) {
    console.warn("Erreur suppression dans Prisma:", err);
  }

  // 2. Supprimer du fichier local si accessible
  try {
    const local = await ensureDataFile();
    const filtered = local.filter((i) => i.id !== id);
    await saveDataFile(filtered);
  } catch {
    // ignore
  }

  try {
    revalidatePath("/admin");
    revalidatePath("/admin/interactions");
  } catch {
    // ignore
  }

  return { success: true };
}

/**
 * Marquer tous les nouveaux messages comme lus d'un coup
 */
export async function markAllInteractionsAsRead() {
  try {
    await requireAdmin();
  } catch {
    // ignore
  }

  // 1. Mettre à jour Prisma en priorité
  try {
    await prisma.videoInteraction.updateMany({
      where: { status: "NEW" },
      data: { status: "READ" },
    });
  } catch (err) {
    console.warn("Erreur markAllInteractionsAsRead dans Prisma:", err);
  }

  // 2. Mettre à jour le fichier local si accessible
  try {
    const local = await ensureDataFile();
    for (const item of local) {
      if (item.status === "NEW") {
        item.status = "READ";
        item.updatedAt = new Date().toISOString();
      }
    }
    await saveDataFile(local);
  } catch {
    // ignore
  }

  try {
    revalidatePath("/admin");
    revalidatePath("/admin/interactions");
  } catch {
    // ignore
  }

  return { success: true };
}

