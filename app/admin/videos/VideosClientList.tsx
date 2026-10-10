"use client";

import { useState } from "react";
import { Plus, Trash2, Video, Youtube, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { deleteYouTubeVideo } from "@/actions/videos";
import YouTubeFormModal from "./YouTubeFormModal";
import Image from "next/image";

interface VideosClientListProps {
  initialVideos: any[];
}

export default function VideosClientList({ initialVideos }: VideosClientListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Confirmez-vous la suppression de la vidéo « ${title} » ?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteYouTubeVideo(id);
      toast.success("Vidéo retirée de la médiathèque");
    } catch (err: any) {
      toast.error(err.message || "Impossible de supprimer la vidéo");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-base-content">
            Vidéos YouTube Officielles
          </h1>
          <p className="text-xs sm:text-sm text-base-content/65 mt-0.5">
            Reliez les vidéos hébergées sur la chaîne officielle de l'Assemblée Chrétienne de Goma Keshero.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-error text-white btn-sm rounded-xl font-bold shadow-xs w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter une vidéo YouTube</span>
        </button>
      </div>

      {initialVideos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 sm:p-12 text-center">
          <Video className="h-10 w-10 text-base-content/30 mx-auto mb-3" />
          <h3 className="font-bold text-base">Aucune vidéo YouTube référencée</h3>
          <p className="text-xs text-base-content/60 mt-1 max-w-sm mx-auto">
            Collez le lien d'un culte ou d'un chant depuis la chaîne YouTube officielle de l'église.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="btn btn-error text-white btn-sm rounded-xl font-bold mt-4"
          >
            Ajouter une vidéo
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xs">
          <div className="divide-y divide-base-200">
            {initialVideos.map((vid) => (
              <div
                key={vid.id}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-5 hover:bg-base-200/40 transition"
              >
                {/* Visual + Content info */}
                <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                  {/* Miniature vidéo 16:9 adaptée */}
                  <div className="relative aspect-video w-24 sm:w-32 shrink-0 overflow-hidden rounded-xl bg-base-200 border border-base-300/50">
                    <Image
                      src={
                        vid.thumbnailUrl ||
                        `https://img.youtube.com/vi/${vid.youtubeVideoId}/hqdefault.jpg`
                      }
                      alt={vid.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Youtube className="h-5 w-5 text-white drop-shadow-md" />
                    </div>
                  </div>

                  {/* Détails du texte */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="badge badge-error badge-xs text-white font-semibold shrink-0">
                        YouTube
                      </span>
                      {vid.status && (
                        <span className="badge badge-ghost badge-xs font-medium">
                          {vid.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-base-content leading-snug line-clamp-2">
                      {vid.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-base-content/65 pt-0.5">
                      <span className="truncate max-w-[130px] sm:max-w-none">
                        {vid.channelName || "Chaîne officielle"}
                      </span>
                      <span className="hidden sm:inline">·</span>
                      <a
                        href={vid.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:inline-flex items-center gap-1 text-primary hover:underline font-medium"
                      >
                        <span>Regarder sur YouTube</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Actions : adapté bureau et mobile */}
                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2.5 sm:pt-0 border-t border-base-200 sm:border-0 shrink-0">
                  <a
                    href={vid.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-xs sm:hidden text-primary font-medium flex items-center gap-1.5 px-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Voir sur YouTube</span>
                  </a>

                  <button
                    onClick={() => handleDelete(vid.id, vid.title)}
                    disabled={deletingId === vid.id}
                    className="btn btn-ghost btn-xs sm:btn-sm text-error hover:bg-error/10 rounded-xl flex items-center gap-1.5"
                    title="Supprimer la vidéo"
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

      <YouTubeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
