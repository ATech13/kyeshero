"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Upload, Loader2, Camera, Trash2, Plus, Globe, ThumbsUp, Share2, Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { createPhotoPublication, updatePhotoPublication } from "@/actions/events";
import { uploadToImageKit } from "@/lib/upload-imagekit";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface UploadedImageItem {
  id?: string;
  imageUrl: string;
  imageKitFileId?: string | null;
  caption?: string | null;
}

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: any | null;
}

export default function EventFormModal({
  isOpen,
  onClose,
  eventToEdit,
}: EventFormModalProps) {
  const router = useRouter();
  const isEditing = Boolean(eventToEdit);

  const [title, setTitle] = useState(eventToEdit?.title || "");
  const [description, setDescription] = useState(eventToEdit?.description || "");
  const [likesCount, setLikesCount] = useState<number>(eventToEdit?.likesCount ?? 0);
  const [publishedAt, setPublishedAt] = useState(
    eventToEdit?.publishedAt || eventToEdit?.createdAt
      ? new Date(eventToEdit.publishedAt || eventToEdit.createdAt)
          .toISOString()
          .slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">(
    eventToEdit?.status === "DRAFT" ? "DRAFT" : "PUBLISHED"
  );
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [manualUrl, setManualUrl] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setLikesCount(0);
    setPublishedAt(new Date().toISOString().slice(0, 16));
    setStatus("PUBLISHED");
    setImages([]);
    setManualUrl("");
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        setTitle(eventToEdit.title || "");
        setDescription(eventToEdit.description || "");
        setLikesCount(eventToEdit.likesCount ?? 0);
        setPublishedAt(
          eventToEdit.publishedAt || eventToEdit.createdAt
            ? new Date(eventToEdit.publishedAt || eventToEdit.createdAt)
                .toISOString()
                .slice(0, 16)
            : new Date().toISOString().slice(0, 16)
        );
        setStatus(eventToEdit.status === "DRAFT" ? "DRAFT" : "PUBLISHED");
        setImages(
          eventToEdit.images && eventToEdit.images.length > 0
            ? eventToEdit.images.map((img: any) => ({
                id: img.id,
                imageUrl: img.imageUrl,
                imageKitFileId: img.imageKitFileId || null,
                caption: img.caption || "",
              }))
            : eventToEdit.coverImageUrl
            ? [
                {
                  imageUrl: eventToEdit.coverImageUrl,
                  imageKitFileId: eventToEdit.coverImageKitFileId || null,
                  caption: "",
                },
              ]
            : []
        );
      } else {
        resetForm();
      }
    }
  }, [isOpen, eventToEdit, resetForm]);

  if (!isOpen) return null;

  // Téléversement multiple vers ImageKit
  const handleMultipleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const total = files.length;
      const uploadedList: UploadedImageItem[] = [];

      for (let i = 0; i < total; i++) {
        const file = files[i];
        setUploadProgress(`Envoi ${i + 1}/${total} : ${file.name}...`);
        const res = await uploadToImageKit(file, "posts");
        uploadedList.push({
          imageUrl: res.url,
          imageKitFileId: res.fileId,
          caption: "",
        });
      }

      setImages((prev) => [...prev, ...uploadedList]);
      toast.success(`${total} photo${total > 1 ? "s" : ""} ajoutée${total > 1 ? "s" : ""} avec succès`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi des photos");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
      e.target.value = "";
    }
  };

  // Ajouter une URL manuellement
  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    try {
      new URL(manualUrl);
      setImages((prev) => [
        ...prev,
        {
          imageUrl: manualUrl.trim(),
          caption: "",
        },
      ]);
      setManualUrl("");
      toast.success("Image ajoutée");
    } catch {
      toast.error("Veuillez entrer une URL d'image valide");
    }
  };

  // Supprimer une image de la liste
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Déplacer une image vers le haut ou la gauche
  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const item = copy.splice(fromIndex, 1)[0];
      copy.splice(toIndex, 0, item);
      return copy;
    });
  };

  // Enregistrement de la publication
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Veuillez renseigner le texte de la publication");
      return;
    }

    if (images.length === 0) {
      toast.error("Veuillez ajouter au moins une photo pour cette publication");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        likesCount: Number(likesCount) || 0,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        images: images.map((img) => ({
          imageUrl: img.imageUrl,
          imageKitFileId: img.imageKitFileId || null,
          caption: img.caption || null,
        })),
      };

      if (isEditing && eventToEdit?.id) {
        await updatePhotoPublication(eventToEdit.id, payload);
        toast.success("Publication mise à jour avec succès");
      } else {
        await createPhotoPublication(payload);
        toast.success("Publication créée et mise en ligne");
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Impossible d'enregistrer la publication");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-base-100 border border-base-200 shadow-2xl overflow-hidden my-auto">
        {/* En-tête de la modal */}
        <div className="flex items-center justify-between border-b border-base-200 px-5 py-4 bg-base-100 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-base-content leading-tight">
                {isEditing ? "Modifier la Publication Photo" : "Nouvelle Publication Photo"}
              </h2>
              <p className="text-xs text-base-content/60">
                Format publication photo avec disposition en mosaïque
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle rounded-xl"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulaire & Aperçu interactif */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Colonne Gauche : Paramètres & Upload (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Texte / Légende de la publication */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-base-content/70">
                  Légende ou texte de la publication <span className="text-error">*</span>
                </label>
                <textarea
                  rows={4}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Les serviteurs de Dieu présents à la Sainte cène."
                  className="textarea textarea-bordered w-full rounded-2xl text-sm leading-relaxed focus:border-primary resize-y"
                  required
                />
                <p className="text-[11px] text-base-content/50">
                  Ce texte apparaîtra au-dessus des images, exactement comme sur le statut Facebook.
                </p>
              </div>

              {/* Téléversement des photos */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-base-content/70">
                    Photos de la publication ({images.length}) <span className="text-error">*</span>
                  </label>
                  <span className="text-[11px] text-primary font-semibold">
                    Sélection multiple supportée
                  </span>
                </div>

                {/* Zone de drop / upload */}
                <div className="relative border-2 border-dashed border-base-300 hover:border-primary/60 transition-colors rounded-2xl p-5 text-center bg-base-200/30">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploading}
                    onChange={handleMultipleFiles}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <span className="text-xs font-semibold text-primary">
                          {uploadProgress || "Téléversement des photos..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Upload className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-base-content">
                          Cliquez ou glissez-déposez vos photos ici
                        </span>
                        <span className="text-[11px] text-base-content/55">
                          PNG, JPG, WEBP jusqu'à 20 Mo par image
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Ajout d'URL directe (optionnel) */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    placeholder="Ou collez l'URL d'une image..."
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    className="input input-sm input-bordered flex-1 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualUrl}
                    className="btn btn-sm btn-ghost border border-base-300 rounded-xl text-xs font-bold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Ajouter</span>
                  </button>
                </div>

                {/* Liste des miniatures téléversées */}
                {images.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <span className="text-[11px] font-bold text-base-content/60">
                      Ordre des images (la 1ère sera mise en tête) :
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1">
                      {images.map((img, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-base-300 bg-neutral-900"
                        >
                          <Image
                            src={img.imageUrl}
                            alt={`Photo ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="120px"
                          />

                          {/* Index numéro */}
                          <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                            #{idx + 1}
                          </span>

                          {/* Bouton supprimer */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 h-6 w-6 rounded-md bg-error text-white flex items-center justify-center opacity-90 hover:opacity-100 transition"
                            title="Supprimer cette photo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          {/* 2 petites flèches pour changer l'ordre quand il y a plusieurs images */}
                          {images.length > 1 && (
                            <div className="absolute bottom-1 inset-x-1 flex items-center justify-between pointer-events-auto">
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, idx - 1)}
                                disabled={idx === 0}
                                title="Déplacer vers la gauche"
                                className="p-1 rounded bg-black/80 text-white hover:bg-black disabled:opacity-20 disabled:cursor-not-allowed"
                              >
                                <ArrowLeft className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, idx + 1)}
                                disabled={idx === images.length - 1}
                                title="Déplacer vers la droite"
                                className="p-1 rounded bg-black/80 text-white hover:bg-black disabled:opacity-20 disabled:cursor-not-allowed ml-auto"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Date, Statut & Mentions J'aime */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-base-content/70">
                    Date de parution
                  </label>
                  <input
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="input input-sm input-bordered w-full rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-base-content/70">
                    Statut de publication
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="select select-sm select-bordered w-full rounded-xl text-xs font-bold"
                  >
                    <option value="PUBLISHED">Publié (Visible au public)</option>
                    <option value="DRAFT">Brouillon (Non visible)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-base-content/70">
                    Mentions J'aime (Likes)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={likesCount}
                      onChange={(e) => setLikesCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="input input-sm input-bordered w-full rounded-xl text-xs font-bold pl-8 text-blue-600"
                      placeholder="0"
                    />
                    <ThumbsUp className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-600 fill-blue-600 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne Droite : Aperçu direct du rendu Facebook (5 cols) */}
            <div className="lg:col-span-5 flex flex-col space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-base-content/70">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Aperçu en temps réel du rendu</span>
              </div>

              {/* Mini simulateur de carte */}
              <div className="w-full bg-base-100 border border-base-300 rounded-2xl shadow-xs overflow-hidden text-xs">
                {/* Header preview */}
                <div className="flex items-center gap-2 p-3">
                  <div className="relative h-8 w-8 rounded-full border border-base-300 bg-white p-0.5 overflow-hidden shrink-0">
                    <Image
                      src="/images/logo.png"
                      alt="Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs truncate">
                      Assemblée Chrétienne de Goma - Kyeshero
                    </span>
                    <span className="text-[10px] text-base-content/50 flex items-center gap-1">
                      <span>1 j</span> • <Globe className="h-2.5 w-2.5" />
                    </span>
                  </div>
                </div>

                {/* Texte preview */}
                <div className="px-3 pb-2 text-xs text-base-content/90 font-normal line-clamp-3">
                  {title || "Votre texte de publication apparaîtra ici..."}
                </div>

                {/* Mosaïque preview */}
                <div className="w-full bg-neutral-900 aspect-video relative flex items-center justify-center overflow-hidden">
                  {images.length === 0 ? (
                    <div className="text-white/40 text-center p-4">
                      <Camera className="h-8 w-8 mx-auto mb-1 opacity-40" />
                      <span className="text-[11px]">Ajoutez des photos pour voir la mosaïque</span>
                    </div>
                  ) : images.length === 1 ? (
                    <Image
                      src={images[0].imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : images.length === 2 ? (
                    <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                      <div className="relative h-full w-full">
                        <Image src={images[0].imageUrl} alt="P1" fill className="object-cover" />
                      </div>
                      <div className="relative h-full w-full">
                        <Image src={images[1].imageUrl} alt="P2" fill className="object-cover" />
                      </div>
                    </div>
                  ) : images.length >= 5 ? (
                    <div className="flex flex-col gap-0.5 w-full h-full">
                      <div className="grid grid-cols-2 gap-0.5 h-3/5 w-full">
                        <div className="relative h-full w-full">
                          <Image src={images[0].imageUrl} alt="P1" fill className="object-cover" />
                        </div>
                        <div className="relative h-full w-full">
                          <Image src={images[1].imageUrl} alt="P2" fill className="object-cover" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-0.5 h-2/5 w-full">
                        <div className="relative h-full w-full">
                          <Image src={images[2].imageUrl} alt="P3" fill className="object-cover" />
                        </div>
                        <div className="relative h-full w-full">
                          <Image src={images[3].imageUrl} alt="P4" fill className="object-cover" />
                        </div>
                        <div className="relative h-full w-full">
                          <Image src={images[4].imageUrl} alt="P5" fill className="object-cover" />
                          {images.length > 5 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm">
                              +{images.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                      {images.map((img, i) => (
                        <div key={i} className="relative h-full w-full">
                          <Image src={img.imageUrl} alt={`P${i}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer preview */}
                <div className="border-t border-base-200 p-2 flex items-center justify-between text-[11px] text-base-content/60">
                  <div className={`flex items-center gap-1.5 ${likesCount > 0 ? "text-blue-600 font-bold" : ""}`}>
                    <ThumbsUp className={`h-3.5 w-3.5 ${likesCount > 0 ? "fill-blue-600 stroke-blue-600" : ""}`} />
                    <span>{likesCount > 0 ? `${likesCount} j'aime` : "J'aime"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Partager</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action en bas */}
          <div className="border-t border-base-200 pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="btn btn-ghost btn-sm rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading || images.length === 0}
              className="btn btn-primary btn-sm rounded-xl font-bold gap-1.5 shadow-sm"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{isEditing ? "Enregistrer les modifications" : "Publier l'événement photo"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
