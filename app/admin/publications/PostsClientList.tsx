"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Eye,
  Search,
  CheckCircle2,
  XCircle,
  Images,
  HardHat,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { deletePost, togglePostStatus } from "@/actions/posts";
import { POST_CATEGORY_LABELS } from "@/lib/post-constants";
import PostFormModal from "./PostFormModal";
import PostPreviewModal from "./PostPreviewModal";
import { PostCategory } from "@prisma/client";
import Image from "next/image";

interface PostsClientListProps {
  initialPosts: any[];
}

export default function PostsClientList({ initialPosts }: PostsClientListProps) {
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewingPost, setPreviewingPost] = useState<any | null>(null);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const handlePostSuccess = (savedPost?: any) => {
    if (savedPost) {
      setPosts((prev) => {
        const exists = prev.some((p) => p.id === savedPost.id);
        if (exists) {
          return prev.map((p) => (p.id === savedPost.id ? savedPost : p));
        }
        return [savedPost, ...prev];
      });
    }
  };

  const handleOpenCreate = () => {
    setEditingPost(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (post: any) => {
    setEditingPost(post);
    setModalOpen(true);
  };

  const handleOpenPreview = (post: any) => {
    setPreviewingPost(post);
    setPreviewOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Confirmez-vous la suppression de « ${title} » ?`)) {
      return;
    }

    try {
      setActionLoadingId(id);
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Publication supprimée avec succès");
    } catch (err: any) {
      toast.error(err.message || "Impossible de supprimer la publication");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      setActionLoadingId(id);
      const res = await togglePostStatus(id);
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: res.newStatus } : p))
      );
      toast.success(
        res.newStatus === "PUBLISHED"
          ? "Publication mise en ligne"
          : "Publication retirée (Brouillon)"
      );
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du changement de statut");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtrage
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      (post.description &&
        post.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === "ALL" || post.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "ALL" || post.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-300 pb-5">
        <div>
          <h1 className="text-2xl font-black text-base-content flex items-center gap-2.5">
            <span>Publications & Vie de l'Église</span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/65 mt-0.5">
            Publiez l'avancement des travaux, les annonces officielles et les activités de la communauté.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary btn-sm rounded-xl font-bold shadow-xs gap-1.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle Publication</span>
        </button>
      </div>

      {/* Barre de filtres & recherche */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-base-100 p-4 rounded-2xl border border-base-300 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
          <input
            type="text"
            placeholder="Rechercher par titre ou mot-clé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered input-sm w-full pl-9 rounded-xl text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtre catégorie */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select select-bordered select-sm rounded-xl text-xs font-semibold"
          >
            <option value="ALL">Toutes les catégories</option>
            {Object.entries(POST_CATEGORY_LABELS).map(([catKey, label]) => (
              <option key={catKey} value={catKey}>
                {label}
              </option>
            ))}
          </select>

          {/* Filtre statut */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="select select-bordered select-sm rounded-xl text-xs font-semibold"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PUBLISHED">🟢 Publiés</option>
            <option value="DRAFT">🟡 Brouillons</option>
          </select>
        </div>
      </div>

      {/* Liste des publications */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-base-200 text-base-content/50">
            <HardHat className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-base text-base-content">
            Aucune publication trouvée
          </h3>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto">
            {search || selectedCategory !== "ALL" || selectedStatus !== "ALL"
              ? "Modifiez vos filtres ou effectuez une autre recherche."
              : "Créez votre première publication pour informer l'assemblée des travaux ou activités."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="btn btn-primary btn-sm rounded-xl font-bold mt-2"
          >
            Créer une publication
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => {
            const categoryLabel =
              POST_CATEGORY_LABELS[post.category as PostCategory] || post.category;
            const isPublished = post.status === "PUBLISHED";
            const isLoading = actionLoadingId === post.id;

            return (
              <div
                key={post.id}
                className="flex flex-col rounded-2xl border border-base-300 bg-base-100 shadow-xs overflow-hidden hover:border-primary/50 transition group"
              >
                {/* Photo de couverture */}
                <div className="relative h-44 w-full bg-base-200 overflow-hidden">
                  {post.coverImageUrl ? (
                    <Image
                      src={post.coverImageUrl}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-base-content/40 bg-base-200">
                      <HardHat className="h-10 w-10 opacity-40" />
                    </div>
                  )}

                  {/* Badges sur l'image */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="badge badge-sm font-bold bg-base-100/90 backdrop-blur-md border-0 text-base-content shadow-xs">
                      {categoryLabel}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`badge badge-sm font-bold shadow-xs ${
                        isPublished ? "badge-success" : "badge-ghost bg-base-100/90 text-base-content/80"
                      }`}
                    >
                      {isPublished ? "Publié" : "Brouillon"}
                    </span>
                  </div>

                  {post.images && post.images.length > 0 && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      <Images className="h-3 w-3" />
                      <span>+{post.images.length} photos</span>
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    {post.eventDate && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-base-content/60">
                        <Calendar className="h-3 w-3 text-primary" />
                        <span>
                          {new Date(post.eventDate).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </span>
                    )}

                    <h3 className="font-bold text-base text-base-content line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>

                    {post.description && (
                      <p className="text-xs text-base-content/65 line-clamp-2 leading-relaxed">
                        {post.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="border-t border-base-200 pt-3 flex items-center justify-between gap-1">
                    <button
                      onClick={() => handleToggleStatus(post.id)}
                      disabled={isLoading}
                      className={`btn btn-xs rounded-lg font-semibold gap-1 ${
                        isPublished
                          ? "btn-ghost text-base-content/70 hover:text-warning"
                          : "btn-outline btn-success"
                      }`}
                      title={isPublished ? "Basculer en brouillon" : "Publier maintenant"}
                    >
                      {isPublished ? (
                        <>
                          <XCircle className="h-3 w-3 text-warning" />
                          <span className="text-[11px]">Dépublier</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span className="text-[11px]">Publier</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenPreview(post)}
                        className="btn btn-ghost btn-square btn-xs rounded-lg"
                        title="Aperçu"
                      >
                        <Eye className="h-3.5 w-3.5 text-base-content/70" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(post)}
                        className="btn btn-ghost btn-square btn-xs rounded-lg text-primary"
                        title="Modifier"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={isLoading}
                        className="btn btn-ghost btn-square btn-xs rounded-lg text-error hover:bg-error/10"
                        title="Supprimer"
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

      {/* Modal de création / édition */}
      {modalOpen && (
        <PostFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          postToEdit={editingPost}
          onSuccess={handlePostSuccess}
        />
      )}

      {/* Modal de prévisualisation */}
      {previewOpen && (
        <PostPreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          post={previewingPost}
        />
      )}
    </div>
  );
}
