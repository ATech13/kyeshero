"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Youtube, X, ExternalLink, MessageSquareHeart } from "lucide-react";
import { parseVideo, VideoPlatform } from "@/lib/video-platforms";
import PreachingInteractionForm from "./PreachingInteractionForm";

// Icône Facebook SVG
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
    </svg>
  );
}

// Icône TikTok SVG
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

interface UniversalVideoCardProps {
  id: string;
  videoUrl: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  channelName?: string | null;
  publishedAt?: Date | string | null;
  platform?: VideoPlatform;
  category?: string | null;
  isLive?: boolean;
}

export default function UniversalVideoCard({
  id,
  videoUrl,
  title,
  description,
  thumbnailUrl,
  channelName,
  publishedAt,
  category,
  isLive,
}: UniversalVideoCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const parsed = parseVideo(videoUrl, thumbnailUrl);

  const getPlatformBadge = () => {
    switch (parsed.platform) {
      case "FACEBOOK":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#1877F2] text-white px-2 py-0.5 text-[11px] font-bold shadow-xs">
            <FacebookIcon className="h-3 w-3" />
            <span>Facebook</span>
          </span>
        );
      case "TIKTOK":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-black text-white px-2 py-0.5 text-[11px] font-bold border border-white/20 shadow-xs">
            <TikTokIcon className="h-3 w-3 text-[#00f2fe]" />
            <span>TikTok</span>
          </span>
        );
      case "YOUTUBE":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-error text-white px-2 py-0.5 text-[11px] font-bold shadow-xs">
            <Youtube className="h-3 w-3" />
            <span>YouTube</span>
          </span>
        );
    }
  };

  return (
    <>
      <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-base-100 border border-base-300 shadow-xs transition hover:shadow-md hover:border-primary/40 w-full max-w-full">
        {/* Miniature avec superposition */}
        <div
          onClick={() => setIsOpen(true)}
          className="relative aspect-video w-full cursor-pointer overflow-hidden bg-base-200"
        >
          <Image
            src={parsed.thumbnailUrl}
            alt={title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center transition group-hover:bg-black/40">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-content shadow-lg transition duration-200 group-hover:scale-110">
              <Play className="h-5 w-5 ml-0.5 fill-current" />
            </div>
          </div>

          {/* Badges en haut */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            {getPlatformBadge()}
            {isLive && (
              <span className="inline-flex items-center gap-1 rounded-md bg-error text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                <span>En Direct</span>
              </span>
            )}
          </div>

          {category && (
            <div className="absolute bottom-2.5 left-2.5">
              <span className="rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                {category}
              </span>
            </div>
          )}
        </div>

        {/* Métadonnées */}
        <div className="flex flex-1 flex-col p-4 min-w-0 space-y-2">
          <p className="text-[11px] font-semibold text-secondary uppercase tracking-wider truncate">
            {channelName || "Assemblée Chrétienne Goma"}
          </p>

          <h3
            onClick={() => setIsOpen(true)}
            className="cursor-pointer text-sm sm:text-base font-bold line-clamp-2 text-base-content hover:text-primary transition leading-snug"
            title={title}
          >
            {title}
          </h3>

          {description && (
            <p className="text-xs text-base-content/65 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          <div className="mt-auto pt-3 flex items-center justify-between text-xs text-base-content/50 border-t border-base-200">
            <span>
              {publishedAt
                ? new Date(publishedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Récemment"}
            </span>

            <div className="flex items-center gap-2">
              <a
                href={parsed.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-base-content/50 hover:text-base-content transition"
                title={`Ouvrir sur ${parsed.platformLabel}`}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Regarder</span>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Modal de lecture & interaction responsive */}
      {isOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
        >
          <div className="relative w-full max-w-5xl lg:max-w-6xl overflow-hidden rounded-2xl sm:rounded-3xl bg-base-100 shadow-2xl border border-base-300 my-auto flex flex-col max-h-[94vh]">
            {/* Barre supérieure du modal */}
            <div className="flex items-center justify-between border-b border-base-300 px-4 py-3 bg-base-200 shrink-0">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                {getPlatformBadge()}
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

            {/* Corps du modal : 2 colonnes sur desktop, empilé sur mobile */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full">
                {/* Zone Vidéo : 7 colonnes sur desktop */}
                <div className="lg:col-span-7 xl:col-span-7 bg-black flex flex-col justify-center">
                  <div className="relative aspect-video w-full bg-black">
                    {parsed.platform === "YOUTUBE" ? (
                      <iframe
                        src={`${parsed.embedUrl}?autoplay=1`}
                        title={title}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : parsed.platform === "FACEBOOK" ? (
                      <iframe
                        src={parsed.embedUrl}
                        title={title}
                        className="h-full w-full border-0"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <iframe
                        src={parsed.embedUrl}
                        title={title}
                        className="h-full w-full border-0"
                        allowFullScreen
                      />
                    )}
                  </div>

                  {/* Bande d'information sous la vidéo sur desktop */}
                  <div className="p-3.5 bg-neutral-950 text-white/80 border-t border-white/10 hidden lg:block">
                    <p className="text-xs font-bold text-white truncate">{title}</p>
                    <p className="text-[11px] text-white/60 truncate mt-0.5">
                      {channelName || "Assemblée Chrétienne Goma"}
                    </p>
                  </div>
                </div>

                {/* Zone Formulaire d'interaction : 5 colonnes sur desktop, dessous sur mobile */}
                <div className="lg:col-span-5 xl:col-span-5 p-3.5 sm:p-5 bg-base-200/50 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-base-300">
                  <PreachingInteractionForm
                    videoId={id || parsed.videoId}
                    videoTitle={title}
                  />
                </div>
              </div>
            </div>

            {/* Barre de pied du modal */}
            <div className="p-3 bg-base-100 flex items-center justify-between text-xs text-base-content/70 border-t border-base-200 shrink-0">
              <span className="truncate pr-2">{channelName || "Assemblée Chrétienne de Goma Keshero"}</span>
              <a
                href={parsed.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-primary hover:underline shrink-0"
              >
                <span>Ouvrir sur {parsed.platformLabel}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
