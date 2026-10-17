"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ThumbsUp, Share2, Globe, X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { likePhotoPublication, type PhotoPublication } from "@/actions/events";

interface PhotoPublicationCardProps {
  publication: PhotoPublication;
}

export default function PhotoPublicationCard({ publication }: PhotoPublicationCardProps) {
  const [likes, setLikes] = useState<number>(publication.likesCount ?? 0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    setLikes(publication.likesCount ?? 0);
  }, [publication.likesCount]);

  // Vérifier si l'utilisateur a déjà liké cette publication localement
  useEffect(() => {
    try {
      const likedStorage = localStorage.getItem(`post_liked_${publication.id}`);
      if (likedStorage === "true") {
        setHasLiked(true);
      }
    } catch {
      // Ignorer si localStorage non disponible
    }
  }, [publication.id]);

  // Gestion du like avec retour optimiste
  const handleLike = async () => {
    if (hasLiked || isLiking) return;

    setLikes((prev) => prev + 1);
    setHasLiked(true);
    setIsLiking(true);

    try {
      localStorage.setItem(`post_liked_${publication.id}`, "true");
      const res = await likePhotoPublication(publication.id);
      if (res.success && typeof res.likesCount === "number") {
        setLikes(res.likesCount);
      }
    } catch (err) {
      console.error("Erreur lors de la mention j'aime:", err);
    } finally {
      setIsLiking(false);
    }
  };

  // Gestion du partage (Web Share API ou Copier dans le presse-papier)
  const handleShare = async () => {
    const postUrl = typeof window !== "undefined" 
      ? `${window.location.origin}/evenements/${publication.slug}`
      : `/evenements/${publication.slug}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Assemblée Chrétienne de Goma - Kyeshero",
          text: publication.title,
          url: postUrl,
        });
        return;
      } catch (err) {
        // Annulé par l'utilisateur ou non supporté
      }
    }

    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success("Lien copié dans le presse-papier !");
    } catch {
      toast.error("Impossible de copier le lien.");
    }
  };

  // Formatage de la date relative ou absolue
  const formatPublicationDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return "À l'instant";
    if (diffHours < 24) return `${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 j";
    if (diffDays < 7) return `${diffDays} j`;

    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const images = publication.images || [];
  const totalImages = images.length;

  // Clavier pour la lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, images.length]);

  return (
    <>
      <article className="w-full max-w-2xl mx-auto bg-base-100 border border-base-200/90 rounded-2xl shadow-xs overflow-hidden transition-all duration-200 hover:shadow-sm">
        {/* ======================================================== */}
        {/* 1. EN-TÊTE DU POST (AVATAR ÉGLISE + NOM + HEURE + GLOBE) */}
        {/* ======================================================== */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2.5">
          {/* Logo / Avatar officiel de l'Assemblée */}
          <div className="relative h-11 w-11 shrink-0 rounded-full border border-base-300 bg-white p-0.5 shadow-xs overflow-hidden flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Assemblée Chrétienne de Goma"
              fill
              className="object-contain p-0.5"
            />
          </div>

          {/* Nom de la page & Date de parution */}
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-[15px] sm:text-base text-base-content leading-tight truncate hover:underline cursor-pointer">
              Assemblée Chrétienne de Goma - Kyeshero
            </span>
            <div className="flex items-center gap-1.5 text-xs text-base-content/60 mt-0.5">
              <span>{formatPublicationDate(publication.publishedAt)}</span>
              <span>•</span>
              <Globe className="h-3 w-3 text-base-content/50" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. TEXTE / LÉGENDE DE LA PUBLICATION                   */}
        {/* ======================================================== */}
        {publication.title && (
          <div className="px-4 pt-1 pb-3">
            <p className="text-[15px] sm:text-[16px] text-base-content font-normal leading-relaxed whitespace-pre-line select-text">
              {publication.title}
            </p>
            {publication.description && publication.description !== publication.title && (
              <p className="mt-1.5 text-sm text-base-content/80 leading-relaxed whitespace-pre-line">
                {publication.description}
              </p>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. MOSAÏQUE DES PHOTOS (CONFORME STRICTEMENT À L'IMAGE) */}
        {/* ======================================================== */}
        {totalImages > 0 && (
          <div className="w-full bg-base-200/40 select-none overflow-hidden">
            {/* Cas 1 : 1 seule photo */}
            {totalImages === 1 && (
              <div
                onClick={() => setLightboxIndex(0)}
                className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[520px] cursor-pointer overflow-hidden group bg-neutral-900"
              >
                <Image
                  src={images[0].imageUrl}
                  alt={images[0].caption || publication.title}
                  fill
                  className="object-cover group-hover:scale-[1.01] transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 672px"
                />
              </div>
            )}

            {/* Cas 2 : 2 photos côte à côte */}
            {totalImages === 2 && (
              <div className="grid grid-cols-2 gap-1 w-full h-64 sm:h-84">
                {images.slice(0, 2).map((img, idx) => (
                  <div
                    key={img.id || idx}
                    onClick={() => setLightboxIndex(idx)}
                    className="relative h-full w-full cursor-pointer overflow-hidden group bg-neutral-900"
                  >
                    <Image
                      src={img.imageUrl}
                      alt={img.caption || `Photo ${idx + 1}`}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 336px"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Cas 3 : 3 photos (1 en haut, 2 en bas) */}
            {totalImages === 3 && (
              <div className="flex flex-col gap-1 w-full">
                <div
                  onClick={() => setLightboxIndex(0)}
                  className="relative w-full h-56 sm:h-72 cursor-pointer overflow-hidden group bg-neutral-900"
                >
                  <Image
                    src={images[0].imageUrl}
                    alt={images[0].caption || "Photo 1"}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 672px"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1 w-full h-44 sm:h-56">
                  {images.slice(1, 3).map((img, idx) => (
                    <div
                      key={img.id || idx + 1}
                      onClick={() => setLightboxIndex(idx + 1)}
                      className="relative h-full w-full cursor-pointer overflow-hidden group bg-neutral-900"
                    >
                      <Image
                        src={img.imageUrl}
                        alt={img.caption || `Photo ${idx + 2}`}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 336px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cas 4 : 4 photos (2 en haut, 2 en bas) */}
            {totalImages === 4 && (
              <div className="grid grid-cols-2 gap-1 w-full h-72 sm:h-96">
                {images.slice(0, 4).map((img, idx) => (
                  <div
                    key={img.id || idx}
                    onClick={() => setLightboxIndex(idx)}
                    className="relative h-full w-full cursor-pointer overflow-hidden group bg-neutral-900"
                  >
                    <Image
                      src={img.imageUrl}
                      alt={img.caption || `Photo ${idx + 1}`}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 336px"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Cas 5 ou plus : EXACTEMENT COMME SUR L'IMAGE (2 EN HAUT, 3 EN BAS AVEC +N) */}
            {totalImages >= 5 && (
              <div className="flex flex-col gap-1 w-full">
                {/* Ligne du haut : 2 photos égales */}
                <div className="grid grid-cols-2 gap-1 w-full h-56 sm:h-72">
                  {images.slice(0, 2).map((img, idx) => (
                    <div
                      key={img.id || idx}
                      onClick={() => setLightboxIndex(idx)}
                      className="relative h-full w-full cursor-pointer overflow-hidden group bg-neutral-900"
                    >
                      <Image
                        src={img.imageUrl}
                        alt={img.caption || `Photo ${idx + 1}`}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, 336px"
                      />
                    </div>
                  ))}
                </div>

                {/* Ligne du bas : 3 photos (la 3ème possède l'overlay +N si total > 5) */}
                <div className="grid grid-cols-3 gap-1 w-full h-36 sm:h-48">
                  {/* Photo 3 (index 2) */}
                  <div
                    onClick={() => setLightboxIndex(2)}
                    className="relative h-full w-full cursor-pointer overflow-hidden group bg-neutral-900"
                  >
                    <Image
                      src={images[2].imageUrl}
                      alt={images[2].caption || "Photo 3"}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      sizes="(max-width: 768px) 33vw, 224px"
                    />
                  </div>

                  {/* Photo 4 (index 3) */}
                  <div
                    onClick={() => setLightboxIndex(3)}
                    className="relative h-full w-full cursor-pointer overflow-hidden group bg-neutral-900"
                  >
                    <Image
                      src={images[3].imageUrl}
                      alt={images[3].caption || "Photo 4"}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      sizes="(max-width: 768px) 33vw, 224px"
                    />
                  </div>

                  {/* Photo 5 (index 4) avec overlay +N si plus de 5 photos au total */}
                  <div
                    onClick={() => setLightboxIndex(4)}
                    className="relative h-full w-full cursor-pointer overflow-hidden group bg-neutral-900"
                  >
                    <Image
                      src={images[4].imageUrl}
                      alt={images[4].caption || "Photo 5"}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      sizes="(max-width: 768px) 33vw, 224px"
                    />

                    {/* Badge +N (identique à l'exemple de l'image) */}
                    {totalImages > 5 && (
                      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center transition-colors group-hover:bg-black/65">
                        <span className="text-white text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                          +{totalImages - 4}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. BARRE D'ACTIONS SOCIALES : 👍 J'AIME & ↪ PARTAGER     */}
        {/* ======================================================== */}
        <div className="border-t border-base-200/80 px-2 py-1.5 flex items-center justify-between">
          {/* Bouton J'aime avec compteur */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-95 ${
              hasLiked
                ? "text-blue-600 bg-blue-50/80 dark:bg-blue-950/40 font-bold"
                : "text-base-content/70 hover:bg-base-200/70 hover:text-base-content"
            }`}
          >
            <ThumbsUp
              className={`h-5 w-5 transition-transform duration-200 ${
                hasLiked ? "fill-blue-600 stroke-blue-600 scale-110" : "stroke-current"
              }`}
            />
            <span>{likes > 0 ? likes : "J'aime"}</span>
          </button>

          {/* Séparateur subtil */}
          <div className="h-5 w-px bg-base-200 mx-1" />

          {/* Bouton Partager */}
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold text-sm text-base-content/70 hover:bg-base-200/70 hover:text-base-content transition-all duration-150 active:scale-95"
          >
            <Share2 className="h-5 w-5" />
            <span>Partager</span>
          </button>
        </div>
      </article>

      {/* ======================================================== */}
      {/* 5. VISIONNEUSE PLEIN ÉCRAN (LIGHTBOX GALERIE)            */}
      {/* ======================================================== */}
      {lightboxIndex !== null && totalImages > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200">
          {/* Barre haute de navigation */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 text-white z-10">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white/80">
                {lightboxIndex + 1} / {totalImages}
              </span>
              <span className="text-xs text-white/50 hidden sm:inline">•</span>
              <span className="text-xs sm:text-sm text-white/70 truncate max-w-xs sm:max-w-md hidden sm:inline">
                {publication.title}
              </span>
            </div>

            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
              aria-label="Fermer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Zone centrale image active */}
          <div className="relative flex-1 w-full h-full flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            {/* Flèche Gauche */}
            {totalImages > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) =>
                    prev !== null && prev > 0 ? prev - 1 : totalImages - 1
                  );
                }}
                className="absolute left-2 sm:left-6 z-20 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition active:scale-95"
                aria-label="Photo précédente"
              >
                <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            )}

            {/* Photo grand format */}
            <div className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center">
              <Image
                src={images[lightboxIndex].imageUrl}
                alt={images[lightboxIndex].caption || `Photo ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
            </div>

            {/* Flèche Droite */}
            {totalImages > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) =>
                    prev !== null && prev < totalImages - 1 ? prev + 1 : 0
                  );
                }}
                className="absolute right-2 sm:right-6 z-20 p-2 sm:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 transition active:scale-95"
                aria-label="Photo suivante"
              >
                <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            )}
          </div>

          {/* Barre basse : Légende éventuelle ou aperçus miniatures */}
          <div className="px-4 py-3 bg-black/70 border-t border-white/10 text-center">
            {images[lightboxIndex].caption ? (
              <p className="text-sm text-white/90 max-w-3xl mx-auto truncate">
                {images[lightboxIndex].caption}
              </p>
            ) : (
              <p className="text-xs text-white/50">
                Assemblée Chrétienne de Goma - Kyeshero
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
