"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, Camera, Search, ThumbsUp, Image as ImageIcon, Calendar, Eye } from "lucide-react";
import { toast } from "sonner";
import { deletePhotoPublication } from "@/actions/events";
import EventFormModal from "./EventFormModal";
import Image from "next/image";
import Link from "next/link";

interface EventsClientListProps {
  initialEvents: any[];
}

export default function EventsClientList({ initialEvents }: EventsClientListProps) {
  const [publications, setPublications] = useState<any[]>(initialEvents);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setPublications(initialEvents);
  }, [initialEvents]);

  const totalLikes = useMemo(
    () => publications.reduce((acc, p) => acc + (p.likesCount ?? 0), 0),
    [publications]
  );

  const filteredPublications = useMemo(() => {
    if (!searchQuery.trim()) return publications;
    const q = searchQuery.toLowerCase();
    return publications.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [publications, searchQuery]);

  const handleOpenCreate = () => {
    setEditingPublication(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingPublication(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Confirmez-vous la suppression de cette publication photo ?\n« ${title.slice(0, 50)}... »`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deletePhotoPublication(id);
      setPublications((prev) => prev.filter((p) => p.id !== id));
      toast.success("Publication photo supprimée avec succès");
    } catch (err: any) {
      toast.error(err.message || "Impossible de supprimer la publication");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-base-content flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            <span>Gestion des Événements &amp; Photos</span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/65 mt-1">
            Publiez les photos des cultes, sainte cène et moments forts selon le format social en mosaïque.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary btn-sm rounded-xl font-bold shadow-xs gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle Publication Photo</span>
        </button>
      </div>

      {/* Barre de recherche & Statistiques (avec les likes visibles) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-base-100 p-3 sm:p-4 rounded-2xl border border-base-200">
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-base-content/70">
          <div className="flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-primary" />
            <span>{publications.length} publication{publications.length > 1 ? "s" : ""}</span>
          </div>
          <span className="text-base-content/30">•</span>
          <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-xl border border-blue-200/50">
            <ThumbsUp className="h-3.5 w-3.5 fill-blue-600" />
            <span>{totalLikes} mention{totalLikes > 1 ? "s" : ""} J'aime au total</span>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une publication..."
            className="input input-sm w-full pl-9 rounded-xl bg-base-200/50 border-base-300 text-xs focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Liste des publications */}
      {filteredPublications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Camera className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-base-content">
            {searchQuery ? "Aucune publication trouvée" : "Aucune publication photo"}
          </h3>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `Aucun résultat ne correspond à « ${searchQuery} ».`
              : "Créez votre première publication photo avec le texte et les clichés de l'événement."}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenCreate}
              className="btn btn-primary btn-sm rounded-xl font-bold mt-5 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Créer une publication photo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPublications.map((item) => {
            const images = item.images || [];
            const cover = item.coverImageUrl || images[0]?.imageUrl;

            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-2xl border border-base-200 bg-base-100 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200"
              >
                {/* Aperçu image(s) */}
                <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/40">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}

                  {/* Badge nombre de likes sur l'image */}
                  <div className="absolute top-2.5 left-2.5 bg-blue-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                    <ThumbsUp className="h-3 w-3 fill-white" />
                    <span>{item.likesCount ?? 0}</span>
                  </div>

                  {/* Badge nombre de photos */}
                  <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    <span>{images.length} photo{images.length > 1 ? "s" : ""}</span>
                  </div>

                  {/* Badge Statut */}
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`badge badge-sm font-bold shadow-xs ${
                        item.status === "PUBLISHED"
                          ? "badge-success text-white"
                          : "badge-warning"
                      }`}
                    >
                      {item.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                    </span>
                  </div>
                </div>

                {/* Corps de la carte */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-base-content/60">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>
                        {new Date(item.publishedAt || item.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="font-bold text-sm text-base-content line-clamp-3 leading-snug">
                      {item.title}
                    </p>
                  </div>

                  {/* Barre basse statistiques & actions */}
                  <div className="pt-3 border-t border-base-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-xl border border-blue-200/50">
                      <ThumbsUp className="h-3.5 w-3.5 fill-blue-600" />
                      <span>{item.likesCount ?? 0} like{(item.likesCount ?? 0) > 1 ? "s" : ""}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/evenements/${item.slug}`}
                        target="_blank"
                        className="btn btn-ghost btn-xs btn-square rounded-lg text-base-content/70 hover:text-primary"
                        title="Voir la publication sur le site"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>

                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="btn btn-ghost btn-xs btn-square rounded-lg text-base-content/70 hover:text-primary"
                        title="Modifier la publication"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        disabled={deletingId === item.id}
                        className="btn btn-ghost btn-xs btn-square rounded-lg text-error hover:bg-error/10"
                        title="Supprimer la publication"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de création et édition */}
      <EventFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        eventToEdit={editingPublication}
      />
    </div>
  );
}
