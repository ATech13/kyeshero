"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Quote as QuoteIcon,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { deleteSermonQuote, toggleQuoteStatus } from "@/actions/quotes";
import QuoteFormModal from "./QuoteFormModal";
import Image from "next/image";

interface QuotesClientListProps {
  initialQuotes: any[];
}

export default function QuotesClientList({ initialQuotes }: QuotesClientListProps) {
  const [quotes, setQuotes] = useState<any[]>(initialQuotes);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<any | null>(null);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingQuote(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (quote: any) => {
    setEditingQuote(quote);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, preacher: string) => {
    if (!confirm(`Confirmez-vous la suppression de cette citation de « ${preacher} » ?`)) {
      return;
    }

    try {
      setActionLoadingId(id);
      await deleteSermonQuote(id);
      setQuotes((prev) => prev.filter((q) => q.id !== id));
      toast.success("Citation supprimée avec succès");
    } catch (err: any) {
      toast.error(err.message || "Impossible de supprimer la citation");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      setActionLoadingId(id);
      const res = await toggleQuoteStatus(id);
      setQuotes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: res.newStatus } : q))
      );
      toast.success(
        res.newStatus === "PUBLISHED"
          ? "Citation mise en ligne"
          : "Citation retirée (Brouillon)"
      );
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du changement de statut");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCopyQuote = (quote: any) => {
    const text = `« ${quote.quote} » — ${quote.preacher}${
      quote.sermonTitle ? ` (${quote.sermonTitle})` : ""
    }`;
    navigator.clipboard.writeText(text);
    setCopiedId(quote.id);
    toast.success("Citation copiée dans le presse-papier");
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtrage
  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.quote.toLowerCase().includes(search.toLowerCase()) ||
      q.preacher.toLowerCase().includes(search.toLowerCase()) ||
      (q.sermonTitle &&
        q.sermonTitle.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      selectedStatus === "ALL" || q.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-300 pb-5">
        <div>
          <h1 className="text-2xl font-black text-base-content flex items-center gap-2.5">
            <span>Phrases Importantes & Citations de Prédications</span>
          </h1>
          <p className="text-xs sm:text-sm text-base-content/65 mt-0.5">
            Valorisez les paroles fortes et enseignements édifiants entendus lors des cultes.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary btn-sm rounded-xl font-bold shadow-xs gap-1.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle Citation</span>
        </button>
      </div>

      {/* Barre de filtres & recherche */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-base-100 p-4 rounded-2xl border border-base-300 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
          <input
            type="text"
            placeholder="Rechercher par mot-clé, prédicateur ou titre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered input-sm w-full pl-9 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="select select-bordered select-sm rounded-xl text-xs font-semibold"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="PUBLISHED">🟢 Publiées</option>
            <option value="DRAFT">🟡 Brouillons</option>
          </select>
        </div>
      </div>

      {/* Liste des citations */}
      {filteredQuotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-base-200 text-base-content/50">
            <QuoteIcon className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-base text-base-content">
            Aucune citation trouvée
          </h3>
          <p className="text-xs text-base-content/60 max-w-sm mx-auto">
            {search || selectedStatus !== "ALL"
              ? "Modifiez vos filtres ou effectuez une autre recherche."
              : "Ajoutez une première parole forte prononcée lors d'un culte pour enrichir le site."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="btn btn-primary btn-sm rounded-xl font-bold mt-2"
          >
            Ajouter une citation
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredQuotes.map((item) => {
            const isPublished = item.status === "PUBLISHED";
            const isLoading = actionLoadingId === item.id;
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-base-300 bg-base-100 shadow-xs p-5 relative overflow-hidden hover:border-secondary/50 transition group"
              >
                {/* Icône de citation en filigrane */}
                <QuoteIcon className="absolute top-2 right-2 h-20 w-20 text-secondary/5 pointer-events-none -rotate-6" />

                <div className="space-y-4">
                  {/* Badges statut & catégorie */}
                  <div className="flex items-center justify-between gap-2">
                    {item.category ? (
                      <span className="badge badge-sm font-bold bg-secondary/15 text-secondary border-0">
                        {item.category}
                      </span>
                    ) : (
                      <span className="text-[11px] text-base-content/50 uppercase font-bold tracking-wider">
                        Citation
                      </span>
                    )}

                    <span
                      className={`badge badge-sm font-bold shadow-xs ${
                        isPublished ? "badge-success" : "badge-ghost"
                      }`}
                    >
                      {isPublished ? "Publié" : "Brouillon"}
                    </span>
                  </div>

                  {/* Le texte de la citation */}
                  <p className="text-base font-serif italic text-base-content leading-relaxed">
                    « {item.quote} »
                  </p>

                  {/* Infos du prédicateur */}
                  <div className="flex items-center gap-3 pt-3 border-t border-base-200">
                    {item.imageUrl ? (
                      <div className="relative h-11 w-11 rounded-full overflow-hidden shrink-0 border border-secondary/30">
                        <Image
                          src={item.imageUrl}
                          alt={item.preacher}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/15 text-secondary font-black text-xs shrink-0">
                        {item.preacher.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 text-xs">
                      <p className="font-bold text-base-content truncate">
                        {item.preacher}
                      </p>
                      {item.sermonTitle && (
                        <p className="text-base-content/65 truncate">
                          {item.sermonTitle}
                        </p>
                      )}
                      {item.sermonDate && (
                        <p className="text-[11px] text-base-content/50 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(item.sermonDate).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-base-200 pt-3 mt-4 flex items-center justify-between gap-1">
                  <button
                    onClick={() => handleToggleStatus(item.id)}
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
                      onClick={() => handleCopyQuote(item)}
                      className="btn btn-ghost btn-square btn-xs rounded-lg"
                      title="Copier le texte"
                    >
                      {isCopied ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-base-content/70" />
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="btn btn-ghost btn-square btn-xs rounded-lg text-primary"
                      title="Modifier"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id, item.preacher)}
                      disabled={isLoading}
                      className="btn btn-ghost btn-square btn-xs rounded-lg text-error hover:bg-error/10"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de création / édition */}
      {modalOpen && (
        <QuoteFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          quoteToEdit={editingQuote}
        />
      )}
    </div>
  );
}
