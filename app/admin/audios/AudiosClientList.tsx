"use client";

import { useState } from "react";
import { Plus, Trash2, Headphones, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { deleteMedia } from "@/actions/media";
import AudioFormModal from "./AudioFormModal";

interface AudiosClientListProps {
  initialMedia: any[];
}

export default function AudiosClientList({ initialMedia }: AudiosClientListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeAudioSrc, setActiveAudioSrc] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingMedia(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Confirmez-vous la suppression de « ${title} » ?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteMedia(id);
      toast.success("Enregistrement audio supprimé");
    } catch (err: any) {
      toast.error(err.message || "Impossible de supprimer le média");
    } finally {
      setDeletingId(null);
    }
  };

  const togglePreview = (src: string) => {
    setActiveAudioSrc(activeAudioSrc === src ? null : src);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-base-content">
            Prédications & Chants Audio
          </h1>
          <p className="text-xs sm:text-sm text-base-content/65 mt-0.5">
            Publiez vos fichiers audio (MP3) stockés en toute sécurité.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary btn-sm rounded-xl font-bold shadow-xs w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Publier un audio</span>
        </button>
      </div>

      {initialMedia.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 sm:p-12 text-center">
          <Headphones className="h-10 w-10 text-base-content/30 mx-auto mb-3" />
          <h3 className="font-bold text-base">Aucun enregistrement audio</h3>
          <p className="text-xs text-base-content/60 mt-1 max-w-sm mx-auto">
            Téléversez votre premier sermon ou chant de louange au format MP3.
          </p>
          <button
            onClick={handleOpenCreate}
            className="btn btn-primary btn-sm rounded-xl font-bold mt-4"
          >
            Ajouter un audio
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xs">
          <div className="divide-y divide-base-200">
            {initialMedia.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-5 hover:bg-base-200/40 transition"
              >
                {/* Bouton lecture + Informations */}
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => togglePreview(item.audioUrl)}
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
                    <h3 className="font-bold text-sm sm:text-base text-base-content leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/65">
                      <span className="badge badge-sm badge-ghost font-semibold">
                        {item.type === "SERMON"
                          ? "Prédication"
                          : item.type === "SONG"
                          ? "Chant"
                          : item.type === "MEETING"
                          ? "Réunion"
                          : "Autre"}
                      </span>
                      {item.speakerName && (
                        <span className="truncate max-w-[200px] sm:max-w-none">
                          Par : {item.speakerName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action suppression */}
                <div className="flex items-center justify-end sm:justify-center gap-2 pt-2 sm:pt-0 border-t border-base-200 sm:border-0 shrink-0">
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    disabled={deletingId === item.id}
                    className="btn btn-ghost btn-xs sm:btn-sm text-error hover:bg-error/10 rounded-xl flex items-center gap-1.5"
                    title="Supprimer l'enregistrement"
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

      {/* Lecteur flottant pour test rapide */}
      {activeAudioSrc && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 rounded-2xl bg-base-100 p-2.5 sm:p-3 shadow-2xl border border-base-300">
          <audio src={activeAudioSrc} autoPlay controls className="h-9 w-full sm:w-64" />
        </div>
      )}

      <AudioFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mediaToEdit={editingMedia}
      />
    </div>
  );
}
