"use client";

import { useState, useMemo } from "react";
import { Search, Calendar, Newspaper, Layers, X } from "lucide-react";
import type { UnifiedPublication } from "@/actions/events";
import UnifiedPublicationCard from "../components/UnifiedPublicationCard";
import EmptyState from "../components/EmptyState";

type FilterTab = "ALL" | "EVENT" | "NEWS";

interface EventsExplorerProps {
  initialPublications: UnifiedPublication[];
  initialFilter?: FilterTab;
}

export default function EventsExplorer({
  initialPublications,
  initialFilter = "ALL",
}: EventsExplorerProps) {
  const [currentTab, setCurrentTab] = useState<FilterTab>(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return initialPublications.filter((item) => {
      // Filtre par type
      if (currentTab === "EVENT" && item.type !== "EVENT") return false;
      if (currentTab === "NEWS" && item.type !== "NEWS") return false;

      // Filtre par recherche
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.description?.toLowerCase().includes(q);
        const inLoc = item.location?.toLowerCase().includes(q);
        const inCat = item.category?.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inLoc && !inCat) return false;
      }

      return true;
    });
  }, [initialPublications, currentTab, searchQuery]);

  const eventCount = useMemo(
    () => initialPublications.filter((i) => i.type === "EVENT").length,
    [initialPublications]
  );
  const newsCount = useMemo(
    () => initialPublications.filter((i) => i.type === "NEWS").length,
    [initialPublications]
  );

  return (
    <div className="space-y-8">
      {/* Contrôles de filtrage & Recherche */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-base-200/50 p-3 sm:p-4 rounded-2xl border border-base-300">
        {/* Onglets : Tous | Événements | Actualités */}
        <div className="flex w-full flex-wrap rounded-xl bg-base-100 p-1 border border-base-300 shadow-2xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setCurrentTab("ALL")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              currentTab === "ALL"
                ? "bg-primary text-primary-content shadow-xs"
                : "text-base-content/70 hover:text-base-content"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Tous</span>
            <span className="ml-1 rounded-full bg-base-200/50 px-1.5 py-0.2 text-[10px]">
              {initialPublications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab("EVENT")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              currentTab === "EVENT"
                ? "bg-secondary text-secondary-content shadow-xs"
                : "text-base-content/70 hover:text-base-content"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Événements</span>
            <span className="ml-1 rounded-full bg-base-200/50 px-1.5 py-0.2 text-[10px]">
              {eventCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab("NEWS")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
              currentTab === "NEWS"
                ? "bg-primary text-primary-content shadow-xs"
                : "text-base-content/70 hover:text-base-content"
            }`}
          >
            <Newspaper className="h-3.5 w-3.5" />
            <span>Actualités</span>
            <span className="ml-1 rounded-full bg-base-200/50 px-1.5 py-0.2 text-[10px]">
              {newsCount}
            </span>
          </button>
        </div>

        {/* Champ de recherche */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher par mot-clé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm input-bordered w-full pl-9 pr-8 rounded-xl bg-base-100 text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              title="Effacer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Liste des publications */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-7 w-7" />}
          title="Aucun contenu trouvé"
          description={
            searchQuery
              ? `Aucun événement ou actualité ne correspond à la recherche « ${searchQuery} ».`
              : "Les prochaines annonces et rassemblements apparaîtront ici."
          }
        />
      ) : (
        <div className="grid gap-5">
          {filteredItems.map((item) => (
            <UnifiedPublicationCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
