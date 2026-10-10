import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { getPostBySlug } from "@/actions/posts";
import { POST_CATEGORY_LABELS, POST_CATEGORY_COLORS } from "@/lib/post-constants";
import { PostCategory } from "@prisma/client";
import PostGalleryView from "./PostGalleryView";
import type { Metadata } from "next";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "PUBLISHED") {
    return {
      title: "Publication introuvable",
    };
  }

  return {
    title: `${post.title} · Assemblée Chrétienne de Goma`,
    description: post.description ? post.description.slice(0, 160) : "",
    openGraph: post.coverImageUrl
      ? {
          images: [{ url: post.coverImageUrl }],
        }
      : undefined,
  };
}

export default async function SinglePostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  const catKey = post.category as PostCategory;
  const categoryLabel = POST_CATEGORY_LABELS[catKey] || post.category;
  const categoryColor = POST_CATEGORY_COLORS[catKey] || "badge-ghost";

  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const eventDateFormatted = post.eventDate
    ? new Date(post.eventDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const authorName = [post.createdBy?.firstName, post.createdBy?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
      {/* Retour navigation */}
      <div>
        <Link
          href="/publications"
          className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Retour à toutes les publications</span>
        </Link>
      </div>

      {/* En-tête de l'article */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`badge ${categoryColor} font-bold text-xs`}>
            {categoryLabel}
          </span>
          {eventDateFormatted && (
            <span className="badge badge-outline badge-secondary text-xs font-medium">
              Date des travaux / événement : {eventDateFormatted}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-base-content leading-tight">
          {post.title}
        </h1>

        {/* Métadonnées de l'auteur et date */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-base-content/60 pt-2 border-y border-base-200 py-3">
          {publishDate && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Publié le {publishDate}</span>
            </span>
          )}

          {authorName && (
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              <span>Par {authorName}</span>
            </span>
          )}
        </div>
      </header>

      {/* Image de couverture principale */}
      {post.coverImageUrl && (
        <div className="relative aspect-video sm:aspect-16/9 w-full overflow-hidden rounded-3xl bg-base-200 shadow-md">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover object-center"
          />
        </div>
      )}

      {/* Corps du texte */}
      <div className="prose max-w-none text-base-content/90 text-base sm:text-lg leading-relaxed whitespace-pre-line py-4">
        {post.description}
      </div>

      {/* Galerie photos supplémentaires */}
      {post.images && post.images.length > 0 && (
        <PostGalleryView images={post.images} postTitle={post.title} />
      )}

      {/* Section de fin */}
      <div className="pt-8 border-t border-base-300 flex items-center justify-between">
        <Link
          href="/publications"
          className="btn btn-outline btn-sm rounded-xl font-bold gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voir d'autres publications</span>
        </Link>
      </div>
    </article>
  );
}
