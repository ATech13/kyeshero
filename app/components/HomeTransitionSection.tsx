import Link from "next/link";
import {
  Radio,
  Calendar,
  Heart,
  ArrowRight,
  Clock,
  MapPin,
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
            Trois espaces clairs pour écouter la Parole, participer aux rassemblements et découvrir notre foi.
          </p>
        </div>

        {/* 3 Portails clés correspondant aux 3 onglets */}
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

          {/* Portail 2 : Événements & Actualités */}
          <Link
            href="/evenements"
            className="group rounded-3xl border border-base-300 bg-base-100 p-6 flex flex-col justify-between transition hover:border-secondary/50 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10 text-secondary group-hover:scale-105 transition-transform">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-base-content group-hover:text-secondary transition">
                Événements &amp; Actualités
              </h3>
              <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
                Cultes dominicaux, séminaires bibliques, veillées et nouvelles de notre communauté réunies.
              </p>
            </div>
            <div className="pt-5 mt-4 border-t border-base-200 flex items-center justify-between text-xs font-bold text-secondary">
              <span>Consulter l'agenda</span>
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

        {/* Prochain rassemblement ou actualité mis en avant si disponible */}
        {featuredPublication && (
          <div className="rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    featuredPublication.type === "EVENT"
                      ? "bg-secondary text-secondary-content"
                      : "bg-primary text-primary-content"
                  }`}
                >
                  {featuredPublication.type === "EVENT" ? "À Venir" : "Actualité"}
                </span>
                <span className="text-xs text-base-content/60">
                  {new Date(featuredPublication.date).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-base-content truncate">
                {featuredPublication.title}
              </h4>
              <div className="flex items-center gap-4 text-xs text-base-content/70">
                {featuredPublication.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                    <span className="truncate">{featuredPublication.location}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-secondary shrink-0" />
                  <span>
                    {new Date(featuredPublication.date).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </span>
              </div>
            </div>

            <Link
              href={`/evenements/${featuredPublication.slug}`}
              className="btn btn-primary btn-sm rounded-xl font-bold shrink-0 self-start sm:self-center"
            >
              <span>Consulter</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
