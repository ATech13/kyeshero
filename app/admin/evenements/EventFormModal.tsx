"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Upload, Loader2, Calendar, Newspaper, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { createEvent, updateEvent } from "@/actions/events";
import { createPost, updatePost } from "@/actions/posts";
import { uploadToImageKit } from "@/lib/upload-imagekit";
import { PostCategory } from "@prisma/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

  // Type : Événement ou Actualité
  const [publicationType, setPublicationType] = useState<"EVENT" | "NEWS">(
    eventToEdit?.type === "NEWS" ? "NEWS" : "EVENT"
  );

  // Catégorie si c'est une actualité
  const [newsCategory, setNewsCategory] = useState<PostCategory>(
    (eventToEdit?.category as PostCategory) || "CHURCH_LIFE"
  );

  const [title, setTitle] = useState(eventToEdit?.title || "");
  const [description, setDescription] = useState(eventToEdit?.description || "");
  const [startAt, setStartAt] = useState(
    eventToEdit?.startAt || eventToEdit?.date
      ? new Date(eventToEdit.startAt || eventToEdit.date).toISOString().slice(0, 16)
      : ""
  );
  const [endAt, setEndAt] = useState(
    eventToEdit?.endAt
      ? new Date(eventToEdit.endAt).toISOString().slice(0, 16)
      : ""
  );
  const [location, setLocation] = useState(
    eventToEdit?.location || "Assemblée, Quartier Keshero, Goma"
  );
  const [contactInfo, setContactInfo] = useState(
    eventToEdit?.contactInfo || "+243 997 717 686"
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    eventToEdit?.coverImageUrl || ""
  );
  const [coverImageKitFileId, setCoverImageKitFileId] = useState(
    eventToEdit?.coverImageKitFileId || ""
  );
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">(
    eventToEdit?.status === "DRAFT" ? "DRAFT" : "PUBLISHED"
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = useCallback(() => {
    setPublicationType("EVENT");
    setNewsCategory("CHURCH_LIFE");
    setTitle("");
    setDescription("");
    setStartAt("");
    setEndAt("");
    setLocation("Assemblée, Quartier Keshero, Goma");
    setContactInfo("+243 997 717 686");
    setCoverImageUrl("");
    setCoverImageKitFileId("");
    setStatus("PUBLISHED");
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        setPublicationType(eventToEdit.type === "NEWS" ? "NEWS" : "EVENT");
        setNewsCategory((eventToEdit.category as PostCategory) || "CHURCH_LIFE");
        setTitle(eventToEdit.title || "");
        setDescription(eventToEdit.description || "");
        setStartAt(
          eventToEdit.startAt || eventToEdit.date
            ? new Date(eventToEdit.startAt || eventToEdit.date).toISOString().slice(0, 16)
            : ""
        );
        setEndAt(
          eventToEdit.endAt
            ? new Date(eventToEdit.endAt).toISOString().slice(0, 16)
            : ""
        );
        setLocation(eventToEdit.location || "Assemblée, Quartier Keshero, Goma");
        setContactInfo(eventToEdit.contactInfo || "+243 997 717 686");
        setCoverImageUrl(eventToEdit.coverImageUrl || "");
        setCoverImageKitFileId(eventToEdit.coverImageKitFileId || "");
        setStatus(eventToEdit.status === "DRAFT" ? "DRAFT" : "PUBLISHED");
      } else {
        resetForm();
      }
    }
  }, [isOpen, eventToEdit, resetForm]);

  if (!isOpen) return null;

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadToImageKit(file, publicationType === "EVENT" ? "events" : "posts");
      setCoverImageUrl(res.url);
      setCoverImageKitFileId(res.fileId);
      toast.success("Image téléversée avec succès");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du téléversement de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(
        publicationType === "EVENT"
          ? "Veuillez renseigner le titre du rassemblement"
          : "Veuillez renseigner le titre de l'actualité"
      );
      return;
    }

    if (publicationType === "EVENT" && !startAt) {
      toast.error("Veuillez renseigner la date et l'heure de début du rassemblement");
      return;
    }

    try {
      setIsSaving(true);

      if (publicationType === "EVENT") {
        const payload = {
          title: title.trim(),
          description: description.trim() || null,
          startAt: new Date(startAt),
          endAt: endAt ? new Date(endAt) : null,
          location: location.trim() || "Assemblée, Quartier Keshero, Goma",
          contactInfo: contactInfo.trim() || "+243 997 717 686",
          coverImageUrl: coverImageUrl || null,
          coverImageKitFileId: coverImageKitFileId || null,
          status,
        };

        if (isEditing && eventToEdit?.type !== "NEWS") {
          await updateEvent(eventToEdit.id, payload);
          toast.success("Événement mis à jour avec succès");
        } else {
          await createEvent(payload);
          toast.success("Événement publié avec succès");
          resetForm();
        }
      } else {
        // ACTUALITÉ (Post)
        const payload = {
          title: title.trim(),
          description: description.trim() || null,
          category: newsCategory,
          status,
          coverImageUrl: coverImageUrl || null,
          coverImageKitFileId: coverImageKitFileId || null,
          publishedAt: startAt ? new Date(startAt) : new Date(),
          eventDate: startAt ? new Date(startAt) : null,
        };

        if (isEditing && eventToEdit?.type === "NEWS") {
          await updatePost(eventToEdit.id, payload);
          toast.success("Actualité mise à jour avec succès");
        } else {
          await createPost(payload);
          toast.success("Actualité publiée avec succès");
          resetForm();
        }
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue lors de l'enregistrement");
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
      <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-base-100 p-4 sm:p-8 shadow-2xl border border-base-300 my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-base-200 pb-3 sm:pb-4 mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              publicationType === "EVENT" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
            }`}>
              {publicationType === "EVENT" ? <Calendar className="h-5 w-5" /> : <Newspaper className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-base-content truncate">
                {isEditing
                  ? publicationType === "EVENT" ? "Modifier l'événement" : "Modifier l'actualité"
                  : publicationType === "EVENT" ? "Créer un nouvel événement" : "Publier une actualité"}
              </h2>
              <p className="text-xs text-base-content/65 truncate">
                {publicationType === "EVENT"
                  ? "Planifiez un culte, séminaire ou veillée pour l'agenda de l'église."
                  : "Partagez une annonce officielle ou une nouvelle de la vie fraternelle."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-ghost btn-circle btn-sm shrink-0 text-base-content/70 hover:text-base-content"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SÉLECTEUR DU TYPE DE PUBLICATION : ÉVÉNEMENT OU ACTUALITÉ */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-primary">
              Nature de la publication *
            </label>
            <select
              value={publicationType}
              onChange={(e) => setPublicationType(e.target.value as "EVENT" | "NEWS")}
              className="select select-bordered w-full rounded-xl text-sm bg-base-100"
            >
              <option value="EVENT">Événement</option>
              <option value="NEWS">Actualité</option>
            </select>
          </div>

          {/* Catégorie spécifique si c'est une actualité */}
          {publicationType === "NEWS" && (
            <div>
              <label className="block text-xs font-bold text-base-content/75 mb-1">
                Catégorie de l'actualité
              </label>
              <select
                value={newsCategory}
                onChange={(e) => setNewsCategory(e.target.value as PostCategory)}
                className="select select-bordered w-full rounded-xl text-sm font-semibold"
              >
                <option value="CHURCH_LIFE">Vie de l'Église</option>
                <option value="ANNOUNCEMENT">Annonce officielle</option>
                <option value="CONSTRUCTION">Travaux &amp; Construction</option>
                <option value="ACTIVITY">Activité &amp; Réunion</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
          )}

          {/* Titre */}
          <div>
            <label className="block text-xs font-bold text-base-content/75 mb-1">
              {publicationType === "EVENT" ? "Titre du rassemblement / événement *" : "Titre de l'actualité / annonce *"}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                publicationType === "EVENT"
                  ? "Ex: Culte d'Adoration & Louange"
                  : "Ex: Communiqué important concernant les cultes de semaine"
              }
              className="input input-bordered w-full rounded-xl text-sm font-medium"
            />
          </div>

          {/* Dates selon le type */}
          {publicationType === "EVENT" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-base-content/75 mb-1">
                  Date et heure de début *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="input input-bordered w-full rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-base-content/75 mb-1">
                  Date et heure de fin (optionnel)
                </label>
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="input input-bordered w-full rounded-xl text-xs"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-base-content/75 mb-1">
                Date de l'actualité (optionnelle - par défaut aujourd'hui)
              </label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="input input-bordered w-full rounded-xl text-xs"
              />
            </div>
          )}

          {/* Lieu & Contact (spécifiques aux événements) */}
          {publicationType === "EVENT" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-base-content/75 mb-1">
                  Lieu de rassemblement
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Assemblée, Keshero, Goma"
                  className="input input-bordered w-full rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-base-content/75 mb-1">
                  Téléphone de contact
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="+243..."
                  className="input input-bordered w-full rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {/* Description / Contenu */}
          <div>
            <label className="block text-xs font-bold text-base-content/75 mb-1">
              {publicationType === "EVENT"
                ? "Description ou programme détaillé"
                : "Contenu ou texte officiel de l'actualité *"}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={
                publicationType === "EVENT"
                  ? "Programme, prédicateur invité, recommandations..."
                  : "Rédigez le texte ou message complet de l'actualité..."
              }
              className="textarea textarea-bordered w-full rounded-xl text-sm leading-relaxed"
            />
          </div>

          {/* Photo de couverture */}
          <div>
            <label className="block text-xs font-bold text-base-content/75 mb-1">
              Photo d'illustration
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="btn btn-outline btn-sm rounded-xl gap-2 cursor-pointer text-xs">
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>Choisir une photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>

              {coverImageUrl && (
                <div className="relative h-12 w-20 overflow-hidden rounded-lg border border-base-300">
                  <Image
                    src={coverImageUrl}
                    alt="Aperçu"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImageUrl("");
                      setCoverImageKitFileId("");
                    }}
                    className="btn btn-circle btn-error btn-xs absolute top-1 right-1 opacity-80 hover:opacity-100"
                    title="Supprimer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Statut de visibilité */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-base-content/75 mb-1">
              Statut de publication
            </label>
            <div className="flex gap-4">
              <label className="label cursor-pointer gap-2">
                <input
                  type="radio"
                  name="event-status"
                  value="PUBLISHED"
                  checked={status === "PUBLISHED"}
                  onChange={() => setStatus("PUBLISHED")}
                  className="radio radio-primary radio-sm"
                />
                <span className="text-xs font-medium">🟢 Publié (visible en ligne)</span>
              </label>
              <label className="label cursor-pointer gap-2">
                <input
                  type="radio"
                  name="event-status"
                  value="DRAFT"
                  checked={status === "DRAFT"}
                  onChange={() => setStatus("DRAFT")}
                  className="radio radio-sm"
                />
                <span className="text-xs font-medium">🟡 Brouillon (privé)</span>
              </label>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost btn-sm rounded-xl text-xs font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="btn btn-primary btn-sm rounded-xl px-5 font-bold text-xs"
            >
              {isSaving
                ? "Enregistrement..."
                : isEditing
                ? "Mettre à jour"
                : publicationType === "EVENT"
                ? "Publier l'événement"
                : "Publier l'actualité"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
