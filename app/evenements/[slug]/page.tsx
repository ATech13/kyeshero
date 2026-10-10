import { getUnifiedPublicationBySlug } from "@/actions/events";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Newspaper,
  User,
  Share2,
} from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getUnifiedPublicationBySlug(slug);

  if (!item) {
    return { title: "Publication non trouvée" };
  }

  return {
    title: `${item.title} · ${item.type === "EVENT" ? "Événement" : "Actualité"}`,
    description: item.description || "Détails à l'Assemblée Chrétienne de Goma.",
    openGraph: {
      title: item.title,
      description: item.description || undefined,
      images: item.coverImageUrl ? [item.coverImageUrl] : undefined,
    },
  };
}

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getUnifiedPublicationBySlug(slug);

  if (!item) {
    notFound();
  }

  const isEvent = item.type === "EVENT";
  const dateObj = new Date(item.date);
  const formattedDate = dateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const startTime = dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const endTime = item.endDate
    ? new Date(item.endDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
      {/* Bouton retour */}
      <div>
        <Link
          href="/evenements"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à l'espace Événements &amp; Actualités</span>
        </Link>
      </div>

      {/* Image de couverture principale */}
      {item.coverImageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-base-200 border border-base-300 shadow-sm">
          <Image
            src={item.coverImageUrl}
            alt={item.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
          />
        </div>
      )}

      {/* En-tête */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {isEvent ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary text-secondary-content px-3 py-1 text-xs font-black uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5" />
              <span>Événement</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-content px-3 py-1 text-xs font-black uppercase tracking-wider">
              <Newspaper className="h-3.5 w-3.5" />
              <span>Actualité</span>
            </span>
          )}

          {item.category && (
            <span className="rounded-lg bg-base-200 px-3 py-1 text-xs font-medium text-base-content/75">
              {item.category}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-base-content tracking-tight leading-tight">
          {item.title}
        </h1>

        {/* Fiche récapitulative contextuelle */}
        {isEvent ? (
          <div className="grid gap-4 sm:grid-cols-3 rounded-2xl border border-base-300 bg-base-200/50 p-5 text-sm">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-base-content/60">
                  Date &amp; Heure
                </p>
                <p className="font-semibold text-base-content capitalize mt-0.5">
                  {formattedDate}
                </p>
                <p className="text-xs text-base-content/75 mt-0.5">
                  {startTime} {endTime ? `– ${endTime}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-base-content/60">
                  Lieu
                </p>
                <p className="font-semibold text-base-content mt-0.5">
                  {item.location || "Assemblée Chrétienne de Goma"}
                </p>
                <p className="text-xs text-base-content/75 mt-0.5">Keshero, Goma</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-xs uppercase tracking-wider text-base-content/60">
                  Renseignements
                </p>
                <p className="font-semibold text-base-content mt-0.5">
                  {item.contactInfo || "+243 997 717 686"}
                </p>
                <p className="text-xs text-base-content/75 mt-0.5">Ouvert à tous</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4 text-xs text-base-content/70 border-b border-base-300 pb-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Publié le {formattedDate}</span>
            </span>
            {item.authorName && (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>Rédigé par {item.authorName}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Description / Contenu textuel */}
      {item.description && (
        <div className="prose max-w-none text-base sm:text-lg text-base-content/85 leading-relaxed whitespace-pre-line border-t border-base-300 pt-6">
          {item.description}
        </div>
      )}

      {/* Galerie photos si présente */}
      {item.images && item.images.length > 0 && (
        <div className="space-y-4 border-t border-base-300 pt-6">
          <h2 className="text-xl font-bold text-base-content">
            Galerie d'illustrations ({item.images.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {item.images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-video overflow-hidden rounded-xl bg-base-200 border border-base-300"
              >
                <Image
                  src={img.imageUrl}
                  alt={img.caption || item.title}
                  fill
                  className="object-cover hover:scale-105 transition duration-300"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Boîte de partage / appel à l'action */}
      <div className="rounded-2xl bg-base-200/40 border border-base-300 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="font-bold text-sm">Partager avec la communauté</p>
          <p className="text-xs text-base-content/60">
            Invitez vos frères, sœurs, voisins et amis à ce programme.
          </p>
        </div>
        <Link href="/contact" className="btn btn-primary btn-sm rounded-xl">
          Besoin d'un itinéraire ou d'un contact ?
        </Link>
      </div>
    </div>
  );
}
