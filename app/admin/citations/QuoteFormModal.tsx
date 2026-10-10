"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Upload, Loader2, Image as ImageIcon, Quote as QuoteIcon, Eye } from "lucide-react";
import { toast } from "sonner";
import { createSermonQuote, updateSermonQuote } from "@/actions/quotes";
import { uploadToImageKit } from "@/lib/upload-imagekit";
import { QuoteStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface QuoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteToEdit?: any | null;
}

export default function QuoteFormModal({
  isOpen,
  onClose,
  quoteToEdit,
}: QuoteFormModalProps) {
  const router = useRouter();
  const isEditing = Boolean(quoteToEdit);

  const [quote, setQuote] = useState(quoteToEdit?.quote || "");
  const [preacher, setPreacher] = useState(
    quoteToEdit?.preacher || "Pasteur de l'Église"
  );
  const [sermonTitle, setSermonTitle] = useState(
    quoteToEdit?.sermonTitle || ""
  );
  const [sermonDate, setSermonDate] = useState(
    quoteToEdit?.sermonDate
      ? new Date(quoteToEdit.sermonDate).toISOString().slice(0, 10)
      : ""
  );
  const [category, setCategory] = useState(quoteToEdit?.category || "Foi & Enseignement");
  const [status, setStatus] = useState<QuoteStatus>(
    quoteToEdit?.status || "PUBLISHED"
  );
  const [imageUrl, setImageUrl] = useState(quoteToEdit?.imageUrl || "");
  const [imageKitFileId, setImageKitFileId] = useState(
    quoteToEdit?.imageKitFileId || ""
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = useCallback(() => {
    setQuote("");
    setPreacher("Pasteur de l'Église");
    setSermonTitle("");
    setSermonDate("");
    setCategory("Foi & Enseignement");
    setStatus("PUBLISHED");
    setImageUrl("");
    setImageKitFileId("");
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (quoteToEdit) {
        setQuote(quoteToEdit.quote || "");
        setPreacher(quoteToEdit.preacher || "Pasteur de l'Église");
        setSermonTitle(quoteToEdit.sermonTitle || "");
        setSermonDate(
          quoteToEdit.sermonDate
            ? new Date(quoteToEdit.sermonDate).toISOString().slice(0, 10)
            : ""
        );
        setCategory(quoteToEdit.category || "Foi & Enseignement");
        setStatus(quoteToEdit.status || "PUBLISHED");
        setImageUrl(quoteToEdit.imageUrl || "");
        setImageKitFileId(quoteToEdit.imageKitFileId || "");
      } else {
        resetForm();
      }
    }
  }, [isOpen, quoteToEdit, resetForm]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await uploadToImageKit(file, "quotes");
      setImageUrl(res.url);
      setImageKitFileId(res.fileId);
      toast.success("Photo du prédicateur téléversée avec succès");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du téléversement");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote.trim() || !preacher.trim()) {
      toast.error("Veuillez renseigner la citation et le nom du prédicateur");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        quote: quote.trim(),
        preacher: preacher.trim(),
        sermonTitle: sermonTitle.trim() || null,
        sermonDate: sermonDate ? new Date(sermonDate) : null,
        category: category.trim() || null,
        status,
        imageUrl: imageUrl || null,
        imageKitFileId: imageKitFileId || null,
      };

      if (isEditing) {
        await updateSermonQuote(quoteToEdit.id, payload);
        toast.success("Citation mise à jour avec succès");
      } else {
        await createSermonQuote(payload);
        toast.success("Citation enregistrée avec succès");
        resetForm();
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement de la citation");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isEditing) resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-base-300 bg-base-100 shadow-2xl overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-base-300 px-6 py-4 bg-base-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <QuoteIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-base-content">
                {isEditing ? "Modifier la Citation" : "Nouvelle Citation de Prédication"}
              </h3>
              <p className="text-xs text-base-content/65">
                Mettez en avant une phrase forte prononcée lors d'un culte ou séminaire.
              </p>
            </div>
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
          {/* La Citation */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
              <span>Phrase / Citation forte</span>
              <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="« La foi ne consiste pas seulement à croire, mais aussi à marcher selon ce que nous croyons. »"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="textarea textarea-bordered w-full rounded-xl text-base italic leading-relaxed"
            />
          </div>

          {/* Prédicateur & Prédication */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                Prédicateur <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Pasteur / Ancien / Prédicateur"
                value={preacher}
                onChange={(e) => setPreacher(e.target.value)}
                className="input input-bordered w-full rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                Titre de la prédication
              </label>
              <input
                type="text"
                placeholder="Ex: Marcher par la foi"
                value={sermonTitle}
                onChange={(e) => setSermonTitle(e.target.value)}
                className="input input-bordered w-full rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Date, Thème & Statut */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                Date de la prédication
              </label>
              <input
                type="date"
                value={sermonDate}
                onChange={(e) => setSermonDate(e.target.value)}
                className="input input-bordered w-full rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                Thématique
              </label>
              <input
                type="text"
                placeholder="Ex: Foi, Prière, Grâce..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input input-bordered w-full rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                className="select select-bordered w-full rounded-xl text-sm font-semibold"
              >
                <option value="PUBLISHED">🟢 Publié</option>
                <option value="DRAFT">🟡 Brouillon</option>
              </select>
            </div>
          </div>

          {/* Photo du prédicateur ou illustration */}
          <div className="space-y-2 border-t border-base-200 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                Photo du prédicateur ou image d'illustration
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl("");
                    setImageKitFileId("");
                  }}
                  className="text-xs text-error hover:underline"
                >
                  Supprimer la photo
                </button>
              )}
            </div>

            {imageUrl ? (
              <div className="flex items-center gap-4 p-3 rounded-2xl border border-base-300 bg-base-200/50">
                <div className="relative h-20 w-20 rounded-xl overflow-hidden shrink-0 border border-base-300">
                  <Image
                    src={imageUrl}
                    alt={preacher}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 text-xs space-y-1">
                  <p className="font-bold text-base-content truncate">{preacher}</p>
                  <label className="btn btn-xs btn-outline btn-primary rounded-lg cursor-pointer">
                    <Upload className="h-3 w-3" />
                    <span>Changer de photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 h-28 rounded-2xl border-2 border-dashed border-base-300 hover:border-primary/60 transition cursor-pointer bg-base-200/50 hover:bg-base-200 text-center px-4">
                {isUploading ? (
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Téléversement...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-base-content">
                      Ajouter une photo (Prédicateur ou thème)
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>

          {/* Prévisualisation en direct */}
          {quote.trim() && (
            <div className="space-y-2 border-t border-base-200 pt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-base-content/50 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-secondary" />
                <span>Aperçu de la carte</span>
              </span>

              <div className="rounded-2xl border border-secondary/25 bg-gradient-to-br from-base-100 to-base-200/70 p-5 shadow-xs space-y-3 relative overflow-hidden">
                <QuoteIcon className="absolute top-2 right-2 h-16 w-16 text-secondary/10 -rotate-12 pointer-events-none" />

                <p className="text-base font-serif italic text-base-content leading-relaxed">
                  « {quote.trim()} »
                </p>

                <div className="flex items-center gap-3 pt-2 border-t border-base-300/60">
                  {imageUrl ? (
                    <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0 border border-secondary/30">
                      <Image
                        src={imageUrl}
                        alt={preacher}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/15 text-secondary font-black text-xs shrink-0">
                      {preacher.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 text-xs">
                    <p className="font-bold text-base-content truncate">{preacher}</p>
                    {sermonTitle && (
                      <p className="text-base-content/65 truncate">
                        Prédication : {sermonTitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
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
            disabled={isSaving || isUploading}
            className="btn btn-primary btn-sm rounded-xl font-bold gap-2 text-xs shadow-xs"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>
              {isEditing ? "Enregistrer les modifications" : "Publier la citation"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
