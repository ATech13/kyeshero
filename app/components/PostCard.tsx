import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, Images, Clock } from "lucide-react";
import { POST_CATEGORY_LABELS, POST_CATEGORY_COLORS } from "@/lib/post-constants";
import { PostCategory } from "@prisma/client";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    category: PostCategory | string;
    coverImageUrl?: string | null;
    eventDate?: Date | string | null;
    publishedAt?: Date | string | null;
    images?: { id: string; imageUrl?: string; url?: string; caption?: string | null }[];
  };
}

export default function PostCard({ post }: PostCardProps) {
  const catKey = post.category as PostCategory;
  const categoryLabel = POST_CATEGORY_LABELS[catKey] || post.category;
  const categoryColor = POST_CATEGORY_COLORS[catKey] || "badge-ghost";

  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const eventDateFormatted = post.eventDate
    ? new Date(post.eventDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-base-300/80 bg-base-100 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200">
      {/* Image de couverture */}
      <div className="relative aspect-video w-full overflow-hidden bg-base-200">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-base-200 to-base-300 text-base-content/40">
            <span className="text-3xl font-black opacity-20">AC</span>
          </div>
        )}

        {/* Badge Catégorie */}
        <div className="absolute top-3 left-3">
          <span className={`badge ${categoryColor} badge-sm font-bold shadow-sm`}>
            {categoryLabel}
          </span>
        </div>

        {/* Compteur photos si galerie */}
        {post.images && post.images.length > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[11px] font-semibold text-white shadow-xs">
            <Images className="h-3 w-3" />
            <span>+{post.images.length} {post.images.length === 1 ? "photo" : "photos"}</span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="flex flex-1 flex-col p-5 justify-between space-y-4">
        <div className="space-y-2">
          {/* Métadonnées de dates */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-base-content/60">
            {publishDate && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3 text-primary" />
                <span>Publié le {publishDate}</span>
              </span>
            )}
            {eventDateFormatted && (
              <span className="inline-flex items-center gap-1 text-secondary font-medium">
                <Calendar className="h-3 w-3" />
                <span>Date : {eventDateFormatted}</span>
              </span>
            )}
          </div>

          {/* Titre */}
          <h3 className="text-lg font-bold text-base-content group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            <Link href={`/publications/${post.slug}`}>
              {post.title}
            </Link>
          </h3>

          {/* Description courte */}
          <p className="text-sm text-base-content/70 line-clamp-3 leading-relaxed">
            {post.description}
          </p>
        </div>

        {/* Bouton Lire plus */}
        <div className="pt-2 border-t border-base-200">
          <Link
            href={`/publications/${post.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:gap-2 transition-all"
          >
            <span>Lire plus</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
