"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-user";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PostCategory, PostStatus, Visibility } from "@prisma/client";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return `${base.slice(0, 50)}-${Date.now().toString(36)}`;
}

export interface PhotoPublicationImage {
  id?: string;
  imageUrl: string;
  imageKitFileId?: string | null;
  caption?: string | null;
  sortOrder?: number;
}

export interface PhotoPublication {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  likesCount: number;
  publishedAt: Date;
  status: PostStatus;
  visibility: Visibility;
  createdAt: Date;
  authorName?: string | null;
  coverImageUrl?: string | null;
  images: {
    id: string;
    imageUrl: string;
    imageKitFileId?: string | null;
    caption?: string | null;
    sortOrder: number;
  }[];
}

const photoPublicationSchema = z.object({
  title: z.string().min(1, "Veuillez renseigner un texte ou une légende"),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(PostStatus).default("PUBLISHED"),
  publishedAt: z.coerce.date().optional().nullable(),
  likesCount: z.coerce.number().int().min(0).default(0),
  images: z
    .array(
      z.object({
        imageUrl: z.string().url("URL d'image invalide"),
        imageKitFileId: z.string().optional().nullable(),
        caption: z.string().optional().nullable(),
      })
    )
    .min(1, "Veuillez ajouter au moins une image"),
});

async function attachLikesCount(posts: any[]) {
  if (!posts || posts.length === 0) return posts;

  if (typeof posts[0]?.likesCount === "number" && posts.every((p) => typeof p.likesCount === "number")) {
    return posts;
  }

  try {
    const ids = posts.map((p) => p.id);
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, "likesCount" FROM "Post" WHERE id = ANY($1::text[])`,
      ids
    );
    const likesMap = new Map<string, number>();
    for (const r of rows) {
      likesMap.set(r.id, Number(r.likesCount) || 0);
    }
    return posts.map((p) => ({
      ...p,
      likesCount: typeof p.likesCount === "number" ? p.likesCount : (likesMap.get(p.id) ?? 0),
    }));
  } catch (e) {
    console.error("Erreur lors de la récupération des likesCount:", e);
    return posts;
  }
}

// Récupérer les publications photos publiques pour le fil public
export async function getPhotoPublications(options?: {
  limit?: number;
  search?: string;
}): Promise<PhotoPublication[]> {
  const where: any = {
    status: PostStatus.PUBLISHED,
    visibility: Visibility.PUBLIC,
  };

  if (options?.search?.trim()) {
    where.OR = [
      { title: { contains: options.search.trim(), mode: "insensitive" } },
      { description: { contains: options.search.trim(), mode: "insensitive" } },
    ];
  }

  let posts = await prisma.post.findMany({
    where,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: options?.limit ?? 30,
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  posts = await attachLikesCount(posts);

  return posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    likesCount: typeof p.likesCount === "number" ? p.likesCount : 0,
    publishedAt: p.publishedAt || p.createdAt,
    status: p.status,
    visibility: p.visibility,
    createdAt: p.createdAt,
    coverImageUrl: p.coverImageUrl || p.images[0]?.imageUrl || null,
    authorName: p.createdBy
      ? `${p.createdBy.firstName || ""} ${p.createdBy.lastName || ""}`.trim()
      : "Assemblée Chrétienne de Goma",
    images: p.images.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      imageKitFileId: img.imageKitFileId,
      caption: img.caption,
      sortOrder: img.sortOrder,
    })),
  }));
}

// Récupérer une publication photo par son slug
export async function getPhotoPublicationBySlug(
  slug: string
): Promise<PhotoPublication | null> {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  if (!post) return null;

  let likesCount = typeof post.likesCount === "number" ? post.likesCount : 0;
  if (typeof post.likesCount !== "number") {
    try {
      const rows: any[] = await prisma.$queryRawUnsafe(
        `SELECT "likesCount" FROM "Post" WHERE id = $1`,
        post.id
      );
      if (rows.length > 0 && typeof rows[0]?.likesCount === "number") {
        likesCount = rows[0].likesCount;
      }
    } catch {
      // Ignorer
    }
  }

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.description,
    likesCount,
    publishedAt: post.publishedAt || post.createdAt,
    status: post.status,
    visibility: post.visibility,
    createdAt: post.createdAt,
    coverImageUrl: post.coverImageUrl || post.images[0]?.imageUrl || null,
    authorName: post.createdBy
      ? `${post.createdBy.firstName || ""} ${post.createdBy.lastName || ""}`.trim()
      : "Assemblée Chrétienne de Goma",
    images: post.images.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      imageKitFileId: img.imageKitFileId,
      caption: img.caption,
      sortOrder: img.sortOrder,
    })),
  };
}

// Récupérer toutes les publications photos pour l'admin
export async function getAllAdminPhotoPublications() {
  await requireAdmin();

  let posts = await prisma.post.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  posts = await attachLikesCount(posts);

  return posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    likesCount: typeof p.likesCount === "number" ? p.likesCount : 0,
    publishedAt: p.publishedAt || p.createdAt,
    status: p.status,
    visibility: p.visibility,
    createdAt: p.createdAt,
    coverImageUrl: p.coverImageUrl || p.images[0]?.imageUrl || null,
    authorName: p.createdBy
      ? `${p.createdBy.firstName || ""} ${p.createdBy.lastName || ""}`.trim()
      : null,
    images: p.images.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      imageKitFileId: img.imageKitFileId,
      caption: img.caption,
      sortOrder: img.sortOrder,
    })),
  }));
}

// Créer une nouvelle publication photo
export async function createPhotoPublication(data: {
  title: string;
  description?: string;
  status?: PostStatus;
  publishedAt?: Date | string;
  likesCount?: number;
  images: { imageUrl: string; imageKitFileId?: string | null; caption?: string | null }[];
}) {
  const user = await requireAdmin();

  const validated = photoPublicationSchema.parse(data);
  const slug = generateSlug(validated.title);

  const publishedAt =
    validated.status === PostStatus.PUBLISHED
      ? validated.publishedAt
        ? new Date(validated.publishedAt)
        : new Date()
      : null;

  const firstImageUrl = validated.images[0]?.imageUrl || null;
  const firstImageKitId = validated.images[0]?.imageKitFileId || null;

  const createPayload: any = {
    title: validated.title,
    slug,
    description: validated.description || null,
    category: PostCategory.CHURCH_LIFE,
    status: validated.status,
    visibility: Visibility.PUBLIC,
    likesCount: validated.likesCount ?? 0,
    coverImageUrl: firstImageUrl,
    coverImageKitFileId: firstImageKitId,
    publishedAt,
    createdById: user.id,
    images: {
      create: validated.images.map((img, idx) => ({
        imageUrl: img.imageUrl,
        imageKitFileId: img.imageKitFileId || null,
        caption: img.caption || null,
        sortOrder: idx,
      })),
    },
  };

  let post: any;
  try {
    post = await prisma.post.create({
      data: createPayload,
      include: {
        images: true,
      },
    });
  } catch (err: any) {
    if (err?.message?.includes("Unknown argument `likesCount`") || err?.message?.includes("likesCount")) {
      delete createPayload.likesCount;
      post = await prisma.post.create({
        data: createPayload,
        include: {
          images: true,
        },
      });
      if (validated.likesCount) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Post" SET "likesCount" = $1 WHERE id = $2`,
          validated.likesCount,
          post.id
        ).catch(() => null);
      }
    } else {
      throw err;
    }
  }

  revalidatePath("/");
  revalidatePath("/evenements");
  revalidatePath("/admin/evenements");

  return { success: true, post };
}

