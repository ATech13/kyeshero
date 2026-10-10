"use client";

import { useState, useTransition } from "react";
import {
  MessageSquareHeart,
  MessageCircle,
  Heart,
  Eye,
  Archive,
  Trash2,
  CheckCircle2,
  Filter,
  Search,
  Video,
  Clock,
  Mail,
  User,
  ExternalLink,
  ChevronDown,
  Layers,
} from "lucide-react";
import {
  StoredInteraction,
  InteractionType,
  InteractionStatus,
  updateInteractionStatus,
  deleteInteraction,
} from "@/actions/interactions";
import { useRouter } from "next/navigation";

interface InteractionsManagerProps {
  initialInteractions: StoredInteraction[];
  groupedByVideo: {
    videoId: string;
    videoTitle: string;
    commentsCount: number;
    greetingsCount: number;
    newCount: number;
    total: number;
  }[];
}

export default function InteractionsManager({
  initialInteractions,
  groupedByVideo,
}: InteractionsManagerProps) {
  const router = useRouter();
  const [interactions, setInteractions] = useState<StoredInteraction[]>(initialInteractions);
  const [typeFilter, setTypeFilter] = useState<"ALL" | InteractionType>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | InteractionStatus>("ALL");
  const [selectedVideoId, setSelectedVideoId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Compteurs
  const totalCount = interactions.length;
  const commentCount = interactions.filter((i) => i.type === "COMMENT").length;
  const greetingCount = interactions.filter((i) => i.type === "GREETING").length;
  const newCount = interactions.filter((i) => i.status === "NEW").length;
  const archivedCount = interactions.filter((i) => i.status === "ARCHIVED").length;

  // Filtrage
  const filteredInteractions = interactions.filter((item) => {
    if (typeFilter !== "ALL" && item.type !== typeFilter) return false;
    if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
    if (selectedVideoId !== "ALL" && item.videoId !== selectedVideoId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.authorName.toLowerCase().includes(q);
      const matchContent = item.content.toLowerCase().includes(q);
      const matchVideo = item.videoTitle.toLowerCase().includes(q);
      const matchContact = (item.contact || "").toLowerCase().includes(q);
      if (!matchName && !matchContent && !matchVideo && !matchContact) return false;
    }
    return true;
  });

  const handleStatusChange = async (id: string, newStatus: InteractionStatus) => {
    startTransition(async () => {
      try {
        await updateInteractionStatus(id, newStatus);
        setInteractions((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        setActionSuccessMessage(`Statut mis à jour (${newStatus === "READ" ? "Lu" : newStatus === "ARCHIVED" ? "Archivé" : "Nouveau"}).`);
        setTimeout(() => setActionSuccessMessage(null), 3000);
        router.refresh();
      } catch (err) {
        alert("Erreur lors de la mise à jour du statut.");
      }
    });
  };

  const handleDelete = async (id: string, authorName: string) => {
    if (!confirm(`Supprimer définitivement ce message de ${authorName} ?`)) return;

    startTransition(async () => {
      try {
        await deleteInteraction(id);
        setInteractions((prev) => prev.filter((item) => item.id !== id));
        setActionSuccessMessage("Message supprimé.");
        setTimeout(() => setActionSuccessMessage(null), 3000);
        router.refresh();
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast message de succès */}
      {actionSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-base-900 text-base-100 px-4 py-3 shadow-2xl flex items-center gap-2 border border-base-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold">{actionSuccessMessage}</span>
        </div>
      )}

      {/* Cartes de compteurs statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => {
            setTypeFilter("ALL");
            setStatusFilter("ALL");
          }}
          className={`text-left p-4 rounded-2xl border transition ${
            typeFilter === "ALL" && statusFilter === "ALL"
              ? "border-primary bg-primary/5 shadow-xs"
              : "border-base-300 bg-base-100 hover:border-base-content/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-base-content/60">Total</span>
            <Layers className="h-4 w-4 text-base-content/40" />
          </div>
          <p className="text-2xl font-black text-base-content mt-1">{totalCount}</p>
          <p className="text-[11px] text-base-content/60 mt-0.5">Toutes interactions</p>
        </button>

        <button
          onClick={() => {
            setStatusFilter("NEW");
            setTypeFilter("ALL");
          }}
          className={`text-left p-4 rounded-2xl border transition ${
            statusFilter === "NEW"
              ? "border-amber-500 bg-amber-500/10 shadow-xs"
              : "border-base-300 bg-base-100 hover:border-base-content/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Non lus</span>
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{newCount}</p>
          <p className="text-[11px] text-base-content/60 mt-0.5">À traiter</p>
        </button>

        <button
          onClick={() => setTypeFilter("COMMENT")}
          className={`text-left p-4 rounded-2xl border transition ${
            typeFilter === "COMMENT"
              ? "border-primary bg-primary/10 shadow-xs"
              : "border-base-300 bg-base-100 hover:border-base-content/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary">Commentaires</span>
            <MessageCircle className="h-4 w-4 text-primary/60" />
          </div>
          <p className="text-2xl font-black text-primary mt-1">{commentCount}</p>
          <p className="text-[11px] text-base-content/60 mt-0.5">Réactions & questions</p>
        </button>

        <button
          onClick={() => setTypeFilter("GREETING")}
          className={`text-left p-4 rounded-2xl border transition ${
            typeFilter === "GREETING"
              ? "border-secondary bg-secondary/10 shadow-xs"
              : "border-base-300 bg-base-100 hover:border-base-content/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary">Salutations</span>
            <Heart className="h-4 w-4 text-secondary/60" />
          </div>
          <p className="text-2xl font-black text-secondary mt-1">{greetingCount}</p>
          <p className="text-[11px] text-base-content/60 mt-0.5">Bénédictions fraternelles</p>
        </button>
      </div>

      {/* Barre de filtrage & Recherche */}
      <div className="rounded-2xl border border-base-300 bg-base-100 p-4 space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Onglets de type */}
          <div className="inline-flex rounded-xl bg-base-200 p-1 gap-1">
            <button
              onClick={() => setTypeFilter("ALL")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                typeFilter === "ALL" ? "bg-base-100 text-base-content shadow-xs" : "text-base-content/70 hover:text-base-content"
              }`}
            >
              Tous ({totalCount})
            </button>
            <button
              onClick={() => setTypeFilter("COMMENT")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                typeFilter === "COMMENT" ? "bg-base-100 text-primary shadow-xs" : "text-base-content/70 hover:text-base-content"
              }`}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Commentaires ({commentCount})</span>
            </button>
            <button
              onClick={() => setTypeFilter("GREETING")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                typeFilter === "GREETING" ? "bg-base-100 text-secondary shadow-xs" : "text-base-content/70 hover:text-base-content"
              }`}
            >
              <Heart className="h-3.5 w-3.5" />
              <span>Salutations ({greetingCount})</span>
            </button>
          </div>

          {/* Filtres par statut */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-base-content/60">Statut :</span>
            {(["ALL", "NEW", "READ", "ARCHIVED"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  statusFilter === st
                    ? "bg-base-content text-base-100 shadow-xs"
                    : "bg-base-200 text-base-content/75 hover:bg-base-300"
                }`}
              >
                {st === "ALL" && "Tous"}
                {st === "NEW" && "Nouveaux"}
                {st === "READ" && "Lus"}
                {st === "ARCHIVED" && "Archivés"}
              </button>
            ))}
          </div>
        </div>

        {/* Deuxième ligne : Sélecteur de prédication & Champ de recherche */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-base-200">
          {/* Sélecteur Prédication */}
          <div className="relative sm:w-72">
            <select
              value={selectedVideoId}
              onChange={(e) => setSelectedVideoId(e.target.value)}
              className="select select-sm select-bordered w-full rounded-xl text-xs font-medium"
            >
              <option value="ALL">Toutes les prédications ({groupedByVideo.length})</option>
              {groupedByVideo.map((v) => (
                <option key={v.videoId} value={v.videoId}>
                  {v.videoTitle} ({v.total})
                </option>
              ))}
            </select>
          </div>

          {/* Recherche textuelle */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher par nom, message ou prédication..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-sm input-bordered w-full pl-9 rounded-xl text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-base-content/50 hover:text-base-content font-bold"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Regroupement par prédication si vue prédication active */}
      {selectedVideoId === "ALL" && groupedByVideo.length > 0 && (
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-wider text-base-content">
                Interactions par Prédication
              </h3>
            </div>
            <span className="text-xs text-base-content/60 font-medium">
              {groupedByVideo.length} prédication(s) avec messages
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {groupedByVideo.map((vid) => (
              <button
                key={vid.videoId}
                onClick={() => setSelectedVideoId(vid.videoId)}
                className="text-left p-3 rounded-xl bg-base-200/60 hover:bg-base-200 border border-base-300 transition flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-base-content truncate">{vid.videoTitle}</p>
                  <p className="text-[10px] text-base-content/60 mt-0.5">
                    {vid.commentsCount} com. · {vid.greetingsCount} salut.
                  </p>
                </div>
                {vid.newCount > 0 && (
                  <span className="badge badge-xs badge-warning font-bold shrink-0">
                    {vid.newCount} new
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Liste des messages */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold text-base-content/70">
            {filteredInteractions.length} interaction{filteredInteractions.length > 1 ? "s" : ""}{" "}
            affichée{filteredInteractions.length > 1 ? "s" : ""}
            {selectedVideoId !== "ALL" && " (filtré par prédication)"}
          </p>
          {selectedVideoId !== "ALL" && (
            <button
              onClick={() => setSelectedVideoId("ALL")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Réinitialiser le filtre prédication
            </button>
          )}
        </div>

        {filteredInteractions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-12 text-center space-y-3">
            <MessageSquareHeart className="mx-auto h-8 w-8 text-base-content/30" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-base-content">Aucune interaction trouvée</h4>
              <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                Aucun message ne correspond aux critères sélectionnés. Les commentaires ou salutations
                laissés par les visiteurs apparaîtront ici.
              </p>
            </div>
            {(typeFilter !== "ALL" || statusFilter !== "ALL" || selectedVideoId !== "ALL" || searchQuery) && (
              <button
                onClick={() => {
                  setTypeFilter("ALL");
                  setStatusFilter("ALL");
                  setSelectedVideoId("ALL");
                  setSearchQuery("");
                }}
                className="btn btn-ghost btn-xs text-primary font-bold"
              >
                Réinitialiser tous les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInteractions.map((item) => {
              const isGreeting = item.type === "GREETING";
              const isNew = item.status === "NEW";
              const isArchived = item.status === "ARCHIVED";

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition shadow-xs space-y-3 ${
                    isNew
                      ? "border-amber-400/50 bg-amber-500/5 dark:bg-amber-950/10"
                      : isArchived
                      ? "border-base-300 bg-base-100/50 opacity-75"
                      : "border-base-300 bg-base-100"
                  }`}
                >
                  {/* Entête du message : Type, Auteur, Prédication & Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-base-200/80 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Badge Type */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${
                          isGreeting
                            ? "bg-secondary/15 text-secondary"
                            : "bg-primary/15 text-primary"
                        }`}
                      >
                        {isGreeting ? (
                          <>
                            <Heart className="h-3 w-3 fill-current" />
                            <span>Salutation</span>
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-3 w-3" />
                            <span>Commentaire</span>
                          </>
                        )}
                      </span>

                      {/* Badge Statut */}
                      <span
                        className={`badge badge-sm font-bold ${
                          isNew
                            ? "badge-warning"
                            : isArchived
                            ? "badge-ghost text-base-content/60"
                            : "badge-success"
                        }`}
                      >
                        {isNew ? "Nouveau" : isArchived ? "Archivé" : "Lu"}
                      </span>

                      {/* Auteur */}
                      <div className="flex items-center gap-1.5 font-bold text-sm text-base-content">
                        <User className="h-3.5 w-3.5 text-base-content/50" />
                        <span>{item.authorName}</span>
                      </div>

                      {/* Contact éventuel */}
                      {item.contact && (
                        <div className="flex items-center gap-1 text-xs text-base-content/60 bg-base-200/70 px-2 py-0.5 rounded-md">
                          <Mail className="h-3 w-3" />
                          <span>{item.contact}</span>
                        </div>
                      )}
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-xs text-base-content/60 font-medium">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Prédication associée */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-base-content/75 bg-base-200/50 px-3 py-1.5 rounded-xl border border-base-200">
                    <Video className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-base-content/50">Prédication :</span>
                    <span className="text-base-content font-bold truncate">
                      {item.videoTitle || "Prédication"}
                    </span>
                  </div>

                  {/* Corps du message */}
                  <div className="text-sm text-base-content leading-relaxed whitespace-pre-line bg-base-200/30 p-3 rounded-xl border border-base-200">
                    {item.content}
                  </div>

                  {/* Actions Administrateur */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.status !== "READ" && (
                        <button
                          onClick={() => handleStatusChange(item.id, "READ")}
                          disabled={isPending}
                          className="btn btn-xs btn-outline btn-success rounded-lg gap-1 font-bold"
                          title="Marquer comme lu"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Marquer lu</span>
                        </button>
                      )}

                      {item.status !== "ARCHIVED" && (
                        <button
                          onClick={() => handleStatusChange(item.id, "ARCHIVED")}
                          disabled={isPending}
                          className="btn btn-xs btn-ghost text-base-content/70 hover:text-base-content rounded-lg gap-1 font-semibold"
                          title="Archiver"
                        >
                          <Archive className="h-3 w-3" />
                          <span>Archiver</span>
                        </button>
                      )}

                      {item.status !== "NEW" && (
                        <button
                          onClick={() => handleStatusChange(item.id, "NEW")}
                          disabled={isPending}
                          className="btn btn-xs btn-ghost text-amber-600 dark:text-amber-400 rounded-lg gap-1 font-semibold"
                          title="Remettre en nouveau"
                        >
                          <span>Remettre à traiter</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(item.id, item.authorName)}
                      disabled={isPending}
                      className="btn btn-xs btn-ghost btn-error rounded-lg gap-1 font-semibold"
                      title="Supprimer définitivement"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
