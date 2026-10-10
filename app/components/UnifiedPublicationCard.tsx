import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin, Newspaper, ArrowRight, User } from "lucide-react";
import type { UnifiedPublication } from "@/actions/events";

interface UnifiedPublicationCardProps {
  item: UnifiedPublication;
}

export default function UnifiedPublicationCard({ item }: UnifiedPublicationCardProps) {
  const isEvent = item.type === "EVENT";

  const dateObj = new Date(item.date);
  const formattedDate = dateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article
      className={`group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-base-100 border transition hover:shadow-md ${
        isEvent
          ? "border-secondary/30 hover:border-secondary"
          : "border-primary/30 hover:border-primary"
      }`}
    >
      {/* Vignette image */}
      <div className="relative aspect-video sm:aspect-square sm:w-56 md:w-64 shrink-0 overflow-hidden bg-base-200">
        {item.coverImageUrl ? (
          <Image
            src={item.coverImageUrl}
            alt={item.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 256px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-base-300/60 text-base-content/40">
            {isEvent ? <Calendar className="h-10 w-10" /> : <Newspaper className="h-10 w-10" />}
          </div>
        )}

        {/* Badge distinctif [ÉVÉNEMENT] ou [ACTUALITÉ] */}
        <div className="absolute top-3 left-3">
          {isEvent ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary text-secondary-content px-2.5 py-1 text-[11px] font-black uppercase tracking-wider shadow-sm">
              <Calendar className="h-3.5 w-3.5" />
              <span>Événement</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-content px-2.5 py-1 text-[11px] font-black uppercase tracking-wider shadow-sm">
              <Newspaper className="h-3.5 w-3.5" />
              <span>Actualité</span>
            </span>
          )}
        </div>
      </div>

      {/* Contenu textuel */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6 space-y-3 min-w-0">
        <div className="space-y-2">
          {/* Métadonnées temporelles ou auteur */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {isEvent ? (
              <>
                <span className="inline-flex items-center gap-1 font-bold text-secondary capitalize">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>{formattedDate}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-base-content/70">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{formattedTime}</span>
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 font-medium text-base-content/70">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>Publié le {formattedDate}</span>
                </span>
                {item.authorName && (
                  <span className="inline-flex items-center gap-1 text-base-content/60">
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.authorName}</span>
                  </span>
                )}
              </>
            )}
          </div>

          {/* Titre */}
          <h3 className="text-lg sm:text-xl font-black text-base-content group-hover:text-primary transition leading-snug">
            <Link href={`/evenements/${item.slug}`} className="hover:underline focus:outline-none">
              {item.title}
            </Link>
          </h3>

          {/* Extrait */}
          {item.description && (
            <p className="text-xs sm:text-sm text-base-content/70 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Pied de carte avec lieu ou catégorie et lien */}
        <div className="pt-3 border-t border-base-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          {isEvent && item.location ? (
            <span className="inline-flex items-center gap-1 text-base-content/70 truncate max-w-[200px] sm:max-w-xs">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{item.location}</span>
            </span>
          ) : (
            <span className="text-base-content/50 italic">
              {item.category ? `Catégorie : ${item.category}` : "Vie de l'église"}
            </span>
          )}

          <Link
            href={`/evenements/${item.slug}`}
            className="inline-flex items-center gap-1 font-bold text-primary hover:underline ml-auto group-hover:translate-x-0.5 transition-transform"
          >
            <span>{isEvent ? "Voir les détails" : "Lire la suite"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
