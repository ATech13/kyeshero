"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Expand, Sparkles, UserPlus, X } from "lucide-react";
import {
  ADMINISTRATION,
  CHURCH_LIFE,
  DEACONS,
  PASTORS,
  RESERVED_PASTORS,
  TEAMS,
  personnelImage,
  type GalleryItem,
} from "./team-data";

/* -------------------------------------------------------------------------- */
/*                                  Lightbox                                  */
/* -------------------------------------------------------------------------- */

function useLightbox(items: GalleryItem[]) {
  const [index, setIndex] = useState<number | null>(null);
  const open = useCallback((i: number) => setIndex(i), []);
  const close = useCallback(() => setIndex(null), []);
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % items.length)), [items.length]);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + items.length) % items.length)),
    [items.length],
  );
  return { index, open, close, next, prev };
}

function Lightbox({
  items,
  index,
  onClose,
  onNext,
  onPrev,
}: {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const item = index !== null ? items[index] : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (item && !dialog.open) dialog.showModal();
    if (!item && dialog.open) dialog.close();
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onNext, onPrev]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-black/85 backdrop:backdrop-blur-sm"
      aria-label={item ? item.title : "Visionneuse d’images"}
    >
      {item && (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-4 p-4 sm:p-8"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="relative h-[72vh] w-full max-w-5xl">
            <Image
              key={item.file}
              src={personnelImage(item.file)}
              alt={`${item.title} — ${item.subtitle}`}
              fill
              sizes="100vw"
              className="object-contain animate-in fade-in duration-300"
            />
          </div>

          <div className="text-center text-white space-y-1 max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">{item.subtitle}</p>
            <h3 className="text-xl sm:text-2xl font-black">{item.title}</h3>
            {item.description && <p className="text-sm text-white/75">{item.description}</p>}
            <p className="pt-1 font-mono text-xs text-white/50">
              {(index ?? 0) + 1} / {items.length}
            </p>
          </div>

          <button
            id="lightbox-close"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
          {items.length > 1 && (
            <>
              <button
                id="lightbox-prev"
                type="button"
                onClick={onPrev}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                id="lightbox-next"
                type="button"
                onClick={onNext}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Cartes                                   */
/* -------------------------------------------------------------------------- */

function SubHeading({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="text-sm font-black uppercase tracking-wider text-base-content">{title}</h3>
      <span className="rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-bold text-base-content/60">{count}</span>
      <span className="h-px flex-1 bg-base-300" />
    </div>
  );
}

function PortraitCard({
  item,
  onOpen,
  sizes,
}: {
  item: GalleryItem;
  onOpen: () => void;
  sizes: string;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      id={`portrait-${item.file.replace(/\W+/g, "-").toLowerCase()}`}
      className="group relative block w-full overflow-hidden rounded-2xl border border-base-300 bg-base-200 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary"
      aria-label={`Agrandir la photo de ${item.title}, ${item.subtitle}`}
    >
      <div className="relative aspect-[3/4]">
        <Image
          src={personnelImage(item.file)}
          alt={`${item.title} — ${item.subtitle}`}
          fill
          sizes={sizes}
          className="object-cover transition duration-500 group-hover:scale-105"
          style={{ objectPosition: item.focus ?? "50% 25%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <Expand className="absolute top-3 right-3 h-4 w-4 text-white/0 transition group-hover:text-white/90" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">{item.subtitle}</p>
        <p className="text-base sm:text-lg font-black leading-tight text-white">{item.title}</p>
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                           Section : Notre famille                          */
/* -------------------------------------------------------------------------- */

const PEOPLE = [...PASTORS, ...ADMINISTRATION, ...DEACONS, ...TEAMS];
const OFFSET_ADMIN = PASTORS.length;
const OFFSET_DEACONS = OFFSET_ADMIN + ADMINISTRATION.length;
const OFFSET_TEAMS = OFFSET_DEACONS + DEACONS.length;

export function TeamShowcase() {
  const lb = useLightbox(PEOPLE);

  return (
    <div className="space-y-12">
      {/* Corps pastoral */}
      <div className="space-y-5">
        <SubHeading title="Corps pastoral" count={PASTORS.length} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PASTORS.map((p, i) => (
            <button
              key={p.file}
              id={`pasteur-${i}`}
              type="button"
              onClick={() => lb.open(i)}
              className="group relative overflow-hidden rounded-3xl border border-primary/30 bg-base-100 text-left shadow-sm ring-1 ring-primary/10 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-primary"
              aria-label={`Agrandir la photo de ${p.title}`}
            >
              <div className="relative aspect-[4/5] sm:aspect-[5/6]">
                <Image
                  src={personnelImage(p.file)}
                  alt={`${p.title} — ${p.subtitle}`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                  style={{ objectPosition: p.focus }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 space-y-2 p-6 sm:p-7">
                <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
                  {p.subtitle}
                </span>
                <h4 className="text-xl sm:text-2xl font-black tracking-tight text-white">{p.title}</h4>
                <p className="max-w-md text-sm leading-relaxed text-white/80">{p.description}</p>
              </div>
            </button>
          ))}

          {/* Emplacements réservés pour les prochains pasteurs */}
          {/*
          {RESERVED_PASTORS.map((item, idx) => (
            <div
              key={item.id}
              id={`pasteur-reserve-${idx + 1}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-dashed border-primary/30 bg-gradient-to-b from-base-200/70 via-base-200/40 to-base-100/60 p-6 sm:p-7 shadow-xs aspect-[4/5] sm:aspect-[5/6] text-left transition hover:border-primary/50 hover:bg-base-200/80"
              aria-label={`${item.title} #${idx + 1}`}
            >
              <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary backdrop-blur">
                  {item.subtitle}
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-base-300 bg-base-100 text-[11px] font-black text-base-content/60 shadow-xs">
                  #{idx + 1}
                </span>
              </div>

              <div className="relative z-10 my-auto flex flex-col items-center justify-center py-6 text-center">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-xs transition group-hover:scale-105 group-hover:bg-primary/15">
                  <UserPlus className="h-8 w-8 sm:h-9 sm:w-9 opacity-85" />
                </div>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-base-100/90 px-3 py-1 text-[11px] font-semibold text-base-content/70 shadow-xs border border-base-300/60">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Emplacement réservé
                </span>
              </div>

              <div className="relative z-10 space-y-1">
                <h4 className="text-xl sm:text-2xl font-black tracking-tight text-base-content">
                  Pasteur à venir
                </h4>
                <p className="max-w-md text-xs sm:text-sm leading-relaxed text-base-content/65">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
          */}
        </div>
      </div>

      {/* Administration */}
      <div className="space-y-5">
        <SubHeading title="Administration" count={ADMINISTRATION.length} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {ADMINISTRATION.map((p, i) => (
            <PortraitCard
              key={p.file}
              item={p}
              onOpen={() => lb.open(OFFSET_ADMIN + i)}
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 33vw, 50vw"
            />
          ))}
        </div>
      </div>

      {/* Diacres */}
      <div className="space-y-5">
        <SubHeading title="Collège des diacres" count={DEACONS.length} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {DEACONS.map((p, i) => (
            <PortraitCard
              key={p.file}
              item={p}
              onOpen={() => lb.open(OFFSET_DEACONS + i)}
              sizes="(min-width: 1024px) 200px, (min-width: 640px) 33vw, 50vw"
            />
          ))}
        </div>
      </div>

      {/* Équipes & ministères */}
      <div className="space-y-5">
        <SubHeading title="Équipes & ministères" count={TEAMS.length} />
        <div className="grid gap-6 sm:grid-cols-2">
          {TEAMS.map((t, i) => (
            <button
              key={t.file}
              id={`equipe-${i}`}
              type="button"
              onClick={() => lb.open(OFFSET_TEAMS + i)}
              className="group overflow-hidden rounded-3xl border border-base-300 bg-base-100 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary"
              aria-label={`Agrandir la photo : ${t.title}`}
            >
              <div className="relative aspect-[3/2] overflow-hidden">
                <Image
                  src={personnelImage(t.file)}
                  alt={t.title}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                  style={{ objectPosition: t.focus ?? "50% 50%" }}
                />
                <span className="absolute top-4 left-4 rounded-full bg-base-100/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-primary backdrop-blur">
                  {t.subtitle}
                </span>
              </div>
              <div className="space-y-1.5 p-5">
                <h4 className="text-lg font-black text-base-content">{t.title}</h4>
                <p className="text-sm leading-relaxed text-base-content/70">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Lightbox items={PEOPLE} index={lb.index} onClose={lb.close} onNext={lb.next} onPrev={lb.prev} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                         Section : Vie de l'Église                          */
/* -------------------------------------------------------------------------- */

// Disposition « bento » : 1 grande tuile, 1 large, 2 carrées
const BENTO = [
  "lg:col-span-2 lg:row-span-2 aspect-[4/3] lg:aspect-auto",
  "lg:col-span-2 aspect-[16/9] lg:aspect-auto",
  "aspect-[4/3] lg:aspect-auto",
  "aspect-[4/3] lg:aspect-auto",
];

export function ChurchLifeGallery() {
  const lb = useLightbox(CHURCH_LIFE);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[220px]">
        {CHURCH_LIFE.map((item, i) => (
          <button
            key={item.file}
            id={`vie-eglise-${i}`}
            type="button"
            onClick={() => lb.open(i)}
            className={`group relative overflow-hidden rounded-3xl border border-base-300 text-left shadow-xs transition hover:shadow-lg focus-visible:outline-2 focus-visible:outline-primary ${
              i === 0 ? "sm:col-span-2" : ""
            } ${BENTO[i] ?? "aspect-[4/3]"}`}
            aria-label={`Agrandir la photo : ${item.title}`}
          >
            <Image
              src={personnelImage(item.file)}
              alt={item.title}
              fill
              sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">{item.subtitle}</p>
              <h3 className={`font-black tracking-tight text-white ${i === 0 ? "text-2xl sm:text-3xl" : "text-lg"}`}>
                {item.title}
              </h3>
              <p
                className={`text-white/80 leading-relaxed ${
                  i === 0 ? "text-sm max-w-md" : "text-xs line-clamp-2"
                }`}
              >
                {item.description}
              </p>
              {item.reference && (
                <p className="inline-flex items-center gap-1.5 pt-1 text-[11px] font-semibold italic text-white/65">
                  <BookOpen className="h-3 w-3" />
                  {item.reference}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      <Lightbox items={CHURCH_LIFE} index={lb.index} onClose={lb.close} onNext={lb.next} onPrev={lb.prev} />
    </>
  );
}
