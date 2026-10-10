"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Radio,
  Video,
  ArrowRight,
  ExternalLink,
  Youtube,
  MessageSquareHeart,
  X,
} from "lucide-react";
import type { ChurchYouTubeVideo } from "@/types/type";
import { parseVideo, detectVideoPlatform } from "@/lib/video-platforms";
import PreachingInteractionForm from "./PreachingInteractionForm";

interface HomeLiveOrVideoSectionProps {
  videos: ChurchYouTubeVideo[];
  liveVideoOverride?: ChurchYouTubeVideo | null;
}

export default function HomeLiveOrVideoSection({
  videos,
  liveVideoOverride,
}: HomeLiveOrVideoSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Filtrage strict : À l'accueil, UNIQUEMENT les prédications de YouTube (pas de TikTok ni d'autre réseau)
  const youtubeVideos = videos.filter((v) => {
    const platform = detectVideoPlatform(v.youtubeUrl || v.youtubeVideoId);
    return platform === "YOUTUBE";
  });

  // Détection de la priorité : Live disponible sur YouTube ou dernière prédication YouTube publiée
  const activeLive =
    liveVideoOverride ||
    youtubeVideos.find((v) => {
      const titleLower = v.title.toLowerCase();
      return (
        (v as any).isLive === true ||
        titleLower.includes("en direct") ||
        titleLower.includes("culte en direct") ||
        titleLower.includes("live")
      );
    });

  const isLive = Boolean(activeLive);
  const primaryVideo = activeLive || youtubeVideos[0] || {
    id: "default-video",
    title: "Culte d'Adoration & Prédication de la Parole",
    description: "Édification et communion fraternelle à l'Assemblée Chrétienne de Goma Keshero.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeVideoId: "dQw4w9WgXcQ",
    thumbnailUrl: "/images/church.jpeg",
    channelName: "Assemblée Chrétienne Goma",
    publishedAt: new Date(),
    status: "PUBLISHED",
    visibility: "PUBLIC",
  };

  const parsed = parseVideo(primaryVideo.youtubeUrl || primaryVideo.youtubeVideoId, primaryVideo.thumbnailUrl);

  return (
    <section className="relative min-h-[90vh] py-16 sm:py-24 bg-neutral-900 text-white flex flex-col justify-center border-t border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full space-y-10">
        {/* En-tête de section avec logique de priorité */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/15 pb-5">
          <div className="space-y-2">
            {isLive ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-error/20 border border-error/50 px-3.5 py-1 text-xs font-black text-error uppercase tracking-wider animate-pulse">
                <span className="h-2 w-2 rounded-full bg-error animate-ping" />
                <span>En Direct Maintenant</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/40 px-3.5 py-1 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <Video className="h-3.5 w-3.5" />
                <span>Dernière Prédication / Culte Récent</span>
              </div>
            )}

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {isLive ? "Culte en Direct" : "Parole & Prédications Récentes"}
            </h2>
            <p className="text-xs sm:text-sm text-white/70 max-w-xl">
              {isLive
                ? "Rejoignez le culte en temps réel avec toute l'église pour l'adoration et l'écoute de la Parole."
                : "Regardez notre dernier enregistrement officiel ou écoutez les prédications audio disponibles."}
            </p>
          </div>

          <Link
            href="/contenus"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200 transition shrink-0"
          >
            <span>Explorer tous les contenus</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Bloc principal Vidéo (100% responsive et interactif) */}
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          {/* Colonne Lecteur / Vignette de vidéo */}
          <div className="lg:col-span-8">
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/20 bg-black shadow-2xl">
              <div
                onClick={() => setIsModalOpen(true)}
                className="relative h-full w-full cursor-pointer group"
              >
                <Image
                  src={parsed.thumbnailUrl}
                  alt={primaryVideo.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 800px"
                />
                <div className="absolute inset-0 bg-black/40 transition group-hover:bg-black/55 flex flex-col items-center justify-center p-6 text-center">
                  <div
                    className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full text-white shadow-2xl transition duration-300 group-hover:scale-110 ${
                      isLive ? "bg-error animate-pulse" : "bg-primary"
                    }`}
                  >
                    <Play className="h-7 w-7 sm:h-8 sm:w-8 ml-1 fill-current" />
                  </div>

                  <span className="mt-4 text-xs sm:text-sm font-bold text-white/90 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                    {isLive ? "Lancer la diffusion en direct" : "Cliquer pour regarder la vidéo"}
                  </span>
                </div>

                {/* Badge plateforme en haut à gauche */}
                <div className="absolute top-4 left-4">
                  {isLive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-error text-white px-3 py-1 text-xs font-black uppercase tracking-wider shadow-lg">
                      <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                      <span>Culte en direct</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/75 backdrop-blur-md text-white px-3 py-1 text-xs font-bold border border-white/20">
                      <Youtube className="h-3.5 w-3.5 text-error" />
                      <span>YouTube</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Colonne Détails & Action principale */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                {primaryVideo.channelName || "Assemblée Chrétienne Keshero"}
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {primaryVideo.title}
              </h3>

              {primaryVideo.description && (
                <p className="text-xs sm:text-sm text-white/70 line-clamp-3 leading-relaxed">
                  {primaryVideo.description}
                </p>
              )}
            </div>

            {/* Boutons d'action prioritaires */}
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className={`btn w-full rounded-2xl font-bold shadow-lg gap-2 ${
                    isLive
                      ? "btn-error text-white"
                      : "btn-primary text-primary-content"
                  }`}
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>{isLive ? "Accéder au live maintenant" : "Regarder cette prédication"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="btn btn-outline btn-sm w-full rounded-xl text-amber-300 border-amber-300/40 hover:bg-amber-300/10 hover:text-amber-200 gap-2 font-bold"
                >
                  <MessageSquareHeart className="h-4 w-4" />
                  <span>Laisser un commentaire ou saluer</span>
                </button>
              </div>

              <a
                href={parsed.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-xs w-full text-white/60 hover:text-white gap-1.5 font-medium"
              >
                <span>Ouvrir sur YouTube</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'interaction complet : 2 colonnes desktop, empilé mobile */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto text-base-content"
        >
          <div className="relative w-full max-w-5xl lg:max-w-6xl overflow-hidden rounded-2xl sm:rounded-3xl bg-base-100 shadow-2xl border border-base-300 my-auto flex flex-col max-h-[94vh]">
            {/* Barre supérieure du modal */}
            <div className="flex items-center justify-between border-b border-base-300 px-4 py-3 bg-base-200 shrink-0">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="badge badge-sm badge-primary font-bold">
                  {isLive ? "En direct" : "YouTube"}
                </span>
                <h4 className="text-xs sm:text-sm font-bold truncate text-base-content">
                  {primaryVideo.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-circle btn-ghost btn-sm shrink-0"
                aria-label="Fermer"
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
                    <iframe
                      src={`${parsed.embedUrl}?autoplay=1`}
                      title={primaryVideo.title}
                      className="h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  <div className="p-3.5 bg-neutral-950 text-white/80 border-t border-white/10 hidden lg:block">
                    <p className="text-xs font-bold text-white truncate">{primaryVideo.title}</p>
                    <p className="text-[11px] text-white/60 truncate mt-0.5">
                      {primaryVideo.channelName || "Assemblée Chrétienne Keshero"}
                    </p>
                  </div>
                </div>

                {/* Zone Formulaire d'interaction : 5 colonnes sur desktop, dessous sur mobile */}
                <div className="lg:col-span-5 xl:col-span-5 p-3.5 sm:p-5 bg-base-200/50 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-base-300">
                  <PreachingInteractionForm
                    videoId={primaryVideo.id || parsed.videoId}
                    videoTitle={primaryVideo.title}
                  />
                </div>
              </div>
            </div>

            {/* Pied du modal */}
            <div className="p-3 bg-base-100 flex items-center justify-between text-xs text-base-content/70 border-t border-base-200 shrink-0">
              <span className="truncate pr-2">
                {primaryVideo.channelName || "Assemblée Chrétienne de Goma Keshero"}
              </span>
              <a
                href={parsed.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-primary hover:underline shrink-0"
              >
                <span>Ouvrir sur YouTube</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
