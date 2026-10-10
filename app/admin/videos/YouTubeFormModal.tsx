"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Youtube, CheckCircle2, AlertCircle, Loader2, RefreshCw, Video } from "lucide-react";
import { toast } from "sonner";
import { createYouTubeVideo, getYouTubeVideoMetadata, getFacebookVideoMetadata } from "@/actions/videos";
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from "@/lib/youtube";
import { detectVideoPlatform, VideoPlatform } from "@/lib/video-platforms";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

interface YouTubeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function YouTubeFormModal({
  isOpen,
  onClose,
}: YouTubeFormModalProps) {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [channelName, setChannelName] = useState("Assemblée Chrétienne Goma Keshero");
  const [tiktokCategory, setTiktokCategory] = useState<"CLIP" | "SONG" | "SHORT">("CLIP");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [autoFetchedTitle, setAutoFetchedTitle] = useState("");

  const platform: VideoPlatform = detectVideoPlatform(videoUrl);
  const detectedYouTubeId = extractYouTubeVideoId(videoUrl);
  const isRecognized =
    Boolean(detectedYouTubeId) ||
    platform === "FACEBOOK" ||
    platform === "TIKTOK" ||
    videoUrl.trim().length > 15;

  const previewThumbnail = detectedYouTubeId
    ? getYouTubeThumbnailUrl(detectedYouTubeId)
    : "/images/church.jpeg";

  const lastFetchedIdRef = useRef<string | null>(null);

  const resetForm = useCallback(() => {
    setVideoUrl("");
    setTitle("");
    setDescription("");
    setChannelName("Assemblée Chrétienne Goma Keshero");
    setTiktokCategory("CLIP");
    setAutoFetchedTitle("");
    lastFetchedIdRef.current = null;
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Récupération automatique du titre si YouTube
  const fetchYouTubeMetadata = useCallback(async (videoId: string, isManual = false) => {
    try {
      setIsLoadingMeta(true);
      const res = await getYouTubeVideoMetadata(videoId);

      if (res.success && res.title) {
        setTitle(res.title);
        setAutoFetchedTitle(res.title);
        if (res.authorName) {
          setChannelName(res.authorName);
        }
        lastFetchedIdRef.current = videoId;
        toast.success(
          isManual
            ? "Titre actualisé depuis YouTube !"
            : "Titre récupéré automatiquement depuis YouTube !"
        );
      } else if (isManual) {
        toast.error(res.error || "Impossible de récupérer le titre");
      }
    } catch {
      if (isManual) {
        toast.error("Erreur lors de la récupération des informations");
      }
    } finally {
      setIsLoadingMeta(false);
    }
  }, []);

  // Récupération automatique du titre si Facebook
  const fetchFacebookMetadata = useCallback(async (url: string, isManual = false) => {
    try {
      setIsLoadingMeta(true);
      const res = await getFacebookVideoMetadata(url);

      if (res.success && res.title) {
        setTitle(res.title);
        setAutoFetchedTitle(res.title);
        if (res.authorName) {
          setChannelName(res.authorName);
        }
        lastFetchedIdRef.current = url;
        toast.success(
          isManual
            ? "Titre actualisé depuis Facebook !"
            : "Titre récupéré automatiquement depuis Facebook !"
        );
      } else if (isManual) {
        toast.error(res.error || "Impossible de récupérer le titre Facebook");
      }
    } catch {
      if (isManual) {
        toast.error("Erreur lors de la récupération des informations Facebook");
      }
    } finally {
      setIsLoadingMeta(false);
    }
  }, []);

  // Détection automatique dès que l'ID YouTube ou l'URL Facebook change
  useEffect(() => {
    if (detectedYouTubeId) {
      if (detectedYouTubeId !== lastFetchedIdRef.current) {
        fetchYouTubeMetadata(detectedYouTubeId);
      }
    } else if (
      platform === "FACEBOOK" &&
      (videoUrl.includes("/videos/") || videoUrl.includes("/watch") || videoUrl.includes("fb.watch") || videoUrl.includes("/reel/"))
    ) {
      const trimmedUrl = videoUrl.trim();
      if (trimmedUrl !== lastFetchedIdRef.current) {
        fetchFacebookMetadata(trimmedUrl);
      }
    } else if (!detectedYouTubeId && platform !== "FACEBOOK") {
      lastFetchedIdRef.current = null;
      setAutoFetchedTitle("");
    }
  }, [detectedYouTubeId, platform, videoUrl, fetchYouTubeMetadata, fetchFacebookMetadata]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      toast.error("Veuillez saisir une URL de vidéo valide");
      return;
    }
    if (!title.trim()) {
      toast.error("Veuillez indiquer un titre pour la vidéo");
      return;
    }

    try {
      setIsSaving(true);

      // Adaptation du titre / nom de canal selon la règle ecclésiastique :
      // - YouTube & Facebook : Prédication complète
      // - TikTok : Extraits, chants ou courtes vidéos
      let finalChannel = channelName.trim() || `Assemblée Chrétienne Goma (${platform})`;
      let finalDescription = description.trim();

      if (platform === "TIKTOK") {
        if (tiktokCategory === "SONG") {
          finalChannel = `${finalChannel} · Chant`;
          if (!finalDescription.includes("[Chant]")) {
            finalDescription = `[Chant & Louange] ${finalDescription}`.trim();
          }
        } else if (tiktokCategory === "CLIP") {
          finalChannel = `${finalChannel} · Extrait`;
          if (!finalDescription.includes("[Extrait]")) {
            finalDescription = `[Extrait de prédication] ${finalDescription}`.trim();
          }
        } else {
          finalChannel = `${finalChannel} · Court`;
          if (!finalDescription.includes("[Courte vidéo]")) {
            finalDescription = `[Courte vidéo] ${finalDescription}`.trim();
          }
        }
      }

      await createYouTubeVideo({
        youtubeUrl: videoUrl.trim(),
        title: title.trim(),
        description: finalDescription || null,
        channelName: finalChannel,
        status: "PUBLISHED" as const,
      });

      toast.success(`Vidéo ${platform} ajoutée avec succès !`);
      resetForm();
      router.refresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Impossible d'ajouter la vidéo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-base-100 p-4 sm:p-7 shadow-2xl border border-base-300 my-auto sm:my-8">
        <div className="flex items-center justify-between border-b border-base-200 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-base-content">
              Ajouter une vidéo externe
            </h2>
          </div>
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-base-content/75">
                Lien de la vidéo (YouTube, Facebook, TikTok) *
              </label>
              <div className="flex items-center gap-1.5 text-[11px] font-bold">
                <span className="text-error flex items-center gap-0.5"><Youtube className="h-3 w-3" /> YouTube</span>
                <span>·</span>
                <span className="text-[#1877F2] flex items-center gap-0.5"><FacebookIcon className="h-3 w-3" /> Facebook</span>
                <span>·</span>
                <span className="text-base-content flex items-center gap-0.5"><TikTokIcon className="h-3 w-3 text-[#00f2fe]" /> TikTok</span>
              </div>
            </div>
            <input
              type="text"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Collez le lien YouTube, Facebook ou TikTok..."
              className="input input-bordered w-full rounded-xl text-sm"
            />
            <p className="text-[11px] text-base-content/60 mt-1">
              Les vidéos ne sont pas stockées sur notre serveur : seules l'URL et les métadonnées officielles sont conservées.
            </p>
          </div>

          {/* Détection & Plateforme reconnue */}
          {videoUrl.length > 8 && (
            <div className="rounded-xl border border-base-300 bg-base-200/50 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  <span>
                    Plateforme détectée : <strong className="text-primary">{platform}</strong>
                  </span>
                </div>
                {isLoadingMeta && (
                  <span className="flex items-center gap-1.5 text-xs text-primary font-normal">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Chargement des infos...
                  </span>
                )}
              </div>

              {detectedYouTubeId && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-base-200 border border-base-300">
                  <Image
                    src={previewThumbnail}
                    alt="Aperçu vidéo"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Règle spécifique selon la plateforme */}
              {platform === "TIKTOK" ? (
                <div className="rounded-xl border border-base-300 bg-base-100 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-base-content/85">
                      Type de publication TikTok *
                    </label>
                    <span className="text-[10px] text-base-content/50">Règle médiathèque</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTiktokCategory("CLIP")}
                      className={`p-2 rounded-xl border text-center text-xs font-bold transition ${
                        tiktokCategory === "CLIP"
                          ? "border-primary bg-primary/10 text-primary shadow-2xs"
                          : "border-base-300 bg-base-200/50 text-base-content/75 hover:bg-base-200"
                      }`}
                    >
                      Extrait Prédication
                    </button>
                    <button
                      type="button"
                      onClick={() => setTiktokCategory("SONG")}
                      className={`p-2 rounded-xl border text-center text-xs font-bold transition ${
                        tiktokCategory === "SONG"
                          ? "border-secondary bg-secondary/10 text-secondary shadow-2xs"
                          : "border-base-300 bg-base-200/50 text-base-content/75 hover:bg-base-200"
                      }`}
                    >
                      Chant & Louange
                    </button>
                    <button
                      type="button"
                      onClick={() => setTiktokCategory("SHORT")}
                      className={`p-2 rounded-xl border text-center text-xs font-bold transition ${
                        tiktokCategory === "SHORT"
                          ? "border-accent bg-accent/10 text-accent shadow-2xs"
                          : "border-base-300 bg-base-200/50 text-base-content/75 hover:bg-base-200"
                      }`}
                    >
                      Courte Vidéo
                    </button>
                  </div>
                  <p className="text-[10px] text-base-content/60">
                    Sur TikTok, nous publions les extraits de prédications, des chants et courtes vidéos.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs space-y-1">
                  <span className="font-bold text-primary block">
                    Publication : Prédication & Culte
                  </span>
                  <p className="text-[11px] text-base-content/70">
                    Sur {platform === "FACEBOOK" ? "Facebook" : "YouTube"}, nous publions exclusivement les cultes complets et prédications.
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-base-content/75">
                Titre de la vidéo *
              </label>
              {(detectedYouTubeId || platform === "FACEBOOK") && (
                <button
                  type="button"
                  onClick={() => {
                    if (detectedYouTubeId) {
                      fetchYouTubeMetadata(detectedYouTubeId, true);
                    } else if (platform === "FACEBOOK") {
                      fetchFacebookMetadata(videoUrl.trim(), true);
                    }
                  }}
                  disabled={isLoadingMeta}
                  className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                  title={`Récupérer à nouveau le titre depuis ${platform === "FACEBOOK" ? "Facebook" : "YouTube"}`}
                >
                  {isLoadingMeta ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Récupération...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3" />
                      <span>Récupérer depuis {platform === "FACEBOOK" ? "Facebook" : "YouTube"}</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Culte d'adoration & message de résurrection"
                className="input input-bordered w-full rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-base-content/75 mb-1">
              Nom de la page ou chaîne
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="Ex: Assemblée Chrétienne Goma Keshero"
              className="input input-bordered w-full rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-base-content/75 mb-1">
              Description ou thématique abordée
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Résumé du message, passages bibliques..."
              className="textarea textarea-bordered w-full rounded-xl text-sm"
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
              disabled={isSaving || !videoUrl.trim() || !title.trim() || isLoadingMeta}
              className="btn btn-primary btn-sm rounded-xl px-5 font-bold"
            >
              {isSaving ? "Ajout en cours..." : "Ajouter à la médiathèque"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
