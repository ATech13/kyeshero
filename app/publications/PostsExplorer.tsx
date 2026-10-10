"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, HardHat, Calendar, Users, Megaphone, Heart, HelpCircle, Layers } from "lucide-react";
import PostCard from "@/app/components/PostCard";
import { POST_CATEGORY_LABELS } from "@/lib/post-constants";

interface PostItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  coverImageUrl?: string | null;
  eventDate?: Date | string | null;
  publishedAt?: Date | string | null;
  images?: { id: string; url: string; caption?: string | null }[];
}

interface PostsExplorerProps {
  initialPosts: PostItem[];
}

const CATEGORY_TABS = [
  { key: "ALL", label: "Tous les contenus", icon: Layers },
  { key: "CONSTRUCTION", label: "Travaux & Constructions", icon: HardHat },
  { key: "CHURCH_LIFE", label: "Vie de l'Église", icon: Heart },
  { key: "EVENT", label: "Événements", icon: Calendar },
  { key: "ACTIVITY", label: "Activités", icon: Users },
  { key: "ANNOUNCEMENT", label: "Annonces", icon: Megaphone },
  { key: "OTHER", label: "Autres", icon: HelpCircle },
];

export default function PostsExplorer({ initialPosts }: PostsExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchCat =
        selectedCategory === "ALL" || post.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q);

      return matchCat && matchQuery;
    });
  }, [initialPosts, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col gap-4">
        {/* Champ de recherche */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher une publication, un chantier, une annonce..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-10 rounded-xl text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-base-content/50 hover:text-base-content"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Boutons de catégories horizontaux avec scroll doux */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedCategory === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key)}
                className={`btn btn-sm rounded-xl gap-2 font-medium shrink-0 transition-all ${
                  isActive
                    ? "btn-primary text-primary-content shadow-xs"
                    : "btn-ghost bg-base-200/80 hover:bg-base-200 text-base-content/75"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grille des publications */}
      {filteredPosts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-base-300 py-16 px-4 text-center">
          <SlidersHorizontal className="mx-auto h-10 w-10 text-base-content/30 mb-3" />
          <h3 className="text-base font-bold text-base-content">
            Aucune publication trouvée
          </h3>
          <p className="text-sm text-base-content/60 max-w-sm mx-auto mt-1">
            {searchQuery || selectedCategory !== "ALL"
              ? "Essayez d'ajuster vos critères de recherche ou de sélectionner une autre catégorie."
              : "Les publications et nouvelles de l'église apparaîtront ici dès leur parution."}
          </p>
          {(searchQuery || selectedCategory !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
              }}
              className="btn btn-sm btn-ghost mt-4 text-primary"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}
