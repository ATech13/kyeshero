"use client";

import { useState, useMemo } from "react";
import AudioPlayer from "../components/AudioPlayer";
import UniversalVideoCard from "../components/UniversalVideoCard";
import EmptyState from "../components/EmptyState";
import {
  Headphones,
  Video,
  Radio,
  Search,
  X,
  Youtube,
  Music,
  BookOpen,
  Layers,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import type { ChurchMedia, ChurchYouTubeVideo } from "@/types/type";
import { detectVideoPlatform, VideoPlatform } from "@/lib/video-platforms";

// Icône Facebook
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Icône TikTok
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

export type MediaTab = "ALL" | "VIDEOS" | "AUDIOS";
export type MainCategory = "ALL" | "SERMON" | "SONG" | "TEACHING";
export type PlatformFilter = "ALL" | "YOUTUBE" | "FACEBOOK" | "TIKTOK";

interface ContentsExplorerProps {
  initialAudios: ChurchMedia[];
  initialVideos: ChurchYouTubeVideo[];
}

export default function ContentsExplorer({
  initialAudios,
  initialVideos,
}: ContentsExplorerProps) {
  // Onglet principal : Tous / Vidéos / Audios
  const [activeTab, setActiveTab] = useState<MediaTab>("ALL");

  // Filtre thématique (pour Tous ou Audios)
  const [category, setCategory] = useState<MainCategory>("ALL");

  // Filtre plateforme (pour Vidéos)
  const [videoPlatform, setVideoPlatform] = useState<PlatformFilter>("ALL");

  // Recherche textuelle
  const [searchQuery, setSearchQuery] = useState("");

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setActiveTab("ALL");
    setCategory("ALL");
    setVideoPlatform("ALL");
    setSearchQuery("");
  };

  const hasActiveFilters =
    activeTab !== "ALL" ||
    category !== "ALL" ||
    videoPlatform !== "ALL" ||
    searchQuery.trim().length > 0;

  // Filtrage des audios (ImageKit)
  const filteredAudios = useMemo(() => {
    if (activeTab === "VIDEOS") return [];

    return initialAudios.filter((audio) => {
      // Filtre thématique
      if (category === "SERMON" && audio.type !== "SERMON") return false;
      if (category === "SONG" && audio.type !== "SONG") return false;
      if (category === "TEACHING" && audio.type !== "MEETING" && audio.type !== "SERMON") {
        return false;
      }

      // Recherche
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = audio.title.toLowerCase().includes(q);
        const inSpeaker = audio.speakerName?.toLowerCase().includes(q);
        const inDesc = audio.description?.toLowerCase().includes(q);
        if (!inTitle && !inSpeaker && !inDesc) return false;
      }

      return true;
    });
  }, [initialAudios, activeTab, category, searchQuery]);

  // Filtrage des vidéos (YouTube, Facebook, TikTok)
  const filteredVideos = useMemo(() => {
    if (activeTab === "AUDIOS") return [];

    return initialVideos.filter((video) => {
      const platform = detectVideoPlatform(video.youtubeUrl || video.youtubeVideoId);

      // Filtre par plateforme
      if (videoPlatform !== "ALL" && platform !== videoPlatform) return false;

      // Filtre thématique
      if (category === "SONG") {
        const isSong =
          video.title.toLowerCase().includes("chant") ||
          video.title.toLowerCase().includes("louange") ||
          video.title.toLowerCase().includes("adoration") ||
          video.description?.toLowerCase().includes("chant") ||
          video.channelName?.toLowerCase().includes("chant");
        if (!isSong) return false;
      }
      if (category === "SERMON") {
        const isSermon =
          video.title.toLowerCase().includes("prédication") ||
          video.title.toLowerCase().includes("culte") ||
          video.title.toLowerCase().includes("message") ||
          video.title.toLowerCase().includes("direct") ||
          video.description?.toLowerCase().includes("prédication") ||
          video.description?.toLowerCase().includes("extrait") ||
          video.channelName?.toLowerCase().includes("extrait");
        if (!isSermon) return false;
      }

      // Recherche
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = video.title.toLowerCase().includes(q);
        const inDesc = video.description?.toLowerCase().includes(q);
        const inChan = video.channelName?.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inChan) return false;
      }

      return true;
    });
  }, [initialVideos, activeTab, videoPlatform, category, searchQuery]);

  const totalResults = filteredAudios.length + filteredVideos.length;

  return (
    <div className="space-y-8">
      {/* Panneau de recherche & filtres simplifié */}
      <div className="rounded-3xl border border-base-300 bg-base-100 p-4 sm:p-6 shadow-xs space-y-4 overflow-hidden">
        {/* 1. Barre de recherche principale */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher une prédication, un chant, un orateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-11 pr-10 py-6 rounded-2xl bg-base-200/50 text-base focus:bg-base-100 transition shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content p-1 rounded-full hover:bg-base-200"
              title="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 2. Choix du type de contenu (Onglets clairs) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="grid grid-cols-3 sm:flex w-full sm:w-auto rounded-2xl bg-base-200/80 p-1 border border-base-300/60 self-start sm:self-auto overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setActiveTab("ALL");
              }}
              className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold transition ${
                activeTab === "ALL"
                  ? "bg-base-100 text-base-content shadow-xs"
                  : "text-base-content/70 hover:text-base-content"
              }`}
            >
              <Layers className="h-4 w-4 shrink-0" />
              <span>Tout</span>
              <span className="rounded-full bg-base-300/80 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold shrink-0">
                {initialAudios.length + initialVideos.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("VIDEOS");
              }}
              className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold transition ${
                activeTab === "VIDEOS"
                  ? "bg-error text-white shadow-xs"
                  : "text-base-content/70 hover:text-error"
              }`}
            >
              <Video className="h-4 w-4 shrink-0" />
              <span>Vidéos</span>
              <span
                className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold shrink-0 ${
                  activeTab === "VIDEOS" ? "bg-white/20 text-white" : "bg-base-300/80"
                }`}
              >
                {initialVideos.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("AUDIOS");
              }}
              className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-2 sm:px-4 py-2 text-xs sm:text-sm font-bold transition ${
                activeTab === "AUDIOS"
                  ? "bg-primary text-primary-content shadow-xs"
                  : "text-base-content/70 hover:text-primary"
              }`}
            >
              <Headphones className="h-4 w-4 shrink-0" />
              <span>Audios</span>
              <span
                className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold shrink-0 ${
                  activeTab === "AUDIOS" ? "bg-white/20 text-white" : "bg-base-300/80"
                }`}
              >
                {initialAudios.length}
              </span>
            </button>
          </div>

          {/* Compteur de résultats & bouton réinitialiser */}
          <div className="flex items-center gap-2 text-xs text-base-content/60 self-end sm:self-auto">
            <span>
              {totalResults} résultat{totalResults > 1 ? "s" : ""}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline ml-2"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Filtre secondaire contextuel (une seule rangée propre et adaptée) */}
        {activeTab === "VIDEOS" ? (
          /* Sous-filtre Plateformes Vidéos */
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-base-200">
            <span className="text-xs font-semibold text-base-content/60 mr-1">Plateforme :</span>
            <button
              type="button"
              onClick={() => setVideoPlatform("ALL")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                videoPlatform === "ALL"
                  ? "bg-base-300 text-base-content"
                  : "bg-base-200/60 text-base-content/70 hover:bg-base-200"
              }`}
            >
              Toutes
            </button>
            <button
              type="button"
              onClick={() => setVideoPlatform("YOUTUBE")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                videoPlatform === "YOUTUBE"
                  ? "bg-error text-white shadow-xs"
                  : "bg-base-200/60 text-base-content/70 hover:text-error hover:bg-error/10"
              }`}
            >
              <Youtube className="h-3.5 w-3.5" />
              <span>YouTube</span>
            </button>
            <button
              type="button"
              onClick={() => setVideoPlatform("FACEBOOK")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                videoPlatform === "FACEBOOK"
                  ? "bg-[#1877F2] text-white shadow-xs"
                  : "bg-base-200/60 text-base-content/70 hover:text-[#1877F2] hover:bg-[#1877F2]/10"
              }`}
            >
              <FacebookIcon className="h-3.5 w-3.5" />
              <span>Facebook</span>
            </button>
            <button
              type="button"
              onClick={() => setVideoPlatform("TIKTOK")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                videoPlatform === "TIKTOK"
                  ? "bg-black text-white shadow-xs"
                  : "bg-base-200/60 text-base-content/70 hover:text-base-content hover:bg-base-300"
              }`}
            >
              <TikTokIcon className="h-3.5 w-3.5 text-[#00f2fe]" />
              <span>TikTok</span>
            </button>
          </div>
        ) : (
          /* Sous-filtre Thématique (Tous ou Audios) */
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-base-200">
            <span className="text-xs font-semibold text-base-content/60 mr-1">Thématique :</span>
            <button
              type="button"
              onClick={() => setCategory("ALL")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                category === "ALL"
                  ? "bg-primary text-primary-content shadow-xs"
                  : "bg-base-200/60 text-base-content/70 hover:bg-base-200"
              }`}
            >
              Tous les thèmes
            </button>
            {activeTab === "ALL" && (
              <button
                type="button"
                onClick={() => setCategory("TEACHING")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  category === "TEACHING"
                    ? "bg-primary text-primary-content shadow-xs"
                    : "bg-base-200/60 text-base-content/70 hover:bg-base-200"
                }`}
              >
                <Radio className="h-3.5 w-3.5" />
                <span>Prédications</span>
              </button>
            )}
            {/* <button
              type="button"
              onClick={() => setCategory("SERMON")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                category === "SERMON"
                  ? "bg-primary text-primary-content shadow-xs"
                  : "bg-base-200/60 text-base-content/70 hover:bg-base-200"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Enseignements</span>
            </button> */}
            <button
              type="button"
              onClick={() => setCategory("SONG")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                category === "SONG"
                  ? "bg-primary text-primary-content shadow-xs"
                  : "bg-base-200/60 text-base-content/70 hover:bg-base-200"
              }`}
            >
              <Music className="h-3.5 w-3.5" />
              <span>Chansons &amp; Louanges</span>
            </button>
            
          </div>
        )}
      </div>

      {/* Affichage des résultats */}
      {totalResults === 0 ? (
        <EmptyState
          icon={<Radio className="h-7 w-7" />}
          title="Aucun contenu trouvé"
          description={
            searchQuery
              ? `Aucun contenu ne correspond à « ${searchQuery} ».`
              : "Aucune ressource disponible pour cette sélection."
          }
        />
      ) : (
        <div className="space-y-12">
          {/* Section Vidéos */}
          {filteredVideos.length > 0 && (
            <section className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-base-300 pb-3">
                <div className="flex items-center gap-2 text-error">
                  <Video className="h-5 w-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-black text-base-content">
                    Vidéos ({filteredVideos.length})
                  </h2>
                </div>
                <span className="text-xs text-base-content/60">
                  Diffusions YouTube, Facebook et TikTok
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredVideos.map((video) => (
                  <UniversalVideoCard
                    key={video.id}
                    id={video.id}
                    videoUrl={video.youtubeUrl || video.youtubeVideoId}
                    title={video.title}
                    description={video.description}
                    thumbnailUrl={video.thumbnailUrl}
                    channelName={video.channelName}
                    publishedAt={video.publishedAt}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section Audios */}
          {filteredAudios.length > 0 && (
            <section className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-base-300 pb-3">
                <div className="flex items-center gap-2 text-primary">
                  <Headphones className="h-5 w-5 shrink-0" />
                  <h2 className="text-xl sm:text-2xl font-black text-base-content">
                    Enregistrements Audio ({filteredAudios.length})
                  </h2>
                </div>
                <span className="text-xs text-base-content/60">
                  Prédications et cantiques en écoute directe
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {filteredAudios.map((audio) => (
                  <AudioPlayer
                    key={audio.id}
                    src={audio.audioUrl}
                    title={audio.title}
                    speaker={audio.speakerName}
                    coverUrl={audio.coverImageUrl}
                    duration={audio.durationSeconds}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
