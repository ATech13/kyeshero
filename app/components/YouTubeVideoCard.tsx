"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Youtube, X } from "lucide-react";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

interface YouTubeVideoCardProps {
  id: string;
  youtubeVideoId: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  channelName?: string | null;
  youtubeUrl: string;
  publishedAt?: Date | string | null;
}

export default function YouTubeVideoCard({
  youtubeVideoId,
  title,
  description,
  thumbnailUrl,
  channelName,
  youtubeUrl,
  publishedAt,
}: YouTubeVideoCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const thumb =
    thumbnailUrl || `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
  const embedUrl = getYouTubeEmbedUrl(youtubeVideoId);

  return (
    <>
      <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-base-100 shadow-sm transition hover:shadow-md hover:border-primary/40 w-full max-w-full">
        {/* Miniature avec superposition */}
        <div
          onClick={() => setIsOpen(true)}
          className="relative aspect-video w-full cursor-pointer overflow-hidden bg-base-200"
        >
          <Image
            src={thumb}
            alt={title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition group-hover:bg-black/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error text-white shadow-lg transition duration-200 group-hover:scale-110">
              <Play className="h-5 w-5 ml-0.5 fill-current" />
            </div>
          </div>

          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
              <Youtube className="h-3.5 w-3.5 text-error" />
              <span>YouTube</span>
            </span>
          </div>
        </div>

        {/* Métadonnées */}
        <div className="flex flex-1 flex-col p-4 sm:p-5 min-w-0">
          <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
            {channelName || "Assemblée Chrétienne Goma Keshero"}
          </p>

          <h3
            onClick={() => setIsOpen(true)}
            className="mt-1.5 cursor-pointer text-base font-bold line-clamp-2 text-base-content hover:text-primary transition"
            title={title}
          >
            {title}
          </h3>

          {description && (
            <p className="mt-2 text-xs text-base-content/65 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          <div className="mt-auto pt-4 flex items-center justify-between text-xs text-base-content/50 border-t border-base-200">
            <span>
              {publishedAt
                ? new Date(publishedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Récemment"}
            </span>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
              aria-label={`Regarder ${title} dans le lecteur`}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Regarder</span>
            </button>
          </div>
        </div>
      </article>

      {/* Modal de lecture vidéo YouTube intégrée dans la plate-forme */}
      {isOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-base-100 shadow-2xl border border-base-300">
            <div className="flex items-center justify-between border-b border-base-300 px-4 py-3 bg-base-200">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <Youtube className="h-5 w-5 text-error shrink-0" />
                <h4 className="text-xs sm:text-sm font-bold truncate">{title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-circle btn-ghost btn-sm shrink-0"
                aria-label="Fermer la vidéo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`${embedUrl}?autoplay=1`}
                title={title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
