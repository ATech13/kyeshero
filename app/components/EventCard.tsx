import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";

interface EventCardProps {
  title: string;
  slug: string;
  description?: string | null;
  startAt: Date | string;
  endAt?: Date | string | null;
  location?: string | null;
  coverImageUrl?: string | null;
}

function formatEventDate(dateInput: Date | string) {
  const d = new Date(dateInput);
  const day = d.getDate();
  const month = d.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase();
  const year = d.getFullYear();
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return { day, month, year, time };
}

function formatEndTime(dateInput?: Date | string | null) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function EventCard({
  title,
  slug,
  description,
  startAt,
  endAt,
  location,
  coverImageUrl,
}: EventCardProps) {
  const start = formatEventDate(startAt);
  const endTime = formatEndTime(endAt);

  return (
    <article className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm transition hover:shadow-md hover:border-primary/40 w-full max-w-full">
      {/* Image de couverture ou visuel */}
      <div className="relative h-48 sm:h-auto sm:w-64 shrink-0 overflow-hidden bg-base-200 w-full sm:w-64">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 256px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary p-6">
            <Calendar className="h-12 w-12 opacity-40" />
          </div>
        )}

        {/* Badge date bien visible */}
        <div className="absolute top-3 left-3 flex flex-col items-center justify-center rounded-xl bg-base-100/95 px-3 py-1.5 shadow-md backdrop-blur-sm border border-base-300 text-center">
          <span className="text-xl font-black text-primary leading-none">
            {start.day}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/70">
            {start.month}
          </span>
        </div>
      </div>

      {/* Contenu principal : QUOI, QUAND, OÙ */}
      <div className="flex flex-1 flex-col p-4 sm:p-6 justify-between min-w-0">
        <div className="space-y-2.5">
          {/* QUOI */}
          <h3 className="text-xl font-black tracking-tight text-base-content group-hover:text-primary transition break-words">
            <Link href={`/evenements/${slug}`}>{title}</Link>
          </h3>

          {description && (
            <p className="text-sm text-base-content/70 line-clamp-2 leading-relaxed break-words">
              {description}
            </p>
          )}

          {/* QUAND & OÙ */}
          <div className="grid gap-2 pt-2 text-xs text-base-content/75 sm:grid-cols-2">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">
                {start.time}
                {endTime ? ` – ${endTime}` : ""}
              </span>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{location || "Assemblée Chrétienne de Goma"}</span>
            </div>
          </div>
        </div>

        {/* Lien de détails */}
        <div className="pt-4 mt-4 border-t border-base-200 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-secondary">
            Rassemblement ouvert à tous
          </span>
          <Link
            href={`/evenements/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline shrink-0"
          >
            <span>Détails & accès</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
