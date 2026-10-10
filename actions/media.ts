"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-user";
import { deleteImageKitFile } from "@/lib/imagekit";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { MediaStatus, MediaType, Visibility } from "@prisma/client";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return `${base}-${Date.now().toString(36)}`;
}

const mediaSchema = z.object({
  title: z.string().min(3, "Le titre doit comporter au moins 3 caractères"),
  description: z.string().optional().nullable(),
  type: z.nativeEnum(MediaType).default("SERMON"),
  status: z.nativeEnum(MediaStatus).default("PUBLISHED"),
  visibility: z.nativeEnum(Visibility).default("PUBLIC"),
  audioUrl: z.string().url("L'URL du fichier audio est requise"),
  imageKitFileId: z.string().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable().or(z.literal("")),
  coverImageKitFileId: z.string().optional().nullable(),
  speakerName: z.string().optional().nullable(),
  durationSeconds: z.coerce.number().optional().nullable(),
});

export async function getPublicMedia(options?: {
  type?: MediaType;
  limit?: number;
  search?: string;
}) {
  const where = {
    status: MediaStatus.PUBLISHED,
    visibility: Visibility.PUBLIC,
    ...(options?.type ? { type: options.type } : {}),
    ...(options?.search
      ? {
          OR: [
            { title: { contains: options.search, mode: "insensitive" as const } },
            { description: { contains: options.search, mode: "insensitive" as const } },
            { speakerName: { contains: options.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  return prisma.media.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 30,
    include: {
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });
}

export async function getAllAdminMedia() {
  await requireAdmin();
  return prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });
}

export async function createMedia(formData: FormData | Record<string, unknown>) {
  const user = await requireAdmin();

  const rawData =
    formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;

  const validated = mediaSchema.parse(rawData);
  const slug = generateSlug(validated.title);

  const media = await prisma.media.create({
    data: {
      title: validated.title,
      slug,
      description: validated.description || null,
      type: validated.type,
      status: validated.status,
      visibility: validated.visibility,
      audioUrl: validated.audioUrl,
      imageKitFileId: validated.imageKitFileId || null,
      coverImageUrl: validated.coverImageUrl || null,
      coverImageKitFileId: validated.coverImageKitFileId || null,
      speakerName: validated.speakerName || null,
      durationSeconds: validated.durationSeconds || null,
      publishedAt: validated.status === "PUBLISHED" ? new Date() : null,
      createdById: user.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/medias");
  revalidatePath("/admin/audios");

  return { success: true, media };
}

export async function updateMedia(id: string, data: Record<string, unknown>) {
  await requireAdmin();

  const validated = mediaSchema.partial().parse(data);

  const media = await prisma.media.update({
    where: { id },
    data: {
      ...validated,
      coverImageUrl: validated.coverImageUrl || null,
      coverImageKitFileId: validated.coverImageKitFileId || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/medias");
  revalidatePath("/admin/audios");

  return { success: true, media };
}

export async function deleteMedia(id: string) {
  await requireAdmin();

  const existing = await prisma.media.findUnique({
    where: { id },
  });

  if (existing?.imageKitFileId) {
    try {
      await deleteImageKitFile(existing.imageKitFileId);
    } catch (e) {
      console.warn("Impossible de supprimer le fichier audio sur ImageKit:", e);
    }
  }

  if (existing?.coverImageKitFileId) {
    try {
      await deleteImageKitFile(existing.coverImageKitFileId);
    } catch (e) {
      console.warn("Impossible de supprimer l'image de couverture sur ImageKit:", e);
    }
  }

  await prisma.media.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/medias");
  revalidatePath("/admin/audios");

  return { success: true };
}
