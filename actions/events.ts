"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-user";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { EventStatus, Visibility } from "@prisma/client";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return `${base}-${Date.now().toString(36)}`;
}

const eventSchema = z.object({
  title: z.string().min(3, "Le titre doit comporter au moins 3 caractères"),
  description: z.string().optional().nullable(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date().optional().nullable(),
  location: z.string().optional().nullable(),
  contactInfo: z.string().optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable().or(z.literal("")),
  coverImageKitFileId: z.string().optional().nullable(),
  status: z.nativeEnum(EventStatus).default("PUBLISHED"),
  visibility: z.nativeEnum(Visibility).default("PUBLIC"),
});

export async function getPublicEvents(options?: { limit?: number; past?: boolean }) {
  const now = new Date();
  const where = {
    status: EventStatus.PUBLISHED,
    visibility: Visibility.PUBLIC,
    ...(options?.past
      ? { startAt: { lt: now } }
      : { startAt: { gte: now } }),
  };

  return prisma.event.findMany({
    where,
    orderBy: { startAt: options?.past ? "desc" : "asc" },
    take: options?.limit ?? 20,
    include: {
      eventImages: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      eventImages: {
        orderBy: { sortOrder: "asc" },
      },
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });
}

export async function getAllAdminEvents() {
  await requireAdmin();
  const [events, posts] = await Promise.all([
    prisma.event.findMany({
      orderBy: { startAt: "desc" },
      include: {
        eventImages: true,
        createdBy: {
          select: { firstName: true, lastName: true },
        },
      },
    }),
    prisma.post.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: {
        images: true,
        createdBy: {
          select: { firstName: true, lastName: true },
        },
      },
    }),
  ]);

  const unified = [
    ...events.map((e) => ({
      ...e,
      type: "EVENT" as const,
      date: e.startAt,
    })),
    ...posts.map((p) => ({
      ...p,
      type: "NEWS" as const,
      startAt: p.publishedAt || p.eventDate || p.createdAt,
      date: p.publishedAt || p.eventDate || p.createdAt,
    })),
  ];

  unified.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return unified;
}

