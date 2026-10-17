"use client";

import { useState, useMemo } from "react";
import { Search, X, Camera, Image as ImageIcon } from "lucide-react";
import type { PhotoPublication } from "@/actions/events";
import PhotoPublicationCard from "../components/PhotoPublicationCard";
import EmptyState from "../components/EmptyState";
import { matchesSearchQuery } from "@/lib/search";

interface EventsExplorerProps {
  initialPublications: PhotoPublication[];
}

export default function EventsExplorer({
  initialPublications,
}: EventsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return initialPublications;

    return initialPublications.filter((item) =>
      matchesSearchQuery(
        searchQuery,
        item.title,
        item.description,
        item.authorName
      )
    );
  }, [initialPublications, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Barre de recherche simple et élégante */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-base-200/40 p-3 sm:p-4 rounded-2xl border border-base-200/80 max-w-2xl mx-auto">

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une publication..."
            className="input input-sm w-full pl-9 pr-8 rounded-xl bg-base-100 border-base-300 text-xs sm:text-sm focus:outline-none focus:border-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              aria-label="Effacer la recherche"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Fil des publications photos */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="h-7 w-7" />}
          title={searchQuery ? "Aucune publication trouvée" : "Aucune publication pour le moment"}
          description={
            searchQuery
              ? `Aucun résultat ne correspond à « ${searchQuery} ».`
              : "Les photos des cultes et moments forts de l'église apparaîtront ici."
          }
        />
      ) : (
        <div className="flex flex-col space-y-6 sm:space-y-8 items-center">
          {filteredItems.map((pub) => (
            <PhotoPublicationCard key={pub.id} publication={pub} />
          ))}
        </div>
      )}
    </div>
  );
}
