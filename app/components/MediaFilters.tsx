"use client";

import { Search, Headphones, Video, BookOpen, Music, Users } from "lucide-react";

export type MediaTab = "ALL" | "SERMON" | "SONG" | "MEETING" | "VIDEO";

interface MediaFiltersProps {
  currentTab: MediaTab;
  onTabChange: (tab: MediaTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const tabs: { id: MediaTab; label: string; icon: React.ReactNode }[] = [
  { id: "ALL", label: "Tout", icon: null },
  { id: "SERMON", label: "Prédications", icon: <BookOpen className="h-3.5 w-3.5" /> },
  { id: "SONG", label: "Chansons", icon: <Music className="h-3.5 w-3.5" /> },
  { id: "MEETING", label: "Réunions", icon: <Users className="h-3.5 w-3.5" /> },
  { id: "VIDEO", label: "Vidéos YouTube", icon: <Video className="h-3.5 w-3.5" /> },
];

export default function MediaFilters({
  currentTab,
  onTabChange,
  searchQuery,
  onSearchChange,
}: MediaFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Onglets avec scroll horizontal doux sur mobile */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {tabs.map(({ id, label, icon }) => {
          const isActive = currentTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? "bg-primary text-primary-content shadow-sm"
                  : "bg-base-200 text-base-content/75 hover:bg-base-300"
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Champ de recherche */}
      <div className="relative sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/45" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher un titre ou prédicateur..."
          className="input input-sm input-bordered w-full pl-9 rounded-xl text-xs bg-base-100"
        />
      </div>
    </div>
  );
}
