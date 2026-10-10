"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Upload, Loader2, Music, Mic } from "lucide-react";
import { toast } from "sonner";
import { createMedia, updateMedia } from "@/actions/media";
import { uploadToImageKit } from "@/lib/upload-imagekit";
import { useRouter } from "next/navigation";

interface AudioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaToEdit?: any | null;
}

export default function AudioFormModal({
  isOpen,
  onClose,
  mediaToEdit,
}: AudioFormModalProps) {
  const router = useRouter();
  const isEditing = Boolean(mediaToEdit);

  const [title, setTitle] = useState(mediaToEdit?.title || "");
  const [speakerName, setSpeakerName] = useState(mediaToEdit?.speakerName || "");
  const [type, setType] = useState<"SERMON" | "SONG" | "MEETING" | "OTHER">(
    mediaToEdit?.type || "SERMON"
  );
  const [description, setDescription] = useState(mediaToEdit?.description || "");
  const [audioUrl, setAudioUrl] = useState(mediaToEdit?.audioUrl || "");
  const [imageKitFileId, setImageKitFileId] = useState(
    mediaToEdit?.imageKitFileId || ""
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    mediaToEdit?.coverImageUrl || ""
  );
  const [coverImageKitFileId, setCoverImageKitFileId] = useState(
    mediaToEdit?.coverImageKitFileId || ""
  );

  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [audioFileName, setAudioFileName] = useState("");

  const resetForm = useCallback(() => {
    setTitle("");
    setSpeakerName("");
    setType("SERMON");
    setDescription("");
    setAudioUrl("");
    setImageKitFileId("");
    setCoverImageUrl("");
    setCoverImageKitFileId("");
    setAudioFileName("");
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (mediaToEdit) {
        setTitle(mediaToEdit.title || "");
        setSpeakerName(mediaToEdit.speakerName || "");
        setType(mediaToEdit.type || "SERMON");
        setDescription(mediaToEdit.description || "");
        setAudioUrl(mediaToEdit.audioUrl || "");
        setImageKitFileId(mediaToEdit.imageKitFileId || "");
        setCoverImageUrl(mediaToEdit.coverImageUrl || "");
        setCoverImageKitFileId(mediaToEdit.coverImageKitFileId || "");
        setAudioFileName("");
      } else {
        resetForm();
      }
    }
  }, [isOpen, mediaToEdit, resetForm]);

  if (!isOpen) return null;

  const handleAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAudio(true);
      setAudioFileName(file.name);
      const res = await uploadToImageKit(file, "audios");
      setAudioUrl(res.url);
      setImageKitFileId(res.fileId);
      toast.success("Fichier audio téléversé avec succès !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du téléversement audio");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      const res = await uploadToImageKit(file, "covers");
      setCoverImageUrl(res.url);
      setCoverImageKitFileId(res.fileId);
      toast.success("Pochette téléversée avec succès");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du téléversement de la pochette");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !audioUrl) {
      toast.error("Veuillez renseigner le titre et charger un fichier audio");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        title: title.trim(),
        speakerName: speakerName.trim() || null,
        type,
        description: description.trim() || null,
        audioUrl,
        imageKitFileId: imageKitFileId || null,
        coverImageUrl: coverImageUrl || null,
        coverImageKitFileId: coverImageKitFileId || null,
        status: "PUBLISHED" as const,
      };

      if (isEditing && mediaToEdit) {
        await updateMedia(mediaToEdit.id, payload);
        toast.success("Enregistrement audio mis à jour");
      } else {
        await createMedia(payload);
        toast.success("Prédication/Audio publié avec succès !");
        resetForm();
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isEditing) resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-base-100 p-4 sm:p-7 shadow-2xl border border-base-300 my-auto sm:my-8">
        <div className="flex items-center justify-between border-b border-base-200 pb-4 mb-5">
          <h2 className="text-xl font-bold text-base-content">
            {isEditing ? "Modifier l'enregistrement audio" : "Publier un enregistrement audio"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-base-content/75 mb-1">
              Titre de la prédication ou du chant *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: La marche par la foi dans les épreuves"
              className="input input-bordered w-full rounded-xl"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-base-content/75 mb-1">
                Prédicateur / Interprète
              </label>
              <input
                type="text"
                value={speakerName}
                onChange={(e) => setSpeakerName(e.target.value)}
                placeholder="Ex: Pasteur Responsable"
                className="input input-bordered w-full rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-base-content/75 mb-1">
                Type de contenu audio *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="select select-bordered w-full rounded-xl text-xs font-semibold"
              >
                <option value="SERMON">🎙️ Prédication audio</option>
                <option value="SONG">🎵 Chanson / Louange</option>
                <option value="MEETING">Réunion de prière</option>
                <option value="OTHER">Autre audio d'église</option>
              </select>
            </div>
          </div>

          {/* Téléversement du fichier audio */}
          <div className="rounded-xl border border-dashed border-base-300 bg-base-200/40 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-base-content/80">
                Fichier audio MP3 * {audioUrl && <span className="text-success font-semibold">(Prêt)</span>}
              </label>
              <span className="badge badge-xs badge-ghost font-medium">Hébergement ImageKit</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="btn btn-primary btn-sm rounded-xl gap-2 cursor-pointer">
                {isUploadingAudio ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
                <span>{audioUrl ? "Remplacer le fichier" : "Sélectionner un audio (MP3)"}</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFile}
                  className="hidden"
                  disabled={isUploadingAudio}
                />
              </label>
              {audioFileName && (
                <span className="text-xs text-base-content/70 truncate max-w-xs">
                  {audioFileName}
                </span>
              )}
            </div>
          </div>

          {/* Photo ou pochette facultative */}
          <div>
            <label className="block text-xs font-bold text-base-content/75 mb-1">
              Pochette ou photo d'illustration (optionnel)
            </label>
            <div className="flex items-center gap-3">
              <label className="btn btn-outline btn-sm rounded-xl gap-2 cursor-pointer">
                {isUploadingCover ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>{coverImageUrl ? "Changer la pochette" : "Ajouter une pochette"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFile}
                  className="hidden"
                  disabled={isUploadingCover}
                />
              </label>
              {coverImageUrl && (
                <span className="text-xs text-success font-semibold">Pochette sélectionnée</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-base-content/75 mb-1">
              Courte description ou versets bibliques de référence
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Texte biblique, résumé du message..."
              className="textarea textarea-bordered w-full rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost btn-sm rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploadingAudio || !audioUrl}
              className="btn btn-primary btn-sm rounded-xl px-5 font-bold"
            >
              {isSaving ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Publier l'audio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
