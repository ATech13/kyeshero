import { requireAdmin } from "@/lib/auth-user";
import { getAllAdminInteractions, getInteractionsStats } from "@/actions/interactions";
import InteractionsManager from "./InteractionsManager";
import { MessageSquareHeart } from "lucide-react";

export const metadata = {
  title: "Messages reçus des fidèles | Administration",
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
      {/* En-tête simple et humain */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-300 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquareHeart className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-base-content">
                Messages reçus des fidèles
              </h1>
              <p className="text-xs sm:text-sm text-base-content/65 mt-0.5">
                Retrouvez ici les salutations, remerciements et questions envoyés par les fidèles sous les vidéos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gestionnaire simplifié */}
      <InteractionsManager
        initialInteractions={interactions}
        groupedByVideo={stats.groupedByVideo}
      />
    </div>
  );
}
