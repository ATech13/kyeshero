"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, CornerDownRight, BookOpen, Droplets, Utensils } from "lucide-react";
import gsap from "gsap";

interface Pillar {
  id: string;
  badge: string;
  icon: any;
  title: string;
  shortText: string;
  expandedText: string;
  actionText: string;
  actionHref: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition: "left" | "right";
}

const PILLARS: Pillar[] = [
  {
    id: "bible",
    badge: "Fondement Unique",
    icon: BookOpen,
    title: "La Bible est notre seule Absolue",
    shortText:
      "Les saintes Écritures sont l'unique source et le fondement entier de notre foi, la seule règle dans l'enseignement et dans la vie. Dieu, au travers de ses prophètes dans l'Ancien Testament et par les apôtres dans le Nouveau Testament, nous a légué tout ce que nous avions besoin de connaître.",
    expandedText:
      "La Bible renferme le témoignage complet de Dieu auquel rien ne peut être ajouté. Seulement ce que les apôtres ont laissé dans le Nouveau Testament est effectivement « l'enseignement apostolique », c'est seulement ce que la Bible enseigne qui est effectivement « biblique », c'est seulement ce qui a son origine en Christ lui-même qui est effectivement « chrétien ». Les confessions de foi émises lors des différents conciles au cours de l'histoire de l'église sont considérées comme des ajouts et des falsifications de la Parole originale.",
    actionText: "Expérimentez la puissante parole en retournant vers Christ",
    actionHref: "/medias",
    imageSrc: "/images/doctrines/bible.jpg",
    imageAlt: "La Sainte Bible ouverte pour la méditation et l'enseignement",
    imagePosition: "right",
  },
  {
    id: "bapteme",
    badge: "Modèle Apostolique",
    icon: Droplets,
    title: "Le vrai baptême est fait dans beaucoup d'eau en invoquant le nom de Jésus-Christ",
    shortText:
      "Le Baptême est administré selon le modèle apostolique à ceux qui croient selon la Parole du Seigneur ressuscité : « Celui qui croira et qui sera baptisé sera sauvé » (Marc 16:16). Le Baptême se fait par immersion, comme il était pratiqué pendant les premiers siècles.",
    expandedText:
      "Pierre, le premier jour où l'Église du Nouveau Testament fut établie, dit sous la conduite du Saint Esprit : « Repentez-vous, et que chacun de vous soit baptisé au nom de Jésus Christ, pour le pardon de vos péchés; et vous recevrez le don du Saint Esprit » (Actes 2:38). Les premiers apôtres ont prêché et administré le baptême exactement selon Matthieu 28:19. Ils n'ont pas répété le texte comme une formule, mais ont compris que le nom de Jésus, nom de l'alliance du Nouveau Testament, était le point central de la commission.",
    actionText: "C'est le moment pour toi de donner ta vie à Jésus-Christ",
    actionHref: "/contact",
    imageSrc: "/images/doctrines/bapteme.jpg",
    imageAlt: "Le baptême biblique par immersion dans l'eau au nom de Jésus-Christ",
    imagePosition: "left",
  },
  {
    id: "sainte-cene",
    badge: "Communion des Saints",
    icon: Utensils,
    title: "Le Repas du Seigneur se fait avec un seul pain sans levain",
    shortText:
      "Le Repas du Seigneur est célébré selon les Écritures. Un pain sans levain est préparé d'après le nombre de personnes qui y prennent part. Le pain est béni pendant la prière et puis rompu afin d'être distribué à tous. La coupe qui contient du vin rouge est aussi bénie par la prière et tous y prennent part.",
    expandedText:
      "« Pendant qu'ils mangeaient, Jésus prit du pain; et, après avoir rendu grâces, il le rompit, et le donna aux disciples, en disant: Prenez, mangez, ceci est mon corps. Il prit ensuite une coupe; et, après avoir rendu grâces, il la leur donna, en disant: Buvez-en tous; car ceci est mon sang, le sang de l'alliance, qui est répandu pour plusieurs, pour la rémission des péchés » (Matthieu 26: 26-28). C'est en souvenir des souffrances et de la mort de notre Seigneur et Rédempteur, qui devint le sacrifice en versant son précieux sang afin de payer le prix pour les siens.",
    actionText: "Expérimentez la puissante parole en retournant à Christ",
    actionHref: "/a-propos",
    imageSrc: "/images/doctrines/repas.jpg",
    imageAlt: "La célébration du Repas du Seigneur avec le pain sans levain",
    imagePosition: "right",
  },
];

