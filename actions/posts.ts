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
  return `${base}-${Date.now().toString(36)}`;
}

const postSchema = z.object({
  title: z.string().min(3, "Le titre doit comporter au moins 3 caractères"),
  description: z.string().optional().nullable(),
  category: z.nativeEnum(PostCategory).default("CHURCH_LIFE"),
  status: z.nativeEnum(PostStatus).default("PUBLISHED"),
  visibility: z.nativeEnum(Visibility).default("PUBLIC"),
  coverImageUrl: z.string().url().optional().nullable().or(z.literal("")),
  coverImageKitFileId: z.string().optional().nullable(),
  eventDate: z.coerce.date().optional().nullable(),
  publishedAt: z.coerce.date().optional().nullable(),
  galleryImages: z
    .array(
      z.object({
        imageUrl: z.string().url(),
        imageKitFileId: z.string().optional().nullable(),
        caption: z.string().optional().nullable(),
      })
    )
    .optional()
    .default([]),
});

export async function getPublicPosts(options?: {
  category?: PostCategory;
  limit?: number;
  search?: string;
}) {
  const where: any = {
    status: PostStatus.PUBLISHED,
    visibility: Visibility.PUBLIC,
  };

  if (options?.category) {
    where.category = options.category;
  }

  if (options?.search?.trim()) {
    where.OR = [
      { title: { contains: options.search.trim(), mode: "insensitive" } },
      { description: { contains: options.search.trim(), mode: "insensitive" } },
    ];
  }

  return prisma.post.findMany({
    where,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: options?.limit ?? 20,
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
      createdBy: {
        select: { firstName: true, lastName: true, imageUrl: true },
      },
    },
  });
}

export async function getAllAdminPosts(options?: {
  category?: PostCategory;
  status?: PostStatus;
  search?: string;
}) {
  await requireAdmin();

  const where: any = {};

  if (options?.category) {
    where.category = options.category;
  }

  if (options?.status) {
    where.status = options.status;
  }

  if (options?.search?.trim()) {
    where.OR = [
      { title: { contains: options.search.trim(), mode: "insensitive" } },
      { description: { contains: options.search.trim(), mode: "insensitive" } },
    ];
  }

  return prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });
}

export async function createPost(formData: FormData | Record<string, unknown>) {
  const user = await requireAdmin();

  const rawData =
    formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;

  // Si galleryImages est transmis sous forme de string JSON
  if (typeof rawData.galleryImages === "string") {
    try {
      rawData.galleryImages = JSON.parse(rawData.galleryImages);
    } catch {
      rawData.galleryImages = [];
    }
  }

  const validated = postSchema.parse(rawData);
  const slug = generateSlug(validated.title);

  const publishedAt =
    validated.status === PostStatus.PUBLISHED
      ? validated.publishedAt || new Date()
      : null;

  const post = await prisma.post.create({
    data: {
      title: validated.title,
      slug,
      description: validated.description || null,
      category: validated.category,
      status: validated.status,
      visibility: validated.visibility,
      coverImageUrl: validated.coverImageUrl || null,
      coverImageKitFileId: validated.coverImageKitFileId || null,
      eventDate: validated.eventDate || null,
      publishedAt,
      createdById: user.id,
      images: {
        create: validated.galleryImages.map((img, idx) => ({
          imageUrl: img.imageUrl,
          imageKitFileId: img.imageKitFileId || null,
          caption: img.caption || null,
          sortOrder: idx,
        })),
      },
    },
    include: {
      images: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/publications");
  revalidatePath("/admin/publications");

  return { success: true, post };
}

export async function updatePost(id: string, data: Record<string, unknown>) {
  await requireAdmin();

  // Si galleryImages est transmis sous forme de string JSON
  if (typeof data.galleryImages === "string") {
    try {
      data.galleryImages = JSON.parse(data.galleryImages);
    } catch {
      data.galleryImages = undefined;
    }
  }

  const validated = postSchema.partial().parse(data);

  const existing = await prisma.post.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!existing) {
    throw new Error("Publication introuvable");
  }

  const publishedAt =
    validated.status === PostStatus.PUBLISHED
      ? existing.publishedAt || new Date()
      : validated.status === PostStatus.DRAFT
      ? null
      : existing.publishedAt;

  // Mise à jour de la publication
  const post = await prisma.post.update({
    where: { id },
    data: {
      title: validated.title ?? existing.title,
      description: validated.description !== undefined ? validated.description : existing.description,
      category: validated.category ?? existing.category,
      status: validated.status ?? existing.status,
      visibility: validated.visibility ?? existing.visibility,
      coverImageUrl:
        validated.coverImageUrl !== undefined ? validated.coverImageUrl : existing.coverImageUrl,
      coverImageKitFileId:
        validated.coverImageKitFileId !== undefined
          ? validated.coverImageKitFileId
          : existing.coverImageKitFileId,
      eventDate: validated.eventDate !== undefined ? validated.eventDate : existing.eventDate,
      publishedAt,
    },
  });

  // Si de nouvelles images de galerie sont fournies, on remplace
  if (Array.isArray(validated.galleryImages)) {
    await prisma.postImage.deleteMany({
      where: { postId: id },
    });

    if (validated.galleryImages.length > 0) {
      await prisma.postImage.createMany({
        data: validated.galleryImages.map((img, idx) => ({
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
  revalidatePath("/publications");
  revalidatePath(`/publications/${post.slug}`);
  revalidatePath("/admin/publications");

  return { success: true, post };
}

export async function deletePost(id: string) {
  await requireAdmin();

  await prisma.post.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/publications");
  revalidatePath("/admin/publications");

  return { success: true };
}

export async function togglePostStatus(id: string) {
  await requireAdmin();

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new Error("Publication introuvable");

  const newStatus =
    post.status === PostStatus.PUBLISHED ? PostStatus.DRAFT : PostStatus.PUBLISHED;

  const publishedAt =
    newStatus === PostStatus.PUBLISHED ? post.publishedAt || new Date() : null;

  await prisma.post.update({
    where: { id },
    data: {
      status: newStatus,
      publishedAt,
    },
  });

  revalidatePath("/");
  revalidatePath("/publications");
  revalidatePath("/admin/publications");

  return { success: true, newStatus };
}
