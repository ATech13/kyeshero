"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface HeroSectionProps {
  nextEvent?: {
    id: string;
    title: string;
    slug: string;
    startAt: Date | string;
    location?: string | null;
  } | null;
}

export default function HeroSection({ nextEvent }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".hero-badge", {
        opacity: 0,
        y: -12,
        duration: 0.8,
      })
        .from(
          ".hero-title",
          {
            opacity: 0,
            y: 25,
            duration: 1.1,
            ease: "power3.out",
          },
          "-=0.5"
        )
        .from(
          ".hero-verse",
          {
            opacity: 0,
            y: 15,
            duration: 0.9,
          },
          "-=0.6"
        )
        .from(
          ".hero-btn",
          {
            opacity: 0,
            y: 15,
            duration: 0.7,
            stagger: 0.12,
          },
          "-=0.5"
        );

      if (nextEvent) {
        tl.from(
          ".hero-event-card",
          {
            opacity: 0,
            y: 25,
            duration: 0.9,
            ease: "power3.out",
          },
          "-=0.4"
        );
      }

      // Nettoie tous les styles inline une fois l'animation terminée pour garantir un affichage 100% stable
      tl.set([".hero-badge", ".hero-title", ".hero-verse", ".hero-btn", ".hero-event-card"], {
        clearProps: "all",
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative isolate overflow-hidden border-b border-base-300/70 py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-neutral-900"
    >
      {/* Image d'arrière-plan avec Next.js Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/church.jpeg"
          alt="Sanctuaire de l'Assemblée Chrétienne"
          fill
          priority
          className="object-cover object-center brightness-95 contrast-105"
          sizes="100vw"
          quality={95}
        />
        {/* Voile d'ambiance : contraste net et solennel */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-base-100/90 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center space-y-6">
        <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-amber-200 shadow-md">
          <span>Bienvenu au temple du Seigneur</span>
        </div>

        <h1 className="hero-title text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight break-words drop-shadow-md">
          Assemblée Chrétienne de Goma Keshero
        </h1>

        <p className="hero-verse mx-auto max-w-2xl text-sm sm:text-lg text-white/90 leading-relaxed break-words drop-shadow-sm font-medium">
          Jésus Christ est le même aujourd'hui, hier et éternellement{" "}
          <span className="text-yellow-200 font-bold underline">Hébreux 13:8</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-md mx-auto">
          <Link
            href="/evenements"
            className="hero-btn btn btn-primary rounded-xl px-6 font-bold shadow-lg w-full sm:w-auto text-primary-content border-0"
          >
            Cultes & Événements à venir
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
          <Link
            href="/medias"
            className="hero-btn btn rounded-xl px-6 font-bold w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md shadow-md"
          >
            Prédications & Vidéos
          </Link>
        </div>

        {/* Prochain rassemblement mis en avant */}
        {nextEvent && (
          <div className="hero-event-card mx-auto max-w-2xl mt-12 rounded-2xl border border-white/25 bg-base-100/90 backdrop-blur-lg p-5 sm:p-6 text-left shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                  Prochain Rassemblement
                </span>
                <h2 className="text-base sm:text-lg font-bold text-base-content">
                  {nextEvent.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-base-content/75 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    {new Date(nextEvent.startAt).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    {nextEvent.location || "Keshero, Goma"}
                  </span>
                </div>
              </div>
              <Link
                href={`/evenements/${nextEvent.slug}`}
                className="btn btn-secondary btn-sm rounded-xl shrink-0 self-start sm:self-center font-bold shadow-sm"
              >
                Voir les détails
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
