"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import bg from "../../public/images/church.webp";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface SlideData {
  id: string;
  badge: string;
  titleLine1: string;
  titleLine2: string;
  titleHighlight: string;
  subtitle: string;
  verse: string;
  verseRef: string;
  primaryBtnText: string;
  primaryBtnHref: string;
  secondaryBtnText: string;
  secondaryBtnHref: string;
}

const SLIDES: SlideData[] = [
  {
    id: "welcome",
    badge: "ASSEMBLÉE CHRÉTIENNE DE GOMA KESHERO",
    titleLine1: "Une communauté vivante",
    titleLine2: "unie dans l'amour et la",
    titleHighlight: "foi",
    subtitle:
      "Édification fraternelle, louange vivante et attachement fidèle aux Saintes Écritures pour chaque croyant et chaque famille.",
    verse: "« Jésus-Christ est le même hier, aujourd'hui et éternellement. »",
    verseRef: "HÉBREUX 13:8",
    primaryBtnText: "Découvrir les contenus",
    primaryBtnHref: "/contenus",
    secondaryBtnText: "Nos rassemblements",
    secondaryBtnHref: "/evenements",
  },
  {
    id: "community",
    badge: "BIENVENUE À L'ASSEMBLÉE CHRÉTIENNE",
    titleLine1: "Une église ouverte à",
    titleLine2: "tous pour prier et",
    titleHighlight: "grandir spirituellement",
    subtitle:
      "Que vous cherchiez la vérité, une famille spirituelle ou un soutien dans la prière, nos portes vous sont chaleureusement ouvertes.",
    verse: "« Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos. »",
    verseRef: "MATTHIEU 11:28",
    primaryBtnText: "Consulter l'agenda",
    primaryBtnHref: "/evenements",
    secondaryBtnText: "Nous contacter",
    secondaryBtnHref: "/contact",
  },
  {
    id: "doctrine",
    badge: "ENSEIGNEMENT APOSTOLIQUE & PAROLE PURE",
    titleLine1: "La Parole de Dieu,",
    titleLine2: "notre seule et unique",
    titleHighlight: "absolue",
    subtitle:
      "Nous demeurons attachés à la doctrine pure du Nouveau Testament : baptême par immersion au nom du Seigneur Jésus-Christ et sanctification.",
    verse: "« Ils persévéraient dans l'enseignement des apôtres, dans la communion fraternelle, et dans les prières. »",
    verseRef: "ACTES 2:42",
    primaryBtnText: "Nos fondements",
    primaryBtnHref: "/a-propos",
    secondaryBtnText: "Écouter les enseignements",
    secondaryBtnHref: "/contenus",
  },
];

export default function HomeHeroPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Rotation automatique douce (8 secondes)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 8500);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Animation douce lors du changement de slide
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", clearProps: "all" }
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

  return (
    <section
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full min-h-[calc(100svh-108px)] md:min-h-[calc(100dvh-65px)] flex items-center justify-start overflow-hidden bg-slate-950 text-white select-none"
    >
      {/* 1. Image de fond du sanctuaire avec cadrage fidèle à la maquette */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src={bg}
          alt="Sanctuaire et tour de l'Assemblée Chrétienne de Goma Keshero"
          fill
          priority
          sizes="100vw"
          quality={95}
          className="object-cover object-[70%_28%] lg:object-[60%_22%] brightness-[0.98] contrast-[1.04]"
        />

        {/* 2. Gradient overlay : Sombre à gauche pour le contraste du texte, lumineux et naturel à droite sur la tour et la croix */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 via-42% to-slate-950/10 lg:via-slate-950/55 lg:via-45% lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-slate-950/30" />
      </div>

      {/* 3. Contenu principal aligné à gauche (exactement conforme à la maquette de référence) */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-12 xl:py-16">
        <div ref={contentRef} className="max-w-xl sm:max-w-2xl xl:max-w-3xl text-left space-y-4 xl:space-y-5">
          {/* Ligne d'accent supérieure dorée avec tiret */}
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-8 bg-[#FBBF24] rounded-full inline-block shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white/95 drop-shadow-xs">
              {slide.badge}
            </span>
          </div>

          {/* Grand titre avec la fin en jaune doré */}
          <h1 className="text-[clamp(2rem,1.35rem+2.4vw,3.5rem)] font-black tracking-tight text-white leading-[1.1] drop-shadow-md">
            {slide.titleLine1}
            <br />
            {slide.titleLine2}
            <br />
            <span className="text-[#FBBF24]">{slide.titleHighlight}</span>
          </h1>

          {/* Verset biblique en italique avec référence dorée */}
          <div className="space-y-1.5 pt-0.5 max-w-xl">
            <p className="font-serif italic text-base sm:text-lg lg:text-[1.15rem] text-white/95 leading-snug text-pretty drop-shadow-xs">
              {slide.verse}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-[#FBBF24] drop-shadow-xs">
              {slide.verseRef}
            </p>
          </div>

          {/* Paragraphe descriptif chaleureux */}
          <p className="text-sm sm:text-base lg:text-[1.02rem] text-white/85 leading-relaxed font-normal max-w-xl text-pretty drop-shadow-xs">
            {slide.subtitle}
          </p>

          {/* Deux boutons d'action pilules conformes à l'image */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2 sm:pt-3">
            <Link
              href={slide.primaryBtnHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 font-bold px-7 py-3 sm:py-3.5 text-sm sm:text-[0.95rem] shadow-lg transition-all hover:scale-103 active:scale-97"
            >
              <span>{slide.primaryBtnText}</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Link>

            <Link
              href={slide.secondaryBtnHref}
              className="inline-flex items-center justify-center rounded-full border border-white/75 hover:border-white bg-slate-950/35 hover:bg-white/15 backdrop-blur-md text-white font-bold px-7 py-3 sm:py-3.5 text-sm sm:text-[0.95rem] shadow-sm transition-all hover:scale-103 active:scale-97"
            >
              <span>{slide.secondaryBtnText}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Contrôles de navigation discrets en bas à droite (sans perturber le visuel principal) */}
      <div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-8 z-20 hidden sm:flex items-center gap-1.5 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/15 p-1">
        <button
          onClick={prev}
          aria-label="Slide précédente"
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/15 text-white/85 hover:text-white transition-all text-xs cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5 px-1.5">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Aller au slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide ? "w-6 bg-[#FBBF24]" : "w-1.5 bg-white/45 hover:bg-white/75"
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          aria-label="Slide suivante"
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/15 text-white/85 hover:text-white transition-all text-xs cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
