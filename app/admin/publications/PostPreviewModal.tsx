"use client";

import { X, Calendar, Tag, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { POST_CATEGORY_LABELS } from "@/lib/post-constants";
import { PostCategory } from "@prisma/client";

interface PostPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any | null;
}

export default function PostPreviewModal({
  isOpen,
  onClose,
  post,
}: PostPreviewModalProps) {
  if (!isOpen || !post) return null;

  const categoryLabel =
    POST_CATEGORY_LABELS[post.category as PostCategory] || post.category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-base-300 bg-base-100 shadow-2xl overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-base-300 px-6 py-4 bg-base-100">
          <div className="flex items-center gap-2">
            <span className="badge badge-primary font-bold text-xs">
              Aperçu public
            </span>
            <span className="text-xs text-base-content/60">
              Rendu tel qu'il apparaîtra aux fidèles et visiteurs
            </span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-base-content"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corps avec scroll */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Image de couverture principale */}
          {post.coverImageUrl && (
            <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden shadow-md">
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Badges & Méta */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/15 px-3 py-1 font-bold text-secondary">
              <Tag className="h-3 w-3" />
              <span>{categoryLabel}</span>
            </span>

            {post.eventDate && (
              <span className="inline-flex items-center gap-1 text-base-content/65">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>
                  Date :{" "}
                  {new Date(post.eventDate).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </span>
            )}

            <span
              className={`badge badge-sm font-semibold ${
                post.status === "PUBLISHED" ? "badge-success" : "badge-ghost"
              }`}
            >
              {post.status === "PUBLISHED" ? "Publié" : "Brouillon"}
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-2xl sm:text-3xl font-black text-base-content leading-tight">
            {post.title}
          </h1>

          {/* Description */}
          {post.description && (
            <div className="prose max-w-none text-base text-base-content/85 leading-relaxed whitespace-pre-line">
              {post.description}
            </div>
          )}

          {/* Galerie d'images */}
          {post.images && post.images.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-base-200">
              <h4 className="text-sm font-bold uppercase tracking-wider text-base-content/70">
                Galerie de photos ({post.images.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {post.images.map((img: any, idx: number) => (
                  <div
                    key={idx}
                    className="space-y-1 rounded-xl overflow-hidden border border-base-300 bg-base-200/50 p-1.5"
                  >
                    <div className="relative h-32 w-full rounded-lg overflow-hidden">
                      <Image
                        src={img.imageUrl}
                        alt={img.caption || `Photo ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {img.caption && (
                      <p className="text-[11px] text-base-content/70 px-1 truncate">
                        {img.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="flex items-center justify-between border-t border-base-300 px-6 py-4 bg-base-100">
          {post.slug && post.status === "PUBLISHED" ? (
            <Link
              href={`/publications/${post.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <span>Ouvrir sur le site public</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <span className="text-xs text-base-content/50 italic">
              Brouillon non visible publiquement
            </span>
          )}

          <button
            onClick={onClose}
            className="btn btn-primary btn-sm rounded-xl px-5 font-bold text-xs"
          >
            Fermer l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
}