// Mettre à jour une publication photo
export async function updatePhotoPublication(
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: PostStatus;
    publishedAt?: Date | string;
    likesCount?: number;
    images?: { imageUrl: string; imageKitFileId?: string | null; caption?: string | null }[];
  }
) {
  await requireAdmin();

  const existing = await prisma.post.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!existing) {
    throw new Error("Publication introuvable");
  }

  const publishedAt =
    data.status === PostStatus.PUBLISHED
      ? data.publishedAt
        ? new Date(data.publishedAt)
        : existing.publishedAt || new Date()
      : data.status === PostStatus.DRAFT
      ? null
      : existing.publishedAt;

  const firstImageUrl =
    data.images && data.images.length > 0
      ? data.images[0].imageUrl
      : existing.coverImageUrl;

  const firstImageKitId =
    data.images && data.images.length > 0
      ? data.images[0].imageKitFileId
      : existing.coverImageKitFileId;

  const updatePayload: any = {
    title: data.title ?? existing.title,
    description: data.description !== undefined ? data.description : existing.description,
    status: data.status ?? existing.status,
    likesCount: data.likesCount !== undefined ? data.likesCount : existing.likesCount,
    publishedAt,
    coverImageUrl: firstImageUrl,
    coverImageKitFileId: firstImageKitId,
  };

  let post: any;
  try {
    post = await prisma.post.update({
      where: { id },
      data: updatePayload,
    });
  } catch (err: any) {
    if (err?.message?.includes("Unknown argument `likesCount`") || err?.message?.includes("likesCount")) {
      delete updatePayload.likesCount;
      post = await prisma.post.update({
        where: { id },
        data: updatePayload,
      });
      if (data.likesCount !== undefined) {
        await prisma.$executeRawUnsafe(
          `UPDATE "Post" SET "likesCount" = $1 WHERE id = $2`,
          data.likesCount,
          id
        ).catch(() => null);
      }
    } else {
      throw err;
    }
  }

  if (Array.isArray(data.images)) {
    await prisma.postImage.deleteMany({
      where: { postId: id },
    });

    if (data.images.length > 0) {
      await prisma.postImage.createMany({
        data: data.images.map((img, idx) => ({
          postId: id,
          imageUrl: img.imageUrl,
          imageKitFileId: img.imageKitFileId || null,
          caption: img.caption || null,
          sortOrder: idx,
        })),
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/evenements");
  revalidatePath(`/evenements/${post.slug}`);
  revalidatePath("/admin/evenements");

  return { success: true, post };
}

// Supprimer une publication photo
export async function deletePhotoPublication(id: string) {
  await requireAdmin();

  await prisma.post.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/evenements");
  revalidatePath("/admin/evenements");

  return { success: true };
}

// Action publique pour incrémenter le nombre de likes sur une publication photo
export async function likePhotoPublication(id: string) {
  try {
    const updated = await prisma.post.update({
      where: { id },
      data: {
        likesCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        likesCount: true,
      },
    });

    revalidatePath("/evenements");
    revalidatePath("/admin/evenements");
    revalidatePath("/");

    return { success: true, likesCount: updated.likesCount };
  } catch (error: any) {
    console.error("Tentative de like via fallback SQL:", error);
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "Post" SET "likesCount" = COALESCE("likesCount", 0) + 1 WHERE id = $1`,
        id
      );
      const rows: any[] = await prisma.$queryRawUnsafe(
        `SELECT "likesCount" FROM "Post" WHERE id = $1`,
        id
      );
      revalidatePath("/evenements");
      revalidatePath("/admin/evenements");
      revalidatePath("/");
      return { success: true, likesCount: rows[0]?.likesCount ?? 0 };
    } catch (sqlErr) {
      console.error("Erreur SQL fallback likePhotoPublication:", sqlErr);
      return { success: false, error: "Impossible d'enregistrer la mention J'aime" };
    }
  }
}

// ============================================================
// ALIAS DE COMPATIBILITÉ (pour éviter de casser d'anciennes références)
// ============================================================

export type PublicationType = "EVENT" | "NEWS";

export interface UnifiedPublication {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: PublicationType;
  date: Date;
  likesCount?: number;
  endDate?: Date | null;
  location?: string | null;
  contactInfo?: string | null;
  coverImageUrl?: string | null;
  publishedAt?: Date | null;
  category?: string | null;
  authorName?: string | null;
  images?: { id: string; imageUrl: string; caption?: string | null }[];
}

export async function getUnifiedPublications(options?: {
  filter?: "ALL" | "EVENT" | "NEWS";
  limit?: number;
  search?: string;
  past?: boolean;
}): Promise<UnifiedPublication[]> {
  const publications = await getPhotoPublications({
    limit: options?.limit,
    search: options?.search,
  });

  return publications.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description ?? null,
    type: "NEWS" as const,
    date: p.publishedAt,
    likesCount: p.likesCount,
    endDate: null,
    location: null,
    contactInfo: null,
    coverImageUrl: p.coverImageUrl ?? null,
    publishedAt: p.publishedAt,
    category: "Vie de l'Église",
    authorName: p.authorName ?? null,
    images: p.images.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      caption: img.caption,
    })),
  }));
}

export async function getUnifiedPublicationBySlug(
  slug: string
): Promise<UnifiedPublication | null> {
  const p = await getPhotoPublicationBySlug(slug);
  if (!p) return null;

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description ?? null,
    type: "NEWS",
    date: p.publishedAt,
    likesCount: p.likesCount,
    endDate: null,
    location: null,
    contactInfo: null,
    coverImageUrl: p.coverImageUrl ?? null,
    publishedAt: p.publishedAt,
    category: "Vie de l'Église",
    authorName: p.authorName ?? null,
    images: p.images.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      caption: img.caption,
    })),
  };
}

export async function getAllAdminEvents() {
  return getAllAdminPhotoPublications();
}

export async function deleteEvent(id: string) {
  return deletePhotoPublication(id);
}

export async function createEvent(data: any) {
  return createPhotoPublication(data);
}

export async function updateEvent(id: string, data: any) {
  return updatePhotoPublication(id, data);
}

export async function getPublicEvents(options?: { limit?: number; past?: boolean }) {
  return [];
}

export async function getEventBySlug(slug: string) {
  return null;
}
