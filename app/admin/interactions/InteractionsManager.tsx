"use client";

import { useState, useTransition, useEffect } from "react";
import {
  MessageSquareHeart,
  MessageCircle,
  Heart,
  CheckCircle2,
  Search,
  Video,
  Clock,
  User,
  Archive,
  Trash2,
  CheckCheck,
  MapPin,
  ExternalLink,
  Phone,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import {
  StoredInteraction,
  InteractionType,
  InteractionStatus,
  updateInteractionStatus,
  deleteInteraction,
  markAllInteractionsAsRead,
} from "@/actions/interactions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

type TabType = "UNREAD" | "ALL" | "ARCHIVED";

export default function InteractionsManager({
  initialInteractions,
  groupedByVideo,
}: InteractionsManagerProps) {
  const router = useRouter();
  const [interactions, setInteractions] = useState<StoredInteraction[]>(initialInteractions);

  // Synchroniser quand les props serveur changent (revalidation, refresh)
  useEffect(() => {
    setInteractions(initialInteractions);
  }, [initialInteractions]);

  // Compteurs
  const unreadCount = interactions.filter((i) => i.status === "NEW").length;
  const archivedCount = interactions.filter((i) => i.status === "ARCHIVED").length;
  const activeCount = interactions.filter((i) => i.status !== "ARCHIVED").length;

  // Onglet principal : "À lire" en premier si des messages non lus existent
  const [activeTab, setActiveTab] = useState<TabType>(unreadCount > 0 ? "UNREAD" : "ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | InteractionType>("ALL");
  const [selectedVideoId, setSelectedVideoId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // Action : actualiser les messages reçus depuis le serveur
  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
      toast.success("Boîte de réception actualisée");
    });
  };

  // Filtrage simple et lisible
  const filteredList = interactions.filter((item) => {
    // Filtre de l'onglet principal
    if (activeTab === "UNREAD" && item.status !== "NEW") return false;
    if (activeTab === "ARCHIVED" && item.status !== "ARCHIVED") return false;
    if (activeTab === "ALL" && item.status === "ARCHIVED") return false; // les archives ont leur propre onglet

    // Filtre type (Salutation vs Commentaire)
    if (typeFilter !== "ALL" && item.type !== typeFilter) return false;

    // Filtre par vidéo
    if (selectedVideoId !== "ALL" && item.videoId !== selectedVideoId) return false;

    // Recherche par mot-clé
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inAuthor = item.authorName.toLowerCase().includes(q);
      const inContent = item.content.toLowerCase().includes(q);
      const inVideo = item.videoTitle.toLowerCase().includes(q);
      const inContact = (item.contact || "").toLowerCase().includes(q);
      if (!inAuthor && !inContent && !inVideo && !inContact) return false;
    }

    return true;
  });

  // Action : changer le statut d'un message
  const handleStatusChange = async (id: string, newStatus: InteractionStatus) => {
    startTransition(async () => {
      try {
        await updateInteractionStatus(id, newStatus);
        setInteractions((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        if (newStatus === "READ") {
          toast.success("Message marqué comme lu");
        } else if (newStatus === "ARCHIVED") {
          toast.success("Message déplacé dans les archives");
        } else {
          toast.info("Message replacé dans les nouveaux");
        }
        router.refresh();
      } catch (err) {
        toast.error("Une erreur est survenue lors de la mise à jour");
      }
    });
  };

  // Action : tout marquer comme lu
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    startTransition(async () => {
      try {
        await markAllInteractionsAsRead();
        setInteractions((prev) =>
          prev.map((item) => (item.status === "NEW" ? { ...item, status: "READ" } : item))
        );
        toast.success("Tous les messages ont été marqués comme lus");
        router.refresh();
      } catch (err) {
        toast.error("Impossible de marquer les messages");
      }
    });
  };

  // Action : supprimer
  const handleDelete = async (id: string, authorName: string) => {
    if (!confirm(`Supprimer définitivement ce message de ${authorName} ?`)) return;

    startTransition(async () => {
      try {
        await deleteInteraction(id);
        setInteractions((prev) => prev.filter((item) => item.id !== id));
        toast.success("Message supprimé");
        router.refresh();
      } catch (err) {
        toast.error("Erreur lors de la suppression");
      }
    });
  };

  // Générer les initiales de l'auteur pour un bel avatar humain
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || "FD";
  };

  // Détecter si le contact est un numéro WhatsApp / téléphone
  const isPhoneNumber = (contact?: string | null) => {
    if (!contact) return false;
    const digitsOnly = contact.replace(/\D/g, "");
    return digitsOnly.length >= 8;
  };

  return (
    <div className="space-y-6">
      {/* 1. Onglets principaux clairs (Boîte de réception) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-300 pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab("UNREAD")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
              activeTab === "UNREAD"
                ? "bg-primary text-primary-content shadow-sm"
                : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
            }`}
          >
            <span>À lire (Non lus)</span>
            {unreadCount > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-black ${
                  activeTab === "UNREAD"
                    ? "bg-primary-content text-primary"
                    : "bg-amber-500 text-white"
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("ALL")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
              activeTab === "ALL"
                ? "bg-primary text-primary-content shadow-sm"
                : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
            }`}
          >
            <span>Tous les messages</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === "ALL"
                  ? "bg-primary-content text-primary"
                  : "bg-base-300 text-base-content/80"
              }`}
            >
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ARCHIVED")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
              activeTab === "ARCHIVED"
                ? "bg-primary text-primary-content shadow-sm"
                : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
            }`}
          >
            <span>Archives</span>
            {archivedCount > 0 && (
              <span className="opacity-75 text-xs">({archivedCount})</span>
            )}
          </button>
        </div>

        {/* Actions à droite : Actualiser et Tout marquer comme lu */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="btn btn-sm btn-ghost text-base-content/75 hover:text-base-content font-bold gap-1.5 rounded-xl"
            title="Vérifier et rafraîchir les messages des fidèles"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
            <span>Actualiser</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="btn btn-sm btn-ghost text-emerald-600 hover:bg-emerald-500/10 font-bold gap-1.5 rounded-xl"
              title="Marquer tous les messages non lus comme lus"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Tout marquer comme lu ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Barre de recherche et filtres simples */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Champ de recherche */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher par nom de fidèle ou mot-clé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm input-bordered w-full pl-9 rounded-xl text-xs sm:text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-base-content/50 hover:text-base-content"
            >
              Effacer
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Filtre Salutation vs Commentaire */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="select select-sm select-bordered rounded-xl text-xs font-medium"
          >
            <option value="ALL">Tous les types de message</option>
            <option value="GREETING">Salutations fraternelles uniquement</option>
            <option value="COMMENT">Questions &amp; Commentaires uniquement</option>
          </select>

          {/* Filtre par vidéo (si plusieurs prédications) */}
          {groupedByVideo.length > 0 && (
            <select
              value={selectedVideoId}
              onChange={(e) => setSelectedVideoId(e.target.value)}
              className="select select-sm select-bordered rounded-xl text-xs font-medium max-w-[200px] truncate"
            >
              <option value="ALL">Toutes les prédications</option>
              {groupedByVideo.map((v) => (
                <option key={v.videoId} value={v.videoId}>
                  {v.videoTitle}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 3. Liste des messages */}
      <div className="space-y-3.5">
        {filteredList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-10 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-base-200 mx-auto text-base-content/40">
              <MessageSquareHeart className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-base-content">
                {activeTab === "UNREAD"
                  ? "Aucun message en attente"
                  : activeTab === "ARCHIVED"
                  ? "Aucun message archivé"
                  : "Aucun message trouvé"}
              </h3>
              <p className="text-xs sm:text-sm text-base-content/60 max-w-md mx-auto">
                {activeTab === "UNREAD"
                  ? "Excellente nouvelle ! Tous les messages des fidèles ont été lus et traités."
                  : searchQuery
                  ? "Aucun message ne correspond à votre recherche."
                  : "Les commentaires et salutations laissés par les fidèles s'afficheront ici."}
              </p>
            </div>
            {activeTab === "UNREAD" && activeCount > 0 && (
              <button
                onClick={() => setActiveTab("ALL")}
                className="btn btn-outline btn-sm rounded-xl text-xs font-bold"
              >
                Voir tous les messages ({activeCount})
              </button>
            )}
          </div>
        ) : (
          filteredList.map((item) => {
            const isUnread = item.status === "NEW";
            const isGreeting = item.type === "GREETING";
            const isArchived = item.status === "ARCHIVED";
            const hasPhone = isPhoneNumber(item.contact);
            const cleanPhone = (item.contact || "").replace(/\D/g, "");

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition p-4 sm:p-5 space-y-3 shadow-xs ${
                  isUnread
                    ? "border-amber-400/80 bg-amber-500/5 dark:bg-amber-950/15 ring-1 ring-amber-400/30"
                    : "border-base-300 bg-base-100"
                }`}
              >
                {/* Ligne 1 : Fidèle, badge statut et date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    {/* Avatar avec initiales */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                        isGreeting
                          ? "bg-secondary/15 text-secondary"
                          : "bg-primary/15 text-primary"
                      }`}
                    >
                      {getInitials(item.authorName)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm sm:text-base text-base-content">
                          {item.authorName}
                        </span>

                        {/* Lieu ou contact */}
                        {item.contact && !hasPhone && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-base-200 px-2 py-0.5 text-xs font-medium text-base-content/75">
                            <MapPin className="h-3 w-3 text-primary" />
                            <span>{item.contact}</span>
                          </span>
                        )}

                        {/* Numéro avec bouton WhatsApp direct si présent */}
                        {hasPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-xs font-bold hover:underline"
                            title="Ouvrir WhatsApp pour répondre à ce fidèle"
                          >
                            <Phone className="h-3 w-3" />
                            <span>WhatsApp : {item.contact}</span>
                          </a>
                        )}
                      </div>

                      {/* Date de réception */}
                      <p className="text-[11px] text-base-content/55 flex items-center gap-1 mt-0.5">
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
                      </p>
                    </div>
                  </div>

                  {/* Badges d'état et de type à droite */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {/* Badge type (Salutation ou Commentaire) */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                        isGreeting
                          ? "bg-secondary/10 text-secondary"
                          : "bg-primary/10 text-primary"
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

                    {/* Badge statut (Nouveau vs Lu vs Archivé) */}
                    {isUnread && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2.5 py-1 text-[11px] font-black">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>À lire</span>
                      </span>
                    )}

                    {!isUnread && !isArchived && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-base-200 text-base-content/65 px-2.5 py-1 text-[11px] font-semibold">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span>Lu</span>
                      </span>
                    )}

                    {isArchived && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-base-200 text-base-content/50 px-2 py-0.5 text-[11px]">
                        Archivé
                      </span>
                    )}
                  </div>
                </div>

                {/* Ligne 2 : Message du fidèle (simple, aéré, sans boîte grise encombrante) */}
                <div className="text-sm sm:text-base text-base-content leading-relaxed whitespace-pre-line pl-1 sm:pl-13 font-normal">
                  « {item.content} »
                </div>

                {/* Ligne 3 : Prédication associée */}
                <div className="flex items-center gap-2 text-xs text-base-content/70 pl-1 sm:pl-13 pt-1">
                  <Video className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-base-content/50">Prédication :</span>
                  <span className="font-semibold text-base-content truncate">
                    {item.videoTitle || "Prédication de l'église"}
                  </span>
                </div>

                {/* Ligne 4 : Actions Administrateur (Boutons clairs et bien identifiés) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-base-200/80 sm:pl-13">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Marquer comme lu (visible et évident) */}
                    {isUnread && (
                      <button
                        onClick={() => handleStatusChange(item.id, "READ")}
                        disabled={isPending}
                        className="btn btn-xs sm:btn-sm btn-success text-white rounded-xl gap-1.5 font-bold shadow-xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Marquer comme lu</span>
                      </button>
                    )}

                    {/* Marquer comme non lu si besoin de relire */}
                    {!isUnread && !isArchived && (
                      <button
                        onClick={() => handleStatusChange(item.id, "NEW")}
                        disabled={isPending}
                        className="btn btn-xs sm:btn-sm btn-ghost text-base-content/65 hover:text-base-content rounded-xl text-xs"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Marquer non lu</span>
                      </button>
                    )}

                    {/* Archiver */}
                    {!isArchived && (
                      <button
                        onClick={() => handleStatusChange(item.id, "ARCHIVED")}
                        disabled={isPending}
                        className="btn btn-xs sm:btn-sm btn-ghost text-base-content/65 hover:text-base-content rounded-xl text-xs gap-1"
                        title="Archiver pour ranger ce message"
                      >
                        <Archive className="h-3 w-3" />
                        <span>Archiver</span>
                      </button>
                    )}

                    {/* Désarchiver */}
                    {isArchived && (
                      <button
                        onClick={() => handleStatusChange(item.id, "READ")}
                        disabled={isPending}
                        className="btn btn-xs sm:btn-sm btn-ghost text-primary font-bold rounded-xl text-xs gap-1"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Sortir des archives</span>
                      </button>
                    )}
                  </div>

                  {/* Supprimer définitivement */}
                  <button
                    onClick={() => handleDelete(item.id, item.authorName)}
                    disabled={isPending}
                    className="btn btn-xs sm:btn-sm btn-ghost text-error/70 hover:text-error hover:bg-error/10 rounded-xl text-xs gap-1"
                    title="Supprimer définitivement"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
