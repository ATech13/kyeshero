"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote as QuoteIcon, Calendar, BookOpen } from "lucide-react";
import Image from "next/image";

interface QuoteItem {
  id: string;
  quote: string;
  preacher: string;
  sermonTitle?: string | null;
  sermonDate?: Date | string | null;
  category?: string | null;
  imageUrl?: string | null;
}

interface QuotesCarouselProps {
  quotes: QuoteItem[];
}

export default function QuotesCarousel({ quotes }: QuotesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const total = quotes.length;
  const current = quotes[currentIndex];

  const handleNext = useCallback(() => {
    setIsExpanded(false);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setIsExpanded(false);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setIsExpanded(false);
    setCurrentIndex(idx);
  };

  // Défilement automatique toutes les 8 secondes (mis en pause au survol)
  useEffect(() => {
    if (total <= 1 || isPaused || isExpanded) return;
    const interval = setInterval(handleNext, 8000);
    return () => clearInterval(interval);
  }, [total, isPaused, isExpanded, handleNext]);

  if (!current) return null;

  // Seuil pour "Lire plus"
  const MAX_LENGTH = 170;
  const isLong = current.quote.length > MAX_LENGTH;
  const displayedText = isLong && !isExpanded
    ? `${current.quote.slice(0, MAX_LENGTH).trim()}...`
    : current.quote;

  const bgImage = current.imageUrl || "/images/church.jpeg";

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Photo en background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt={current.preacher || "Citation"}
          fill
          priority
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Voile sombre pour garantir une lisibilité parfaite */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/45 backdrop-blur-[2px]" />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col justify-between min-h-[380px] sm:min-h-[430px] p-6 sm:p-10 text-white">
        {/* En-tête du slide */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-amber-400 border border-white/20">
              <QuoteIcon className="h-4 w-4" />
            </span>
            {current.category && (
              <span className="rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-white/90 border border-white/20">
                {current.category}
              </span>
            )}
          </div>

          {/* Indicateur de position */}
          <span className="rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-xs font-mono font-bold text-white/80 border border-white/10">
            {currentIndex + 1} / {total}
          </span>
        </div>

        {/* Corps de la citation */}
        <div className="my-6 max-w-3xl space-y-3">
          <blockquote className="font-serif italic text-lg sm:text-2xl text-white/95 leading-relaxed tracking-wide drop-shadow-sm">
            « {displayedText} »
          </blockquote>

          {/* Bouton Lire plus / Lire moins si paragraphe long */}
          {isLong && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer transition"
            >
              {isExpanded ? "Lire moins" : "Lire plus"}
            </button>
          )}
        </div>

        {/* Bas du slide : Auteur, source et flèches de navigation */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4 border-t border-white/15">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
              <h4 className="font-bold text-base sm:text-lg text-white tracking-tight">
                {current.preacher}
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75">
              {current.sermonTitle && (
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-amber-400 shrink-0" />
                  <span>{current.sermonTitle}</span>
                </span>
              )}
              {current.sermonDate && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-amber-400 shrink-0" />
                  <span>
                    {new Date(current.sermonDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Flèches de navigation et points */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Points indicateurs */}
            <div className="flex items-center gap-1.5 mr-2">
              {quotes.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex
                      ? "w-6 bg-amber-400"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Aller à la citation ${idx + 1}`}
                />
              ))}
            </div>

            {/* Boutons Précédent / Suivant */}
            <button
              onClick={handlePrev}
              className="btn btn-circle btn-sm bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md shadow-xs transition"
              aria-label="Citation précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="btn btn-circle btn-sm bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md shadow-xs transition"
              aria-label="Citation suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