export async function createEvent(formData: FormData | Record<string, unknown>) {
  const user = await requireAdmin();

  const rawData =
    formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;

  const validated = eventSchema.parse(rawData);
  const slug = generateSlug(validated.title);

  const event = await prisma.event.create({
    data: {
      title: validated.title,
      slug,
      description: validated.description || null,
      startAt: validated.startAt,
      endAt: validated.endAt || null,
      location: validated.location || null,
      contactInfo: validated.contactInfo || null,
      coverImageUrl: validated.coverImageUrl || null,
      coverImageKitFileId: validated.coverImageKitFileId || null,
      status: validated.status,
      visibility: validated.visibility,
      publishedAt: validated.status === "PUBLISHED" ? new Date() : null,
      createdById: user.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/evenements");
  revalidatePath("/admin/evenements");

  return { success: true, event };
}

export async function updateEvent(id: string, data: Record<string, unknown>) {
  await requireAdmin();

  const validated = eventSchema.partial().parse(data);

  const event = await prisma.event.update({
    where: { id },
    data: {
      ...validated,
      coverImageUrl: validated.coverImageUrl || null,
      coverImageKitFileId: validated.coverImageKitFileId || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/evenements");
  revalidatePath(`/evenements/${event.slug}`);
  revalidatePath("/admin/evenements");

  return { success: true, event };
}

export async function deleteEvent(id: string) {
  await requireAdmin();

  await prisma.event.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/evenements");
  revalidatePath("/admin/evenements");

  return { success: true };
}

export type PublicationType = "EVENT" | "NEWS";

export interface UnifiedPublication {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: PublicationType;
  date: Date;
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
  const filter = options?.filter ?? "ALL";
  const limit = options?.limit ?? 30;
  const now = new Date();

  const results: UnifiedPublication[] = [];

  // Récupérer les événements
  if (filter === "ALL" || filter === "EVENT") {
    const where: any = {
      status: EventStatus.PUBLISHED,
      visibility: Visibility.PUBLIC,
      ...(options?.past
        ? { startAt: { lt: now } }
        : { startAt: { gte: now } }),
    };

    if (options?.search?.trim()) {
      where.OR = [
        { title: { contains: options.search.trim(), mode: "insensitive" } },
        { description: { contains: options.search.trim(), mode: "insensitive" } },
        { location: { contains: options.search.trim(), mode: "insensitive" } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startAt: options?.past ? "desc" : "asc" },
      take: limit,
      include: {
        eventImages: { orderBy: { sortOrder: "asc" } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });

    for (const evt of events) {
      results.push({
        id: evt.id,
        slug: evt.slug,
        title: evt.title,
        description: evt.description,
        type: "EVENT",
        date: evt.startAt,
        endDate: evt.endAt,
        location: evt.location,
        contactInfo: evt.contactInfo,
        coverImageUrl: evt.coverImageUrl,
        publishedAt: evt.publishedAt || evt.createdAt,
        category: "Culte / Événement",
        authorName: evt.createdBy
          ? `${evt.createdBy.firstName || ""} ${evt.createdBy.lastName || ""}`.trim()
          : null,
        images: evt.eventImages.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          caption: img.altText,
        })),
      });
    }
  }

  // Récupérer les actualités / publications
  if (filter === "ALL" || filter === "NEWS") {
    const where: any = {
      status: "PUBLISHED",
      visibility: "PUBLIC",
    };

    if (options?.search?.trim()) {
      where.OR = [
        { title: { contains: options.search.trim(), mode: "insensitive" } },
        { description: { contains: options.search.trim(), mode: "insensitive" } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
    });

    for (const p of posts) {
      results.push({
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        type: "NEWS",
        date: p.publishedAt || p.eventDate || p.createdAt,
        endDate: null,
        location: null,
        contactInfo: null,
        coverImageUrl: p.coverImageUrl,
        publishedAt: p.publishedAt || p.createdAt,
        category: p.category,
        authorName: p.createdBy
          ? `${p.createdBy.firstName || ""} ${p.createdBy.lastName || ""}`.trim()
          : null,
        images: p.images.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          caption: img.caption,
        })),
      });
    }
  }

  // Si "ALL", trier de façon logique : événements à venir en tête, sinon par date décroissante
  if (filter === "ALL") {
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return results.slice(0, limit);
}

export async function getUnifiedPublicationBySlug(slug: string): Promise<UnifiedPublication | null> {
  // Chercher d'abord un événement
  const evt = await prisma.event.findUnique({
    where: { slug },
    include: {
      eventImages: { orderBy: { sortOrder: "asc" } },
      createdBy: { select: { firstName: true, lastName: true } },
    },
  });

  if (evt) {
    return {
      id: evt.id,
      slug: evt.slug,
      title: evt.title,
      description: evt.description,
      type: "EVENT",
      date: evt.startAt,
      endDate: evt.endAt,
      location: evt.location,
      contactInfo: evt.contactInfo,
      coverImageUrl: evt.coverImageUrl,
      publishedAt: evt.publishedAt || evt.createdAt,
      category: "Culte / Événement",
      authorName: evt.createdBy
        ? `${evt.createdBy.firstName || ""} ${evt.createdBy.lastName || ""}`.trim()
        : null,
      images: evt.eventImages.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        caption: img.altText,
      })),
    };
  }

  // Sinon chercher une actualité (Post)
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      createdBy: { select: { firstName: true, lastName: true } },
    },
  });

  if (post) {
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      type: "NEWS",
      date: post.publishedAt || post.eventDate || post.createdAt,
      endDate: null,
      location: null,
      contactInfo: null,
      coverImageUrl: post.coverImageUrl,
      publishedAt: post.publishedAt || post.createdAt,
      category: post.category,
      authorName: post.createdBy
        ? `${post.createdBy.firstName || ""} ${post.createdBy.lastName || ""}`.trim()
        : null,
      images: post.images.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        caption: img.caption,
      })),
    };
  }

  return null;
}
