import { getUnifiedPublications } from "@/actions/events";
import EventsExplorer from "./EventsExplorer";
import { Calendar, Info } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Événements & Actualités · Assemblée Chrétienne de Goma",
  description:
    "Espace officiel des rassemblements, cultes spéciaux, annonces importantes et vie de notre église locale.",
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const initialFilter =
    params.type === "NEWS" || params.filter === "news"
      ? "NEWS"
      : params.type === "EVENT" || params.filter === "event"
      ? "EVENT"
      : "ALL";

  const publications = await getUnifiedPublications({ limit: 50 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
      {/* Header unifié */}
      <div className="border-b border-base-300 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3">
          <Calendar className="h-3.5 w-3.5" />
          <span>Agenda &amp; Vie de la communauté</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-base-content tracking-tight">
          Événements &amp; Actualités
        </h1>
        <p className="mt-2 text-sm sm:text-base text-base-content/70 max-w-2xl leading-relaxed">
          Retrouvez l’ensemble des cultes, séminaires, veillées de prière ainsi que les annonces et nouvelles importantes de l’Assemblée Chrétienne de Goma.
        </p>

        {/* Note d'aide discrète pour les utilisateurs */}
        <div className="mt-4 flex items-center gap-2 text-xs text-base-content/60 bg-base-200/50 p-2.5 rounded-xl border border-base-300/60 max-w-xl">
          <Info className="h-4 w-4 text-primary shrink-0" />
          <span>
            Utilisez les filtres pour basculer facilement entre les <strong>Événements à venir</strong> et les <strong>Actualités</strong> de l'église.
          </span>
        </div>
      </div>

      {/* Explorateur interactif unifié */}
      <EventsExplorer
        initialPublications={publications}
        initialFilter={initialFilter}
      />
    </div>
  );
}
