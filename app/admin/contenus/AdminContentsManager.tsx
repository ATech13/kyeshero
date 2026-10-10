"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Video,
  Headphones,
  Plus,
  Trash2,
  ExternalLink,
  Play,
  Pause,
  Search,
  Radio,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import { deleteYouTubeVideo } from "@/actions/videos";
import { deleteMedia } from "@/actions/media";
import { detectVideoPlatform, getVideoContentType } from "@/lib/video-platforms";
import YouTubeFormModal from "../videos/YouTubeFormModal";
import AudioFormModal from "../audios/AudioFormModal";

// Icône Facebook
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
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

interface AdminContentsManagerProps {
  initialVideos: any[];
  initialAudios: any[];
  defaultTab?: "videos" | "audios";
}

export default function AdminContentsManager({
  initialVideos,
  initialAudios,
  defaultTab = "videos",
}: AdminContentsManagerProps) {
  const [activeTab, setActiveTab] = useState<"videos" | "audios">(defaultTab);

  // Modals
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [audioModalOpen, setAudioModalOpen] = useState(false);

  // Filtres vidéos
  const [videoPlatformFilter, setVideoPlatformFilter] = useState<string>("ALL");
  const [videoTypeFilter, setVideoTypeFilter] = useState<string>("ALL");
  const [videoSearch, setVideoSearch] = useState("");

  // Filtres audios
  const [audioTypeFilter, setAudioTypeFilter] = useState<string>("ALL");
  const [audioSearch, setAudioSearch] = useState("");

  // État de suppression
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [deletingAudioId, setDeletingAudioId] = useState<string | null>(null);

  // Lecteur audio actif pour prévisualisation
  const [activeAudioSrc, setActiveAudioSrc] = useState<string | null>(null);

  // Suppression vidéo
  const handleDeleteVideo = async (id: string, title: string) => {
    if (!confirm(`Supprimer la vidéo « ${title} » de la médiathèque ?`)) return;
    try {
      setDeletingVideoId(id);
      await deleteYouTubeVideo(id);
      toast.success("Vidéo supprimée");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression de la vidéo");
    } finally {
      setDeletingVideoId(null);
    }
  };

  // Suppression audio
  const handleDeleteAudio = async (id: string, title: string) => {
    if (!confirm(`Supprimer l'enregistrement audio « ${title} » ?`)) return;
    try {
      setDeletingAudioId(id);
      await deleteMedia(id);
      toast.success("Enregistrement audio supprimé");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression de l'audio");
    } finally {
      setDeletingAudioId(null);
    }
  };

  // Filtrage des vidéos
  const filteredVideos = initialVideos.filter((v) => {
    const platform = detectVideoPlatform(v.youtubeUrl || v.youtubeVideoId);
    if (videoPlatformFilter !== "ALL" && platform !== videoPlatformFilter) return false;

    const { type } = getVideoContentType(v);
    if (videoTypeFilter !== "ALL" && type !== videoTypeFilter) return false;

    if (videoSearch.trim()) {
      const q = videoSearch.toLowerCase().trim();
      const inTitle = v.title?.toLowerCase().includes(q);
      const inDesc = v.description?.toLowerCase().includes(q);
      const inChan = v.channelName?.toLowerCase().includes(q);
      if (!inTitle && !inDesc && !inChan) return false;
    }
    return true;
  });

  // Filtrage des audios
  const filteredAudios = initialAudios.filter((a) => {
    if (audioTypeFilter === "SERMON" && a.type !== "SERMON") return false;
    if (audioTypeFilter === "SONG" && a.type !== "SONG") return false;

    if (audioSearch.trim()) {
      const q = audioSearch.toLowerCase().trim();
      const inTitle = a.title?.toLowerCase().includes(q);
      const inDesc = a.description?.toLowerCase().includes(q);
      const inSpeaker = a.speakerName?.toLowerCase().includes(q);
      if (!inTitle && !inDesc && !inSpeaker) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* En-tête principal de la gestion des contenus */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-300 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary mb-1">
            <Radio className="h-3.5 w-3.5" />
            <span>Médiathèque &amp; Réseaux</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-base-content">
            Gestion des Contenus
          </h1>
          <p className="text-xs sm:text-sm text-base-content/65 mt-0.5">
            Prédications vidéo (YouTube, Facebook), extraits &amp; chants TikTok, et audios ImageKit.
          </p>
        </div>

        {/* Boutons d'ajout contextuels */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === "videos" ? (
            <button
              onClick={() => setVideoModalOpen(true)}
              className="btn btn-primary btn-sm rounded-xl font-bold shadow-xs gap-1.5 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter une Vidéo</span>
            </button>
          ) : (
            <button
              onClick={() => setAudioModalOpen(true)}
              className="btn btn-primary btn-sm rounded-xl font-bold shadow-xs gap-1.5 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Publier un Audio</span>
            </button>
          )}
        </div>
      </div>

      {/* Onglets de navigation : Vidéos vs Audios */}
      <div className="flex items-center gap-2 border-b border-base-300 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("videos")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === "videos"
              ? "bg-primary text-primary-content shadow-xs"
              : "bg-base-100 text-base-content/70 hover:bg-base-200 hover:text-base-content border border-base-300"
          }`}
        >
          <Video className="h-4 w-4" />
          <span>Vidéos</span>
          <span
            className={`badge badge-sm font-semibold ml-1 ${
              activeTab === "videos" ? "badge-primary-content text-primary" : "badge-ghost"
            }`}
          >
            {initialVideos.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audios")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === "audios"
              ? "bg-primary text-primary-content shadow-xs"
              : "bg-base-100 text-base-content/70 hover:bg-base-200 hover:text-base-content border border-base-300"
          }`}
        >
          <Headphones className="h-4 w-4" />
          <span>Audios</span>
          <span
            className={`badge badge-sm font-semibold ml-1 ${
              activeTab === "audios" ? "badge-primary-content text-primary" : "badge-ghost"
            }`}
          >
            {initialAudios.length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1 : ONGLET VIDÉOS (YouTube, Facebook, TikTok)    */}
      {/* ======================================================== */}
      {activeTab === "videos" && (
        <div className="space-y-6">
          {/* Guide des règles de publication vidéo */}
          <div className="grid gap-3 sm:grid-cols-2 rounded-2xl border border-base-300 bg-base-100 p-4 text-xs">
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-error/5 border border-error/15">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-error text-white shrink-0 mt-0.5 font-bold">
                <Youtube className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="font-bold text-base-content">
                  YouTube &amp; Facebook · Prédications complètes
                </p>
                <p className="text-base-content/65 mt-0.5">
                  Réservé exclusivement aux cultes entiers, prédications et réunions en direct.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-neutral/5 border border-base-300">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black text-white shrink-0 mt-0.5 font-bold">
                <TikTokIcon className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="font-bold text-base-content">
                  TikTok · Extraits, Chants &amp; Courts
                </p>
                <p className="text-base-content/65 mt-0.5">
                  Publiez les extraits de prédications percutants, cantiques chorale et vidéos courtes.
                </p>
              </div>
            </div>
          </div>

          {/* Barre de filtres Vidéos */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-base-100 p-3 sm:p-4 rounded-2xl border border-base-300">
            {/* Filtres par plateforme */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setVideoPlatformFilter("ALL")}
                className={`btn btn-xs rounded-lg font-bold ${
                  videoPlatformFilter === "ALL" ? "btn-neutral" : "btn-ghost"
                }`}
              >
                Toutes ({initialVideos.length})
              </button>
              <button
                type="button"
                onClick={() => setVideoPlatformFilter("YOUTUBE")}
                className={`btn btn-xs rounded-lg font-bold gap-1 ${
                  videoPlatformFilter === "YOUTUBE" ? "btn-error text-white" : "btn-ghost text-error"
                }`}
              >
                <Youtube className="h-3 w-3" />
                <span>YouTube</span>
              </button>
              <button
                type="button"
                onClick={() => setVideoPlatformFilter("FACEBOOK")}
                className={`btn btn-xs rounded-lg font-bold gap-1 ${
                  videoPlatformFilter === "FACEBOOK" ? "bg-[#1877F2] text-white" : "btn-ghost text-[#1877F2]"
                }`}
              >
                <FacebookIcon className="h-3 w-3" />
                <span>Facebook</span>
              </button>
              <button
                type="button"
                onClick={() => setVideoPlatformFilter("TIKTOK")}
                className={`btn btn-xs rounded-lg font-bold gap-1 ${
                  videoPlatformFilter === "TIKTOK" ? "bg-black text-white" : "btn-ghost text-base-content"
                }`}
              >
                <TikTokIcon className="h-3 w-3" />
                <span>TikTok</span>
              </button>
            </div>

            {/* Recherche textuelle */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher une vidéo..."
                value={videoSearch}
                onChange={(e) => setVideoSearch(e.target.value)}
                className="input input-xs input-bordered w-full pl-8 rounded-lg"
              />
            </div>
          </div>

          {/* Liste des vidéos */}
          {filteredVideos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 sm:p-12 text-center">
              <Video className="h-10 w-10 text-base-content/30 mx-auto mb-3" />
              <h3 className="font-bold text-base">Aucune vidéo correspondante</h3>
              <p className="text-xs text-base-content/60 mt-1 max-w-sm mx-auto">
                Collez un lien YouTube, Facebook ou TikTok pour ajouter du contenu vidéo.
              </p>
              <button
                onClick={() => setVideoModalOpen(true)}
                className="btn btn-primary btn-sm rounded-xl font-bold mt-4"
              >
                Ajouter une vidéo
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xs">
              <div className="divide-y divide-base-200">
                {filteredVideos.map((vid) => {
                  const platform = detectVideoPlatform(vid.youtubeUrl || vid.youtubeVideoId);
                  const { type: contentType, label: typeLabel } = getVideoContentType(vid);

                  return (
                    <div
                      key={vid.id}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-5 hover:bg-base-200/40 transition"
                    >
                      {/* Vignette + Détails */}
                      <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="relative aspect-video w-24 sm:w-32 shrink-0 overflow-hidden rounded-xl bg-base-200 border border-base-300/50">
                          <Image
                            src={
                              vid.thumbnailUrl ||
                              (vid.youtubeVideoId?.length === 11
                                ? `https://img.youtube.com/vi/${vid.youtubeVideoId}/hqdefault.jpg`
                                : "/images/church.jpeg")
                            }
                            alt={vid.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            {platform === "YOUTUBE" && <Youtube className="h-5 w-5 text-white drop-shadow-md" />}
                            {platform === "FACEBOOK" && <FacebookIcon className="h-5 w-5 text-white drop-shadow-md" />}
                            {platform === "TIKTOK" && <TikTokIcon className="h-5 w-5 text-white drop-shadow-md" />}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          {/* Badges Plateforme & Type */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {platform === "YOUTUBE" && (
                              <span className="badge badge-error badge-xs text-white font-semibold shrink-0 gap-1">
                                <Youtube className="h-2.5 w-2.5" />
                                <span>YouTube</span>
                              </span>
                            )}
                            {platform === "FACEBOOK" && (
                              <span className="badge bg-[#1877F2] text-white badge-xs font-semibold shrink-0 gap-1 border-0">
                                <FacebookIcon className="h-2.5 w-2.5" />
                                <span>Facebook</span>
                              </span>
                            )}
                            {platform === "TIKTOK" && (
                              <span className="badge bg-black text-white badge-xs font-semibold shrink-0 gap-1 border-0">
                                <TikTokIcon className="h-2.5 w-2.5" />
                                <span>TikTok</span>
                              </span>
                            )}

                            {/* Badge du type de contenu */}
                            <span
                              className={`badge badge-xs font-medium ${
                                contentType === "SERMON"
                                  ? "badge-primary badge-outline"
                                  : contentType === "SONG"
                                  ? "badge-secondary badge-outline"
                                  : "badge-ghost"
                              }`}
                            >
                              {typeLabel}
                            </span>
                          </div>

                          <h3 className="font-bold text-sm sm:text-base text-base-content leading-snug line-clamp-2">
                            {vid.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-base-content/65 pt-0.5">
                            <span className="truncate max-w-[150px] sm:max-w-none">
                              {vid.channelName || "Assemblée Chrétienne"}
                            </span>
                            <span className="hidden sm:inline">·</span>
                            <a
                              href={vid.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hidden sm:inline-flex items-center gap-1 text-primary hover:underline font-medium"
                            >
                              <span>Ouvrir sur {platform}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t border-base-200 sm:border-0 shrink-0">
                        <a
                          href={vid.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-xs sm:hidden text-primary font-medium flex items-center gap-1 px-2"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Voir sur {platform}</span>
                        </a>

                        <button
                          onClick={() => handleDeleteVideo(vid.id, vid.title)}
                          disabled={deletingVideoId === vid.id}
                          className="btn btn-ghost btn-xs sm:btn-sm text-error hover:bg-error/10 rounded-xl flex items-center gap-1.5"
                          title="Supprimer la vidéo"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sm:hidden text-xs font-semibold">Supprimer</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2 : ONGLET AUDIOS (Stockage ImageKit)            */}
      {/* ======================================================== */}
      {activeTab === "audios" && (
        <div className="space-y-6">
          {/* Guide des règles de publication audio ImageKit */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-primary">
              <Headphones className="h-4 w-4" />
              <span>Stockage &amp; Formats Audio Autorisés</span>
            </div>
            <p className="text-base-content/75 leading-relaxed">
              Tous les fichiers audio sont téléversés et stockés sur le CDN <strong>ImageKit</strong>. 
              Cette section est spécifiquement dédiée aux <strong>prédications audios</strong> complètes et aux <strong>chansons / cantiques de louange</strong>.
            </p>
          </div>

          {/* Barre de filtres Audios */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-base-100 p-3 sm:p-4 rounded-2xl border border-base-300">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAudioTypeFilter("ALL")}
                className={`btn btn-xs rounded-lg font-bold ${
                  audioTypeFilter === "ALL" ? "btn-neutral" : "btn-ghost"
                }`}
              >
                Tous les audios ({initialAudios.length})
              </button>
              <button
                type="button"
                onClick={() => setAudioTypeFilter("SERMON")}
                className={`btn btn-xs rounded-lg font-bold ${
                  audioTypeFilter === "SERMON" ? "btn-primary text-primary-content" : "btn-ghost text-primary"
                }`}
              >
                Prédications audios
              </button>
              <button
                type="button"
                onClick={() => setAudioTypeFilter("SONG")}
                className={`btn btn-xs rounded-lg font-bold ${
                  audioTypeFilter === "SONG" ? "btn-secondary text-secondary-content" : "btn-ghost text-secondary"
                }`}
              >
                Chansons / Louange
              </button>
            </div>

            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher un sermon ou chant..."
                value={audioSearch}
                onChange={(e) => setAudioSearch(e.target.value)}
                className="input input-xs input-bordered w-full pl-8 rounded-lg"
              />
            </div>
          </div>

          {/* Liste des audios */}
          {filteredAudios.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 sm:p-12 text-center">
              <Headphones className="h-10 w-10 text-base-content/30 mx-auto mb-3" />
              <h3 className="font-bold text-base">Aucun enregistrement audio</h3>
              <p className="text-xs text-base-content/60 mt-1 max-w-sm mx-auto">
                Téléversez votre première prédication ou votre chant de louange sur ImageKit.
              </p>
              <button
                onClick={() => setAudioModalOpen(true)}
                className="btn btn-primary btn-sm rounded-xl font-bold mt-4"
              >
                Publier un audio
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xs">
              <div className="divide-y divide-base-200">
                {filteredAudios.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-5 hover:bg-base-200/40 transition"
                  >
                    {/* Bouton lecture + Informations */}
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveAudioSrc(activeAudioSrc === item.audioUrl ? null : item.audioUrl)
                        }
                        className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary hover:scale-105 transition mt-0.5 sm:mt-0"
                        title="Écouter un extrait"
                      >
                        {activeAudioSrc === item.audioUrl ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5 ml-0.5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`badge badge-xs font-semibold ${
                              item.type === "SERMON"
                                ? "badge-primary"
                                : item.type === "SONG"
                                ? "badge-secondary"
                                : "badge-ghost"
                            }`}
                          >
                            {item.type === "SERMON" ? "Prédication audio" : item.type === "SONG" ? "Chanson" : item.type}
                          </span>
                          <span className="badge badge-ghost badge-xs font-normal">
                            ImageKit
                          </span>
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-base-content leading-snug line-clamp-2">
                          {item.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/65">
                          {item.speakerName && (
                            <span className="truncate max-w-[200px] sm:max-w-none">
                              Intervenant : <strong>{item.speakerName}</strong>
                            </span>
                          )}
                          {item.durationSeconds && (
                            <>
                              <span>·</span>
                              <span>
                                {Math.floor(item.durationSeconds / 60)} min
                              </span>
                            </>
                          )}
                        </div>

                        {/* Lecteur HTML5 interactif si en cours d'écoute */}
                        {activeAudioSrc === item.audioUrl && (
                          <div className="pt-2 animate-in fade-in duration-200">
                            <audio
                              controls
                              autoPlay
                              src={item.audioUrl}
                              className="h-8 w-full max-w-md"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t border-base-200 sm:border-0 shrink-0">
                      <button
                        onClick={() => handleDeleteAudio(item.id, item.title)}
                        disabled={deletingAudioId === item.id}
                        className="btn btn-ghost btn-xs sm:btn-sm text-error hover:bg-error/10 rounded-xl flex items-center gap-1.5"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sm:hidden text-xs font-semibold">Supprimer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals pour ajout vidéo & audio */}
      <YouTubeFormModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
      />

      <AudioFormModal
        isOpen={audioModalOpen}
        onClose={() => setAudioModalOpen(false)}
      />
    </div>
  );
}
