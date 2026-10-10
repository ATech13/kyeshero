"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Upload, Loader2, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createPost, updatePost } from "@/actions/posts";
import { POST_CATEGORY_LABELS } from "@/lib/post-constants";
import { uploadToImageKit } from "@/lib/upload-imagekit";
import { PostCategory, PostStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  postToEdit?: any | null;
  onSuccess?: (savedPost?: any) => void;
}

export default function PostFormModal({
  isOpen,
  onClose,
  postToEdit,
  onSuccess,
}: PostFormModalProps) {
  const router = useRouter();
  const isEditing = Boolean(postToEdit);

  const [title, setTitle] = useState(postToEdit?.title || "");
  const [description, setDescription] = useState(postToEdit?.description || "");
  const [category, setCategory] = useState<PostCategory>(
    postToEdit?.category || "CHURCH_LIFE"
  );
  const [status, setStatus] = useState<PostStatus>(
    postToEdit?.status || "PUBLISHED"
  );
  const [eventDate, setEventDate] = useState(
    postToEdit?.eventDate
      ? new Date(postToEdit.eventDate).toISOString().slice(0, 10)
      : ""
  );

  // Image principale
  const [coverImageUrl, setCoverImageUrl] = useState(
    postToEdit?.coverImageUrl || ""
  );
  const [coverImageKitFileId, setCoverImageKitFileId] = useState(
    postToEdit?.coverImageKitFileId || ""
  );
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Galerie d'images secondaires (ex: plusieurs photos de travaux)
  const [galleryImages, setGalleryImages] = useState<
    Array<{ imageUrl: string; imageKitFileId?: string; caption?: string }>
  >(
    postToEdit?.images?.map((img: any) => ({
      imageUrl: img.imageUrl,
      imageKitFileId: img.imageKitFileId || "",
      caption: img.caption || "",
    })) || []
  );
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setCategory("CHURCH_LIFE");
    setStatus("PUBLISHED");
    setEventDate("");
    setCoverImageUrl("");
    setCoverImageKitFileId("");
    setGalleryImages([]);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (postToEdit) {
        setTitle(postToEdit.title || "");
        setDescription(postToEdit.description || "");
        setCategory(postToEdit.category || "CHURCH_LIFE");
        setStatus(postToEdit.status || "PUBLISHED");
        setEventDate(
          postToEdit.eventDate
            ? new Date(postToEdit.eventDate).toISOString().slice(0, 10)
            : ""
        );
        setCoverImageUrl(postToEdit.coverImageUrl || "");
        setCoverImageKitFileId(postToEdit.coverImageKitFileId || "");
        setGalleryImages(
          postToEdit.images?.map((img: any) => ({
            imageUrl: img.imageUrl,
            imageKitFileId: img.imageKitFileId || "",
            caption: img.caption || "",
          })) || []
        );
      } else {
        resetForm();
      }
    }
  }, [isOpen, postToEdit, resetForm]);

  if (!isOpen) return null;

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      const res = await uploadToImageKit(file, "posts");
      setCoverImageUrl(res.url);
      setCoverImageKitFileId(res.fileId);
      toast.success("Photo principale téléversée avec succès");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du téléversement");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingGallery(true);
      const uploadPromises = Array.from(files).map((file) =>
        uploadToImageKit(file, "posts")
      );
      const results = await Promise.all(uploadPromises);

      const newImages = results.map((r) => ({
        imageUrl: r.url,
        imageKitFileId: r.fileId,
        caption: "",
      }));

      setGalleryImages((prev) => [...prev, ...newImages]);
      toast.success(`${results.length} photo(s) ajoutée(s) à la galerie`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi des photos");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCaption = (index: number, caption: string) => {
    setGalleryImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, caption } : img))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Veuillez renseigner au moins le titre de la publication");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        category,
        status,
        eventDate: eventDate ? new Date(eventDate) : null,
        coverImageUrl: coverImageUrl || null,
        coverImageKitFileId: coverImageKitFileId || null,
        galleryImages,
      };

      let savedResult: any = null;
      if (isEditing) {
        const res = await updatePost(postToEdit.id, payload);
        savedResult = (res as any)?.post || res;
        toast.success("Publication mise à jour avec succès");
      } else {
        const res = await createPost(payload);
        savedResult = (res as any)?.post || res;
        toast.success("Publication créée avec succès");
        resetForm();
      }

      router.refresh();
      if (onSuccess) {
        onSuccess(savedResult);
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isEditing) {
      resetForm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-base-300 bg-base-100 shadow-2xl overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-base-300 px-6 py-4 bg-base-100">
          <div>
            <h3 className="text-lg font-black text-base-content">
              {isEditing ? "Modifier la Publication" : "Nouvelle Publication"}
            </h3>
            <p className="text-xs text-base-content/65">
              Partagez les travaux, actualités ou annonces de la vie de l'église.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-base-content"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulaire avec scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Titre */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
              Titre de la publication <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Avancement des travaux de notre nouvelle salle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-bordered w-full rounded-xl text-sm"
            />
          </div>

          {/* Catégorie & Statut */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="select select-bordered w-full rounded-xl text-sm font-medium"
              >
                {Object.entries(POST_CATEGORY_LABELS).map(([catKey, label]) => (
                  <option key={catKey} value={catKey}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                Statut de publication
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PostStatus)}
                className="select select-bordered w-full rounded-xl text-sm font-semibold"
              >
                <option value="PUBLISHED">🟢 Publié (visible sur le site)</option>
                <option value="DRAFT">🟡 Brouillon (privé)</option>
              </select>
            </div>
          </div>

          {/* Date de l'événement ou des travaux */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
              Date concernée (Optionnelle - ex: jour des travaux)
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="input input-bordered w-full rounded-xl text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
              Contenu & Description
            </label>
            <textarea
              rows={4}
              placeholder="Expliquez en quelques lignes les détails, l'avancement ou le message..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered w-full rounded-xl text-sm leading-relaxed"
            />
          </div>

          {/* Photo Principale (Couverture) */}
          <div className="space-y-2 border-t border-base-200 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                Photo principale de couverture
              </label>
              {coverImageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setCoverImageUrl("");
                    setCoverImageKitFileId("");
                  }}
                  className="text-xs text-error hover:underline"
                >
                  Supprimer
                </button>
              )}
            </div>

            {coverImageUrl ? (
              <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-base-300 group">
                <Image
                  src={coverImageUrl}
                  alt="Aperçu couverture"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="btn btn-sm btn-primary cursor-pointer gap-2 font-bold rounded-xl">
                    <Upload className="h-4 w-4" />
                    <span>Remplacer l'image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverUpload}
                      disabled={isUploadingCover}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 h-36 rounded-2xl border-2 border-dashed border-base-300 hover:border-primary/60 transition cursor-pointer bg-base-200/50 hover:bg-base-200 text-center px-4">
                {isUploadingCover ? (
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Téléversement en cours...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-base-content">
                      Cliquez pour choisir la photo principale
                    </span>
                    <span className="text-[11px] text-base-content/50">
                      JPG, PNG, WEBP (Max 5 Mo)
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                  disabled={isUploadingCover}
                />
              </label>
            )}
          </div>

          {/* Galerie de photos supplémentaires (Multi-images) */}
          <div className="space-y-3 border-t border-base-200 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                  Photos supplémentaires (Galerie des travaux)
                </label>
                <p className="text-[11px] text-base-content/50">
                  Ajoutez plusieurs photos pour illustrer l'avancement.
                </p>
              </div>
              <label className="btn btn-xs btn-outline btn-primary rounded-lg font-bold gap-1.5 cursor-pointer">
                {isUploadingGallery ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                <span>Ajouter des photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleGalleryUpload}
                  disabled={isUploadingGallery}
                />
              </label>
            </div>

            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl border border-base-300 bg-base-200/50 p-2 space-y-1.5 group"
                  >
                    <div className="relative h-24 w-full rounded-lg overflow-hidden">
                      <Image
                        src={img.imageUrl}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="btn btn-circle btn-error btn-xs absolute top-1 right-1 opacity-90 hover:opacity-100"
                        title="Supprimer cette photo"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Légende (facultative)"
                      value={img.caption || ""}
                      onChange={(e) => updateCaption(idx, e.target.value)}
                      className="input input-xs input-bordered w-full rounded-lg text-[11px]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Pied de page du modal */}
        <div className="flex items-center justify-end gap-3 border-t border-base-300 px-6 py-4 bg-base-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="btn btn-ghost btn-sm rounded-xl text-xs font-semibold"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || isUploadingCover || isUploadingGallery}
            className="btn btn-primary btn-sm rounded-xl font-bold gap-2 text-xs shadow-xs"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>
              {isEditing ? "Enregistrer les modifications" : "Publier l'actualité"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
