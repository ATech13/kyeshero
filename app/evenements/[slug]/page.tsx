import { getPhotoPublicationBySlug } from "@/actions/events";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import PhotoPublicationCard from "@/app/components/PhotoPublicationCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPhotoPublicationBySlug(slug);

  if (!item) {
    return { title: "Publication non trouvée" };
  }

  return {
    title: `${item.title} · Assemblée Chrétienne de Goma`,
    description: item.description || item.title,
    openGraph: {
      title: item.title,
      description: item.description || undefined,
      images: item.coverImageUrl ? [item.coverImageUrl] : undefined,
    },
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getPhotoPublicationBySlug(slug);

  if (!item) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-500">
      {/* Bouton retour */}
      <div>
        <Link
          href="/evenements"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour aux événements en images</span>
        </Link>
      </div>

      {/* Rendu fidèle de la carte publication */}
      <PhotoPublicationCard publication={item} />
    </div>
  );
}
