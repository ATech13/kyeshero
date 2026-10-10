"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-user";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { QuoteStatus } from "@prisma/client";

const quoteSchema = z.object({
  quote: z.string().min(5, "La citation doit comporter au moins 5 caractères"),
  preacher: z.string().min(2, "Le nom du prédicateur est requis"),
  sermonTitle: z.string().optional().nullable(),
  sermonDate: z.coerce.date().optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  imageKitFileId: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  status: z.nativeEnum(QuoteStatus).default("PUBLISHED"),
  publishedAt: z.coerce.date().optional().nullable(),
});

export async function getPublicSermonQuotes(options?: {
  limit?: number;
  search?: string;
  preacher?: string;
}) {
  const where: any = {
    status: QuoteStatus.PUBLISHED,
  };

  if (options?.preacher) {
    where.preacher = { contains: options.preacher, mode: "insensitive" };
  }

  if (options?.search?.trim()) {
    where.OR = [
      { quote: { contains: options.search.trim(), mode: "insensitive" } },
      { preacher: { contains: options.search.trim(), mode: "insensitive" } },
      { sermonTitle: { contains: options.search.trim(), mode: "insensitive" } },
    ];
  }

  return prisma.sermonQuote.findMany({
    where,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: options?.limit ?? 20,
    include: {
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });
}

export async function getAllAdminSermonQuotes(options?: {
  status?: QuoteStatus;
  search?: string;
}) {
  await requireAdmin();

  const where: any = {};

  if (options?.status) {
    where.status = options.status;
  }

  if (options?.search?.trim()) {
    where.OR = [
      { quote: { contains: options.search.trim(), mode: "insensitive" } },
      { preacher: { contains: options.search.trim(), mode: "insensitive" } },
      { sermonTitle: { contains: options.search.trim(), mode: "insensitive" } },
    ];
  }

  return prisma.sermonQuote.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });
}

export async function createSermonQuote(formData: FormData | Record<string, unknown>) {
  const user = await requireAdmin();

  const rawData =
    formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;

  const validated = quoteSchema.parse(rawData);

  const publishedAt =
    validated.status === QuoteStatus.PUBLISHED
      ? validated.publishedAt || new Date()
      : null;

  const quote = await prisma.sermonQuote.create({
    data: {
      quote: validated.quote,
      preacher: validated.preacher,
      sermonTitle: validated.sermonTitle || null,
      sermonDate: validated.sermonDate || null,
      imageUrl: validated.imageUrl || null,
      imageKitFileId: validated.imageKitFileId || null,
      category: validated.category || null,
      status: validated.status,
      publishedAt,
      createdById: user.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/citations");
  revalidatePath("/medias");
  revalidatePath("/admin/citations");

  return { success: true, quote };
}

export async function updateSermonQuote(id: string, data: Record<string, unknown>) {
  await requireAdmin();

  const validated = quoteSchema.partial().parse(data);

  const existing = await prisma.sermonQuote.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Citation introuvable");
  }

  const publishedAt =
    validated.status === QuoteStatus.PUBLISHED
      ? existing.publishedAt || new Date()
      : validated.status === QuoteStatus.DRAFT
      ? null
      : existing.publishedAt;

  const quote = await prisma.sermonQuote.update({
    where: { id },
    data: {
      ...validated,
      sermonTitle: validated.sermonTitle !== undefined ? validated.sermonTitle : existing.sermonTitle,
      imageUrl: validated.imageUrl !== undefined ? validated.imageUrl : existing.imageUrl,
      imageKitFileId:
        validated.imageKitFileId !== undefined
          ? validated.imageKitFileId
          : existing.imageKitFileId,
      sermonDate:
        validated.sermonDate !== undefined ? validated.sermonDate : existing.sermonDate,
      publishedAt,
    },
  });

  revalidatePath("/");
  revalidatePath("/citations");
  revalidatePath("/medias");
  revalidatePath("/admin/citations");

  return { success: true, quote };
}

export async function deleteSermonQuote(id: string) {
  await requireAdmin();

  await prisma.sermonQuote.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/citations");
  revalidatePath("/medias");
  revalidatePath("/admin/citations");

  return { success: true };
}

export async function toggleQuoteStatus(id: string) {
  await requireAdmin();

  const quote = await prisma.sermonQuote.findUnique({ where: { id } });
  if (!quote) throw new Error("Citation introuvable");

  const newStatus =
    quote.status === QuoteStatus.PUBLISHED ? QuoteStatus.DRAFT : QuoteStatus.PUBLISHED;

  const publishedAt =
    newStatus === QuoteStatus.PUBLISHED ? quote.publishedAt || new Date() : null;

  await prisma.sermonQuote.update({
    where: { id },
    data: {
      status: newStatus,
      publishedAt,
    },
  });

  revalidatePath("/");
  revalidatePath("/citations");
  revalidatePath("/medias");
  revalidatePath("/admin/citations");

  return { success: true, newStatus };
}