export default function FaithPillars() {
  const containerRef = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    bible: false,
    "sainte-cene": false,
  });

  const togglePillar = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const header = el.querySelector(".pillars-header");
            if (header) {
              gsap.fromTo(
                header,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", clearProps: "all" }
              );
            }

            const rows = el.querySelectorAll(".pillar-row");
            if (rows.length > 0) {
              gsap.fromTo(
                rows,
                { opacity: 0, y: 25 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  stagger: 0.15,
                  ease: "power2.out",
                  clearProps: "all",
                }
              );
            }

            observer.disconnect();
          }
        });
      },
      { rootMargin: "0px 0px -20px 0px", threshold: 0.01 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative py-16 sm:py-24 bg-gradient-to-b from-base-100 via-base-200/40 to-base-100 border-y border-base-300/80"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* En-tête de section sobre & soigné */}
        <div className="pillars-header text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-widest">
            <span>Enseignement Apostolique</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-base-content tracking-tight">
            Les Fondements de notre Foi
          </h2>
          <p className="text-sm sm:text-base text-base-content/70 leading-relaxed">
            Nous demeurons attachés à la doctrine pure révélée dans les Saintes Écritures, vécue et transmise par les apôtres du Seigneur Jésus-Christ.
          </p>
        </div>

        {/* Liste des 3 piliers doctrinaux avec mise en page alternée */}
        <div className="space-y-16 sm:space-y-24">
          {PILLARS.map((pillar) => {
            const isExpanded = !!expanded[pillar.id];
            const Icon = pillar.icon;
            const isImageLeft = pillar.imagePosition === "left";

            return (
              <div
                key={pillar.id}
                className={`pillar-row grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                  isImageLeft ? "lg:grid-flow-dense" : ""
                }`}
              >
                {/* Colonne Contenu Texte */}
                <div
                  className={`space-y-5 lg:col-span-7 ${
                    isImageLeft ? "lg:col-start-6" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{pillar.badge}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-base-content leading-tight tracking-tight">
                    {pillar.title}
                  </h3>

                  <p className="text-sm sm:text-base text-base-content/80 leading-relaxed font-normal">
                    {pillar.shortText}
                  </p>

                  {/* Bouton Accordéon "Lire plus" */}
                  <div>
                    <button
                      onClick={() => togglePillar(pillar.id)}
                      className="btn btn-primary btn-sm rounded-xl gap-2 font-bold px-4 shadow-xs"
                      aria-expanded={isExpanded}
                    >
                      <span>{isExpanded ? "Lire moins" : "Lire plus"}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Texte additionnel développé */}
                  {isExpanded && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="p-4 sm:p-5 rounded-2xl bg-base-200/80 border border-base-300 text-sm sm:text-base text-base-content/85 leading-relaxed font-serif italic space-y-2">
                        <p>{pillar.expandedText}</p>
                      </div>
                    </div>
                  )}

                  {/* Lien d'invitation avec flèche courbée */}
                  <div className="pt-2">
                    <Link
                      href={pillar.actionHref}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:text-primary-focus transition group"
                    >
                      <CornerDownRight className="h-4 w-4 text-secondary group-hover:translate-x-1 group-hover:translate-y-0.5 transition-transform" />
                      <span className="underline decoration-primary/40 underline-offset-4 group-hover:decoration-primary">
                        {pillar.actionText}
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Colonne Image soignée avec ratio harmonieux */}
                <div
                  className={`lg:col-span-5 ${
                    isImageLeft ? "lg:col-start-1" : ""
                  }`}
                >
                  <div className="relative group overflow-hidden rounded-3xl border border-base-300 bg-base-200 shadow-md aspect-4/3 sm:aspect-16/10 lg:aspect-4/3 w-full">
                    <Image
                      src={pillar.imageSrc}
                      alt={pillar.imageAlt}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 500px"
                    />
                    {/* Léger voile pour la profondeur */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
