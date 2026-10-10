import { requireAdmin } from "@/lib/auth-user";
import { getAllAdminInteractions, getInteractionsStats } from "@/actions/interactions";
import InteractionsManager from "./InteractionsManager";
import { MessageSquareHeart } from "lucide-react";

export const metadata = {
  title: "Interactions & Salutations Prédications | Administration",
};

export default async function AdminInteractionsPage() {
  await requireAdmin().catch(() => null);

  const [interactions, stats] = await Promise.all([
    getAllAdminInteractions().catch(() => []),
    getInteractionsStats().catch(() => ({
      total: 0,
      commentsCount: 0,
      greetingsCount: 0,
      newCount: 0,
      groupedByVideo: [],
    })),
  ]);

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-300 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <MessageSquareHeart className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-base-content">
              Interactions & Salutations
            </h1>
          </div>
          <p className="text-sm text-base-content/65 mt-1.5">
            Consultez, traitez et archivez les commentaires et salutations laissés par les fidèles et visiteurs sur les prédications vidéos.
          </p>
        </div>
      </div>

      {/* Gestionnaire interactif avec filtres et actions */}
      <InteractionsManager
        initialInteractions={interactions}
        groupedByVideo={stats.groupedByVideo}
      />
    </div>
  );
}
