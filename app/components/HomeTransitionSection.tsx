import Link from "next/link";
import Image from "next/image";
import {
  Radio,
  Camera,
  Heart,
  ArrowRight,
  ThumbsUp,
  Image as ImageIcon,
} from "lucide-react";
import type { UnifiedPublication } from "@/actions/events";

interface HomeTransitionSectionProps {
  featuredPublication?: UnifiedPublication | null;
}

export default function HomeTransitionSection({
  featuredPublication,
}: HomeTransitionSectionProps) {
  return (
    <section className="relative py-14 sm:py-20 bg-gradient-to-b from-base-100 via-base-200/50 to-base-100 border-b border-base-300/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Titre de transition sobre */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary uppercase tracking-wider">
            <span>Vie de l'Église &amp; Ressources</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
            Accédez facilement à notre communauté
          </h2>
          <p className="text-xs sm:text-sm text-base-content/70">
            Trois espaces clairs pour écouter la Parole, vivre les moments forts en photos et découvrir notre foi.
          </p>
        </div>

        {/* 3 Portails clés */}
        <div className="grid gap-6 sm:grid-cols-3">
          {/* Portail 1 : Contenus */}
          <Link
            href="/contenus"
            className="group rounded-3xl border border-base-300 bg-base-100 p-6 flex flex-col justify-between transition hover:border-primary/50 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <Radio className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content group-hover:text-primary transition">
                Contenus Multimédias
              </h3>
              <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
                Prédications audio, chants spirituels et cultes officiels diffusés sur YouTube.
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-base-200 flex items-center justify-between text-xs font-bold text-primary">
              <span>Écouter &amp; Regarder</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Portail 2 : Événements en Images */}
          <Link
            href="/evenements"
            className="group rounded-3xl border border-base-300 bg-base-100 p-6 flex flex-col justify-between transition hover:border-secondary/50 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10 text-secondary group-hover:scale-105 transition-transform">
                <Camera className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content group-hover:text-secondary transition">
                Événements en Images
              </h3>
              <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
                Photos des cultes, sainte cène, conventions et rassemblements fraternels de l'église.
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-base-200 flex items-center justify-between text-xs font-bold text-secondary">
              <span>Voir les photos</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Portail 3 : À-propos & Horaires */}
          <Link
            href="/a-propos"
            className="group rounded-3xl border border-base-300 bg-base-100 p-6 flex flex-col justify-between transition hover:border-primary/50 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content group-hover:text-primary transition">
                À propos &amp; Doctrine
              </h3>
              <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
                Notre confession de foi biblique, les horaires des rassemblements et notre accueil à Keshero.
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-base-200 flex items-center justify-between text-xs font-bold text-primary">
              <span>Découvrir l'église</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Dernière publication photo mise en avant si disponible */}
        {featuredPublication && (
          <div className="rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 min-w-0">
              {/* Vignette photo si disponible */}
              {featuredPublication.coverImageUrl ? (
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden shrink-0 border border-base-200 bg-neutral-900">
                  <Image
                    src={featuredPublication.coverImageUrl}
                    alt={featuredPublication.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-secondary text-secondary-content">
                    <Camera className="h-3 w-3" />
                    <span>En Images</span>
                  </span>
                  <span className="text-xs text-base-content/60">
                    {new Date(featuredPublication.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-base-content truncate">
                  {featuredPublication.title}
                </h4>
                {featuredPublication.likesCount !== undefined && featuredPublication.likesCount > 0 && (
                  <p className="text-xs text-base-content/70 flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3 text-blue-600 fill-blue-600" />
                    <span>{featuredPublication.likesCount} mentions j'aime</span>
                  </p>
                )}
              </div>
            </div>

            <Link
              href={`/evenements/${featuredPublication.slug}`}
              className="btn btn-primary btn-sm rounded-xl font-bold shrink-0 self-start sm:self-center gap-1.5"
            >
              <span>Voir l'album</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
