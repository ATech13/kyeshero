"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import bg from "../../public/images/church.webp"
import {
  Cross,
  ArrowRight,
  BookOpen,
  Calendar,
  Radio,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import gsap from "gsap";

interface SlideData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  verse?: string;
  verseRef?: string;
  primaryBtnText: string;
  primaryBtnHref: string;
  secondaryBtnText: string;
  secondaryBtnHref: string;
}

const SLIDES: SlideData[] = [
  {
    id: "welcome",
    badge: "Bienvenue à l'église",
    title: "Assemblée Chrétienne de Goma Keshero",
    subtitle:
      "Une communauté de foi vivante, unie par l'amour du Christ, l'édification fraternelle et l'attachement aux Saintes Écritures.",
    verse: "« Jésus-Christ est le même hier, aujourd'hui et éternellement. »",
    verseRef: "Hébreux 13:8",
    primaryBtnText: "Découvrir les contenus",
    primaryBtnHref: "/contenus",
    secondaryBtnText: "Nos rassemblements",
    secondaryBtnHref: "/evenements",
  },
  {
    id: "doctrine",
    badge: "Enseignement Apostolique",
    title: "La Parole de Dieu, notre seule Absolue",
    subtitle:
      "Nous demeurons fermement attachés à la doctrine pure du Nouveau Testament : baptême par immersion au nom de Jésus-Christ, repas du Seigneur et sanctification.",
    verse: "« Ils persévéraient dans l'enseignement des apôtres, dans la communion fraternelle, dans la fraction du pain, et dans les prières. »",
    verseRef: "Actes 2:42",
    primaryBtnText: "Nos fondements doctrinaux",
    primaryBtnHref: "/a-propos",
    secondaryBtnText: "Écouter les enseignements",
    secondaryBtnHref: "/contenus",
  },
  {
    id: "community",
    badge: "Vie Fraternelle & Horaires",
    title: "Un temple ouvert à tous pour prier et grandir",
    subtitle:
      "Que vous cherchiez la vérité, une famille spirituelle ou un soutien dans la prière, nos portes vous sont chaleureusement ouvertes.",
    verse: "« Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos. »",
    verseRef: "Matthieu 11:28",
    primaryBtnText: "Consulter l'agenda",
    primaryBtnHref: "/evenements",
    secondaryBtnText: "Nous contacter",
    secondaryBtnHref: "/contact",
  },
];

export default function HomeHeroPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const slideContentRef = useRef<HTMLDivElement>(null);

  // Rotation automatique lente et fluide (toutes les 7.5 secondes)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 7500);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Animation douce lors du changement de slide
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (slideContentRef.current) {
      gsap.fromTo(
        slideContentRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", clearProps: "all" }
      );
    }
  }, [currentSlide]);

  const slide = SLIDES[currentSlide];

  const prev = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
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

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-between overflow-hidden bg-neutral-950 text-white border-b border-base-300/60"
    >
      {/* Image de fond avec voile de contraste soigné */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src={bg}
          alt="Sanctuaire de l'Assemblée Chrétienne"
          fill
          priority
          className="object-cover object-center brightness-90 contrast-105"
          sizes="100vw"
          quality={95}
        />
        {/* Voiles superposés pour lisibilité parfaite */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
      </div>

      {/* Contenu central animé du Carousel */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10 my-auto text-center">
        <div ref={slideContentRef} className="space-y-6">
          {/* Badge de thématique */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-black/50 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-amber-300 shadow-md">
            <span>{slide.badge}</span>
          </div>

          {/* Titre principal */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-md">
            {slide.title}
          </h1>

          {/* Verset ou citation clé */}
          {slide.verse && (
            <div className="max-w-2xl mx-auto py-1">
              <p className="font-serif italic text-base sm:text-xl text-yellow-100/90 leading-relaxed drop-shadow-xs">
                {slide.verse}{" "}
                {slide.verseRef && (
                  <span className="font-sans font-bold text-xs uppercase tracking-wider text-amber-300 ml-1.5 not-italic">
                    {slide.verseRef}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Descriptif court */}
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-white/85 leading-relaxed font-normal drop-shadow-xs">
            {slide.subtitle}
          </p>

          
          {/* Boutons d'action clairs et visibles */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 w-full max-w-md mx-auto">
            <Link
              href={slide.primaryBtnHref}
              className="btn btn-primary rounded-xl px-6 font-bold shadow-lg w-full sm:w-auto text-primary-content border-0 transition hover:scale-102"
            >
              <span>{slide.primaryBtnText}</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>

            <Link
              href={slide.secondaryBtnHref}
              className="btn rounded-xl px-6 font-bold w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-md shadow-md transition"
            >
              {slide.secondaryBtnText}
            </Link>
          </div>
        </div>
      </div>

      {/* Barre inférieure : pagination & contrôles discrets */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 pt-4 flex items-center justify-between">
        {/* Flèche gauche */}
        <button
          onClick={prev}
          aria-label="Slide précédente"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/15 transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Puces de pagination discrètes */}
        <div className="flex items-center gap-2">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Aller au slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? "w-8 bg-amber-400"
                  : "w-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Flèche droite */}
        <button
          onClick={next}
          aria-label="Slide suivante"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/15 transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
