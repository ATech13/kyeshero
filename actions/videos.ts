"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-user";
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from "@/lib/youtube";
import { parseVideo } from "@/lib/video-platforms";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { VideoStatus, Visibility } from "@prisma/client";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return `${base}-${Date.now().toString(36)}`;
}

const videoSchema = z.object({
  youtubeUrl: z.string().min(5, "L'URL YouTube est requise"),
  title: z.string().min(3, "Le titre doit comporter au moins 3 caractères"),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(VideoStatus).default("PUBLISHED"),
  visibility: z.nativeEnum(Visibility).default("PUBLIC"),
  channelName: z.string().default("Assemblée Chrétienne Goma Keshero"),
  durationSeconds: z.coerce.number().optional().nullable(),
});

export async function getPublicYouTubeVideos(options?: { limit?: number; search?: string }) {
  const where = {
    status: VideoStatus.PUBLISHED,
    visibility: Visibility.PUBLIC,
    ...(options?.search
      ? {
          OR: [
            { title: { contains: options.search, mode: "insensitive" as const } },
            { description: { contains: options.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  return prisma.youTubeVideo.findMany({
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

export async function getAllAdminYouTubeVideos() {
  await requireAdmin();
  return prisma.youTubeVideo.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });
}

export async function getYouTubeVideoMetadata(urlOrId: string) {
  const videoId = extractYouTubeVideoId(urlOrId);
  if (!videoId) {
    return { success: false, error: "Identifiant ou lien YouTube invalide." };
  }

  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return { success: false, error: "Impossible de récupérer les informations depuis YouTube." };
    }

    const data = await res.json();
    return {
      success: true,
      videoId,
      title: (data.title as string) || "",
      authorName: (data.author_name as string) || "",
      thumbnailUrl: (data.thumbnail_url as string) || getYouTubeThumbnailUrl(videoId),
    };
  } catch (error) {
    console.error("Erreur récupération infos YouTube:", error);
    return { success: false, error: "Erreur de connexion à YouTube." };
  }
}

export async function getFacebookVideoMetadata(url: string) {
  if (!url || !url.trim()) {
    return { success: false, error: "Lien Facebook manquant." };
  }

  try {
    const encodedUrl = encodeURIComponent(url.trim());
    const res = await fetch(
      `https://graph.facebook.com/v19.0/oembed_video?url=${encodedUrl}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      return {
        success: false,
        error: "Impossible de récupérer les informations depuis Facebook. Vérifiez que la vidéo est publique.",
      };
    }

    const data = await res.json();
    let title = "";
    let authorName = "";

    if (data.html) {
      const titleMatch = data.html.match(/<blockquote[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(/<[^>]+>/g, "").trim();
      }

      const authorMatch = data.html.match(/Posted by\s*<a[^>]*>([\s\S]*?)<\/a>/i);
      if (authorMatch && authorMatch[1]) {
        authorName = authorMatch[1].replace(/<[^>]+>/g, "").trim();
      }
    }

    if (!title && data.title) {
      title = String(data.title).trim();
    }
    if (!authorName && data.author_name) {
      authorName = String(data.author_name).trim();
    }

    if (!title) {
      return {
        success: false,
        error: "Titre introuvable dans la réponse Facebook.",
      };
    }

    return {
      success: true,
      title,
      authorName: authorName || "Facebook",
    };
  } catch (error) {
    console.error("Erreur récupération infos Facebook:", error);
    return { success: false, error: "Erreur de connexion à Facebook." };
  }
}

export async function createYouTubeVideo(formData: FormData | Record<string, unknown>) {
  const user = await requireAdmin();

  const rawData =
    formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;

  const validated = videoSchema.parse(rawData);
  const parsed = parseVideo(validated.youtubeUrl);
  const videoId =
    parsed.platform === "YOUTUBE"
      ? parsed.videoId
      : `${parsed.platform.toLowerCase()}_${parsed.videoId || Date.now().toString(36)}`;

  // Vérifier si la vidéo existe déjà
  const existing = await prisma.youTubeVideo.findUnique({
    where: { youtubeVideoId: videoId },
  });

  if (existing) {
    throw new Error("Cette vidéo a déjà été enregistrée sur la plateforme.");
  }

  const slug = generateSlug(validated.title);
  const thumbnailUrl = parsed.thumbnailUrl;

  const video = await prisma.youTubeVideo.create({
    data: {
      title: validated.title,
      slug,
      description: validated.description || null,
      youtubeUrl: validated.youtubeUrl,
      youtubeVideoId: videoId,
      thumbnailUrl,
      channelName: validated.channelName || `Assemblée Chrétienne Goma (${parsed.platformLabel})`,
      durationSeconds: validated.durationSeconds || null,
      status: validated.status,
      visibility: validated.visibility,
      publishedAt: validated.status === "PUBLISHED" ? new Date() : null,
      createdById: user.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/contenus");
  revalidatePath("/medias");
  revalidatePath("/admin/videos");

  return { success: true, video };
}

export async function updateYouTubeVideo(id: string, data: Record<string, unknown>) {
  await requireAdmin();

  const validated = videoSchema.partial().parse(data);

  let videoId: string | undefined = undefined;
  let thumbnailUrl: string | undefined = undefined;

  if (validated.youtubeUrl) {
    const parsed = parseVideo(validated.youtubeUrl);
    videoId =
      parsed.platform === "YOUTUBE"
        ? parsed.videoId
        : `${parsed.platform.toLowerCase()}_${parsed.videoId || Date.now().toString(36)}`;
    thumbnailUrl = parsed.thumbnailUrl;
  }

  const video = await prisma.youTubeVideo.update({
    where: { id },
    data: {
      ...validated,
      ...(videoId && { youtubeVideoId: videoId, thumbnailUrl }),
    },
  });

  revalidatePath("/");
  revalidatePath("/contenus");
  revalidatePath("/medias");
  revalidatePath("/admin/videos");

  return { success: true, video };
}

export async function deleteYouTubeVideo(id: string) {
  await requireAdmin();

  await prisma.youTubeVideo.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/medias");
  revalidatePath("/admin/videos");

  return { success: true };
}
