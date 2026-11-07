"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Upload, Loader2, Music, Mic, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createMedia, updateMedia } from "@/actions/media";
import { uploadToImageKit } from "@/lib/upload-imagekit";
import { useEdgeStore } from "@/lib/edgestore";
import { useRouter } from "next/navigation";

interface AudioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaToEdit?: any | null;
}

function normalizeAudioUrl(url: string): string {
  const trimmed = url.trim();
  // Support automatique des liens de partage Google Drive :
  // https://drive.google.com/file/d/FILE_ID/view... ou https://drive.google.com/open?id=FILE_ID
  const driveMatch =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (driveMatch && driveMatch[1] && (trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com"))) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }
  return trimmed;
}

export default function AudioFormModal({
  isOpen,
  onClose,
  mediaToEdit,
}: AudioFormModalProps) {
  const router = useRouter();
  const { edgestore } = useEdgeStore();
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

  const [audioSourceType, setAudioSourceType] = useState<"FILE" | "URL">("FILE");
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadProgressText, setUploadProgressText] = useState("");
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
    setUploadProgress(null);
    setUploadProgressText("");
    setAudioSourceType("FILE");
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
        setAudioSourceType(mediaToEdit.imageKitFileId ? "FILE" : "URL");
      } else {
        resetForm();
      }
    }
  }, [isOpen, mediaToEdit, resetForm]);

  if (!isOpen) return null;

  const handleAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMo = file.size / (1024 * 1024);
    const sizeMoFormatted = sizeMo.toFixed(1);

    // Limite globale de 150 Mo
    const MAX_ALLOWED_SIZE = 150 * 1024 * 1024;
    if (file.size > MAX_ALLOWED_SIZE) {
      toast.error(
        `Ce fichier pèse ${sizeMoFormatted} Mo. La limite maximale est de 150 Mo. Veuillez compresser votre fichier en MP3 ou utiliser l'option « Lien direct (URL) » ci-dessus.`
      );
      e.target.value = "";
      return;
    }

    try {
      setIsUploadingAudio(true);
      setUploadProgress(0);
      setAudioFileName(`${file.name} (${sizeMoFormatted} Mo)`);

      // 1. Si le fichier dépasse 28 Mo -> EdgeStore prend le relais pour les fichiers volumineux !
      if (file.size > 28 * 1024 * 1024) {
        toast.info(`Fichier volumineux (${sizeMoFormatted} Mo) : téléversement via EdgeStore en cours...`);

        try {
          const res = await edgestore.publicFiles.upload({
            file,
            onProgressChange: (progress) => {
              setUploadProgress(progress);
              const loadedMo = ((progress / 100) * sizeMo).toFixed(1);
              setUploadProgressText(`${progress}% (${loadedMo} / ${sizeMoFormatted} Mo) [EdgeStore]`);
            },
          });

          setAudioUrl(res.url);
          setImageKitFileId("");
          toast.success("Fichier audio volumineux téléversé avec succès via EdgeStore !");
        } catch (edgeErr: any) {
          console.error("Erreur EdgeStore:", edgeErr);
          const msg = edgeErr?.message || "";
          if (
            msg.includes("EDGE_STORE") ||
            msg.includes("access key") ||
            msg.includes("secret key") ||
            msg.includes("credentials") ||
            msg.includes("500")
          ) {
            toast.error(
              "Configuration EdgeStore manquante : veuillez ajouter EDGE_STORE_ACCESS_KEY et EDGE_STORE_SECRET_KEY dans .env (obtenues sur dashboard.edgestore.dev), ou utilisez l'onglet Lien direct."
            );
          } else {
            toast.error(msg || "Erreur lors du téléversement avec EdgeStore");
          }
        }
      } else {
        // 2. Fichier standard (<= 28 Mo) -> Téléversement standard via ImageKit
        const res = await uploadToImageKit(file, "audios", (progress) => {
          setUploadProgress(progress.percent);
          const loadedMo = (progress.loaded / (1024 * 1024)).toFixed(1);
          const totalMo = (progress.total / (1024 * 1024)).toFixed(1);
          setUploadProgressText(`${progress.percent}% (${loadedMo} / ${totalMo} Mo) [ImageKit]`);
        });

        setAudioUrl(res.url);
        setImageKitFileId(res.fileId);
        toast.success("Fichier audio téléversé avec succès via ImageKit !");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du téléversement audio");
    } finally {
      setIsUploadingAudio(false);
      setUploadProgress(null);
    }
  };

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image de couverture ne doit pas dépasser 5 Mo.");
      e.target.value = "";
      return;
    }

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
      toast.error("Veuillez renseigner le titre et charger un fichier audio ou coller un lien");
      return;
    }

    try {
      setIsSaving(true);
      const cleanAudioUrl = normalizeAudioUrl(audioUrl);
      if (!cleanAudioUrl) {
        toast.error("Veuillez renseigner un lien audio valide");
        return;
      }

      const payload = {
        title: title.trim(),
        speakerName: speakerName.trim() || null,
        type,
        description: description.trim() || null,
        audioUrl: cleanAudioUrl,
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

          {/* Section Source Audio : Téléversement ImageKit OU Lien direct */}
          <div className="rounded-xl border border-dashed border-base-300 bg-base-200/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-base-content/85">
                Fichier ou Lien Audio *
              </label>
              {audioUrl ? (
                <span className="inline-flex items-center gap-1 text-xs text-success font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Audio prêt</span>
                </span>
              ) : (
                <span className="badge badge-xs badge-ghost font-medium">Requis</span>
              )}
            </div>

            {/* Onglets de sélection du mode */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-base-200 border border-base-300">
              <button
                type="button"
                onClick={() => setAudioSourceType("FILE")}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  audioSourceType === "FILE"
                    ? "bg-base-100 text-primary shadow-xs"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                <Mic className="h-3.5 w-3.5" />
                <span>Téléverser MP3 (ImageKit &amp; EdgeStore)</span>
              </button>

              <button
                type="button"
                onClick={() => setAudioSourceType("URL")}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  audioSourceType === "URL"
                    ? "bg-base-100 text-primary shadow-xs"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                <LinkIcon className="h-3.5 w-3.5" />
                <span>Lien direct / Google Drive</span>
              </button>
            </div>

            {/* Mode 1 : Téléversement direct ImageKit / EdgeStore */}
            {audioSourceType === "FILE" && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-3">
                  <label className="btn btn-primary btn-sm rounded-xl gap-2 cursor-pointer">
                    {isUploadingAudio ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span>
                      {isUploadingAudio
                        ? "Téléversement..."
                        : audioUrl
                        ? "Remplacer le fichier"
                        : "Choisir un fichier audio"}
                    </span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFile}
                      className="hidden"
                      disabled={isUploadingAudio}
                    />
                  </label>

                  {audioFileName && (
                    <span className="text-xs text-base-content/80 font-medium truncate max-w-xs">
                      {audioFileName}
                    </span>
                  )}
                </div>

                {/* Barre de progression réelle */}
                {isUploadingAudio && uploadProgress !== null && (
                  <div className="space-y-1.5 pt-2 animate-in fade-in duration-200">
                    <div className="flex justify-between text-xs font-bold text-primary">
                      <span>Progression de l'envoi :</span>
                      <span>{uploadProgressText}</span>
                    </div>
                    <div className="h-2.5 w-full bg-base-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-150 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-base-content/60 leading-normal">
                  ⚡ <strong>Double moteur de téléversement :</strong> ImageKit gère les fichiers &le; 28 Mo, et <strong>EdgeStore</strong> prend automatiquement le relais pour les fichiers volumineux de plus de 28 Mo (jusqu'à <strong>150 Mo</strong>) !
                </p>
              </div>
            )}

            {/* Mode 2 : Lien externe direct / Google Drive */}
            {audioSourceType === "URL" && (
              <div className="space-y-2 pt-1">
                <input
                  type="url"
                  value={audioUrl}
                  onChange={(e) => {
                    const normalized = normalizeAudioUrl(e.target.value);
                    setAudioUrl(normalized);
                    setImageKitFileId("");
                    setAudioFileName("");
                  }}
                  placeholder="Collez ici le lien de partage Google Drive (ou lien direct MP3)"
                  className="input input-bordered input-sm w-full rounded-xl text-xs font-mono"
                />
                <div className="rounded-xl bg-base-100 p-3 border border-base-300 text-[11px] text-base-content/75 space-y-1.5">
                  <p className="font-bold text-primary flex items-center gap-1.5">
                    <span>📁 Comment faire avec Google Drive :</span>
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-base-content/75">
                    <li>Glissez votre audio MP3 sur votre <strong>Google Drive</strong>.</li>
                    <li>Faites un clic droit sur l'audio &gt; <strong>Partager</strong>.</li>
                    <li>Sous « Accès général », choisissez <strong>« Tous les utilisateurs disposant du lien »</strong>.</li>
                    <li>Cliquez sur <strong>Copier le lien</strong> et collez-le directement dans le champ ci-dessus.</li>
                  </ol>
                  <p className="text-[10px] text-success font-semibold pt-0.5">
                    ✓ Le système transforme automatiquement votre lien de partage en flux direct pour que les fidèles puissent l'écouter instantanément sur le site !
                  </p>
                </div>
              </div>
            )}

            {/* Lecteur d'aperçu rapide si un audio est sélectionné */}
            {audioUrl && !isUploadingAudio && (
              <div className="pt-2 border-t border-base-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 mb-1">
                  Aperçu de la lecture audio :
                </p>
                <audio controls src={audioUrl} className="h-8 w-full rounded-lg" />
              </div>
            )}
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
                <span className="text-xs text-success font-semibold">Pochette prête</span>
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
              className="textarea textarea-bordered w-full rounded-xl text-xs"
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
