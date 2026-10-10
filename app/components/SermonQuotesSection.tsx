"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Quote, Copy, Check, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

interface SermonQuoteItem {
  id: string;
  quote: string;
  preacher: string;
  sermonTitle?: string | null;
  sermonDate?: Date | string | null;
  imageUrl?: string | null;
  preacherImageUrl?: string | null;
  category?: string | null;
}

interface SermonQuotesSectionProps {
  quotes: SermonQuoteItem[];
  title?: string;
  subtitle?: string;
}

export default function SermonQuotesSection({
  quotes,
  title = "Paroles & Citations Inspirantes",
  subtitle = "Des extraits forts prononcés lors de nos prédications et réunions pour nourrir votre méditation quotidienne.",
}: SermonQuotesSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Rotation automatique du carrousel toutes les 6 secondes (en pause lors du survol ou de la lecture étendue)
  useEffect(() => {
    if (quotes.length <= 1) return;
    if (isPaused || isExpanded) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === quotes.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(timer);
  }, [quotes.length, isPaused, isExpanded]);

  if (!quotes || quotes.length === 0) {
    return null;
  }

  const currentQuote = quotes[currentIndex] || quotes[0];
  const bgImage = currentQuote.imageUrl || currentQuote.preacherImageUrl;
  const isCopied = copiedId === currentQuote.id;
  const isLongQuote = currentQuote.quote.length > 180;

  const sermonDateStr = currentQuote.sermonDate
    ? new Date(currentQuote.sermonDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const prev = () => {
    setIsExpanded(false);
    setCurrentIndex((i) => (i === 0 ? quotes.length - 1 : i - 1));
  };

  const next = () => {
    setIsExpanded(false);
    setCurrentIndex((i) => (i === quotes.length - 1 ? 0 : i + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) next();
      else prev();
    }
    setTouchStartX(null);
  };

  const handleCopyQuote = async (item: SermonQuoteItem) => {
    const formattedText = `« ${item.quote} »\n— ${item.preacher}${
      item.sermonTitle ? ` (${item.sermonTitle})` : ""
    }\nAssemblée Chrétienne de Goma Keshero`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(formattedText);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2500);
      }
    } catch (err) {
      console.error("Failed to copy quote: ", err);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header de section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-base-300 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
            <BookOpen className="h-4 w-4" />
            <span>Méditations & Prédications</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-base-content mt-1">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-base-content/70 mt-1 max-w-xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Contrôles de navigation carrousel */}
        {quotes.length > 1 && (
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={prev}
              className="btn btn-circle btn-sm btn-ghost border border-base-300 hover:bg-base-200"
              aria-label="Citation précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold font-mono text-base-content/70 px-1">
              {currentIndex + 1} / {quotes.length}
            </span>
            <button
              onClick={next}
              className="btn btn-circle btn-sm btn-ghost border border-base-300 hover:bg-base-200"
              aria-label="Citation suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Carte Carrousel */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative flex flex-col justify-between overflow-hidden rounded-3xl min-h-[380px] sm:min-h-[440px] p-6 sm:p-10 text-white shadow-xl border border-white/10 group bg-neutral-900 select-none transition-all duration-300"
      >
        {/* Photo de l'orateur en arrière-plan complet */}
        {bgImage ? (
          <Image
            key={currentQuote.id}
            src={bgImage}
            alt={currentQuote.preacher}
            fill
            className="object-cover object-center pointer-events-none transition-opacity duration-500"
            sizes="(max-width: 1024px) 100vw, 900px"
            priority={currentIndex === 0}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-amber-950/40 pointer-events-none" />
        )}

        {/* Overlay sombre garantissant un contraste parfait */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/65 pointer-events-none" />

        {/* Flèches latérales de navigation (visibles au survol / écran large) */}
        {quotes.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Citation précédente"
              className="hidden sm:flex absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Citation suivante"
              className="hidden sm:flex absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Haut : Catégorie & Bouton Copier */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          {currentQuote.category ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md border border-white/20 text-amber-300 shadow-xs">
              {currentQuote.category}
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/50 backdrop-blur-md border border-white/20 text-amber-300 shadow-xs">
              Citation inspirante
            </span>
          )}

          <button
            onClick={() => handleCopyQuote(currentQuote)}
            className={`btn btn-xs rounded-full gap-1.5 backdrop-blur-md border transition-all ${
              isCopied
                ? "btn-success text-white border-success"
                : "bg-black/50 hover:bg-black/75 text-white/90 hover:text-white border-white/20"
            }`}
            title="Copier le texte de la citation"
          >
            {isCopied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Copié !</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>

        {/* Centre : La citation mise en valeur au milieu */}
        <div className="relative z-10 my-auto py-6 sm:py-8 text-center space-y-3 px-4 sm:px-12">
          <Quote className="h-8 w-8 sm:h-10 sm:w-10 text-amber-400/80 mx-auto -mb-1 opacity-80" />

          <div
            className={`transition-all duration-300 ${
              isExpanded
                ? "max-h-80 overflow-y-auto pr-1"
                : ""
            }`}
          >
            <blockquote
              className={`font-serif italic text-lg sm:text-2xl lg:text-3xl font-medium leading-relaxed tracking-wide text-white drop-shadow-md mx-auto max-w-2xl ${
                !isExpanded && isLongQuote ? "line-clamp-4" : ""
              }`}
            >
              « {currentQuote.quote} »
            </blockquote>
          </div>

          {/* Bouton pour tout lire si la citation est longue */}
          {isLongQuote && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200 underline underline-offset-4 cursor-pointer transition"
              >
                {isExpanded ? "Afficher moins ↑" : "Lire toute la citation →"}
              </button>
            </div>
          )}
        </div>

        {/* Bas : Prédicateur et Détails au centre */}
        <div className="relative z-10 text-center space-y-1 pt-4 border-t border-white/15">
          <p className="font-bold text-base sm:text-xl text-white drop-shadow-sm tracking-wide">
            {currentQuote.preacher}
          </p>
          {(currentQuote.sermonTitle || sermonDateStr) && (
            <p className="text-xs sm:text-sm text-white/80 font-medium flex items-center justify-center gap-2 flex-wrap">
              {currentQuote.sermonTitle && (
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>{currentQuote.sermonTitle}</span>
                </span>
              )}
              {currentQuote.sermonTitle && sermonDateStr && <span>•</span>}
              {sermonDateStr && <span>{sermonDateStr}</span>}
            </p>
          )}
        </div>
      </div>

      {/* Indicateurs (points) de pagination */}
      {quotes.length > 1 && (
        <div className="flex justify-center items-center gap-2 pt-2">
          {quotes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsExpanded(false);
                setCurrentIndex(idx);
              }}
              aria-label={`Aller à la citation ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? "w-8 bg-amber-400"
                  : "w-2 bg-base-300 hover:bg-base-content/40"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
