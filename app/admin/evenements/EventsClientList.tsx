"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, Calendar, Newspaper, MapPin, Clock, Layers, Tag } from "lucide-react";
import { toast } from "sonner";
import { deleteEvent } from "@/actions/events";
import { deletePost } from "@/actions/posts";
import EventFormModal from "./EventFormModal";
import Image from "next/image";

interface EventsClientListProps {
  initialEvents: any[];
}

export default function EventsClientList({ initialEvents }: EventsClientListProps) {
  const [events, setEvents] = useState<any[]>(initialEvents);
  const [filterTab, setFilterTab] = useState<"ALL" | "EVENT" | "NEWS">("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  const eventCount = useMemo(
    () => events.filter((e) => e.type !== "NEWS").length,
    [events]
  );
  const newsCount = useMemo(
    () => events.filter((e) => e.type === "NEWS").length,
    [events]
  );

  const filteredEvents = useMemo(() => {
    if (filterTab === "EVENT") return events.filter((e) => e.type !== "NEWS");
    if (filterTab === "NEWS") return events.filter((e) => e.type === "NEWS");
    return events;
  }, [events, filterTab]);

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingEvent(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, title: string, type?: string) => {
    const isNews = type === "NEWS";
    if (!confirm(`Confirmez-vous la suppression de ${isNews ? "l'actualité" : "l'événement"} « ${title} » ?`)) {
      return;
    }

    try {
      setDeletingId(id);
      if (isNews) {
        await deletePost(id);
      } else {
        await deleteEvent(id);
      }
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success(isNews ? "Actualité supprimée avec succès" : "Événement supprimé avec succès");
    } catch (err: any) {
      toast.error(err.message || "Impossible de supprimer l'élément");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-base-content">
            Gestion des Événements &amp; Actualités
          </h1>
          <p className="text-xs sm:text-sm text-base-content/65 mt-0.5">
            Publiez et organisez les cultes, séminaires et actualités visibles par la communauté.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary btn-sm rounded-xl font-bold shadow-xs gap-1.5 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Créer (Événement / Actualité)</span>
        </button>
      </div>

      {/* Onglets de filtrage */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap">
        <button
          onClick={() => setFilterTab("ALL")}
          className={`btn btn-xs sm:btn-sm rounded-xl font-bold shrink-0 gap-1.5 ${
            filterTab === "ALL" ? "btn-primary shadow-xs" : "btn-ghost"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Tous</span>
          <span className="badge badge-xs sm:badge-sm badge-neutral">{events.length}</span>
        </button>

        <button
          onClick={() => setFilterTab("EVENT")}
          className={`btn btn-xs sm:btn-sm rounded-xl font-bold shrink-0 gap-1.5 ${
            filterTab === "EVENT" ? "btn-primary shadow-xs" : "btn-ghost"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Événements &amp; Cultes</span>
          <span className="badge badge-xs sm:badge-sm badge-neutral">{eventCount}</span>
        </button>

        <button
          onClick={() => setFilterTab("NEWS")}
          className={`btn btn-xs sm:btn-sm rounded-xl font-bold shrink-0 gap-1.5 ${
            filterTab === "NEWS" ? "btn-primary shadow-xs" : "btn-ghost"
          }`}
        >
          <Newspaper className="h-3.5 w-3.5" />
          <span>Actualités &amp; Annonces</span>
          <span className="badge badge-xs sm:badge-sm badge-neutral">{newsCount}</span>
        </button>
      </div>

      {/* Liste des publications */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 sm:p-12 text-center">
          <Calendar className="h-10 w-10 text-base-content/30 mx-auto mb-3" />
          <h3 className="font-bold text-base">Aucun contenu trouvé</h3>
          <p className="text-xs text-base-content/60 mt-1 max-w-sm mx-auto">
            {filterTab === "EVENT"
              ? "Aucun culte ou événement enregistré."
              : filterTab === "NEWS"
              ? "Aucune actualité ou annonce enregistrée."
              : "Commencez par ajouter votre premier culte ou votre première annonce."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="btn btn-primary btn-sm rounded-xl font-bold mt-4"
          >
            Ajouter un contenu
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xs">
          <div className="divide-y divide-base-200">
            {filteredEvents.map((item) => {
              const isNews = item.type === "NEWS";
              const dateVal = item.startAt || item.date || item.createdAt;

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-5 hover:bg-base-200/40 transition"
                >
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 w-full sm:w-auto flex-1">
                    {item.coverImageUrl ? (
                      <div className="relative h-16 w-16 sm:h-16 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-base-200">
                        <Image
                          src={item.coverImageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className={`flex h-16 w-16 sm:h-16 sm:w-24 shrink-0 items-center justify-center rounded-xl ${
                        isNews ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                      }`}>
                        {isNews ? <Newspaper className="h-6 w-6" /> : <Calendar className="h-6 w-6" />}
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`badge badge-xs font-bold ${
                            isNews ? "badge-secondary" : "badge-primary"
                          }`}
                        >
                          {isNews ? "📰 Actualité" : "📅 Événement"}
                        </span>

                        <span
                          className={`badge badge-xs font-bold ${
                            item.status === "PUBLISHED" ? "badge-success text-success-content" : "badge-ghost"
                          }`}
                        >
                          {item.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-base-content leading-snug line-clamp-2 break-words">
                        {item.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/65 pt-0.5">
                        {dateVal && (
                          <span className="inline-flex items-center gap-1 shrink-0">
                            <Clock className="h-3 w-3 shrink-0" />
                            {new Date(dateVal).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: isNews ? undefined : "2-digit",
                              minute: isNews ? undefined : "2-digit",
                            })}
                          </span>
                        )}

                        {item.location && !isNews && (
                          <span className="inline-flex items-center gap-1 min-w-0 max-w-[190px] sm:max-w-xs">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </span>
                        )}

                        {isNews && item.category && (
                          <span className="inline-flex items-center gap-1 text-secondary font-medium shrink-0">
                            <Tag className="h-3 w-3 shrink-0" />
                            <span>{item.category}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1 shrink-0 self-end sm:self-center w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-base-200">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="btn btn-ghost btn-square btn-sm"
                      title="Modifier"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title, item.type)}
                      disabled={deletingId === item.id}
                      className="btn btn-ghost btn-square btn-sm text-error hover:bg-error/10"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de création / édition avec sélecteur Événement / Actualité */}
      <EventFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        eventToEdit={editingEvent}
      />
    </div>
  );
}
