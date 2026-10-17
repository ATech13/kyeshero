import Link from "next/link";
import {
  Calendar,
  Camera,
  Headphones,
  Video,
  Plus,
  ArrowRight,
  Clock,
  Quote,
  MessageSquareHeart,
  MapPin,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-user";
import { getInteractionsStats } from "@/actions/interactions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  await requireAdmin().catch(() => null);

  const [
    eventCount,
    quoteCount,
    mediaCount,
    videoCount,
    recentEvents,
    recentQuotes,
    interactionStats,
  ] = await Promise.all([
    prisma.post.count().catch(() => 0),
    prisma.sermonQuote.count().catch(() => 0),
    prisma.media.count().catch(() => 0),
    prisma.youTubeVideo.count().catch(() => 0),
    prisma.post.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { images: true },
    }).catch(() => []),
    prisma.sermonQuote.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    getInteractionsStats().catch(() => ({
      total: 0,
      commentsCount: 0,
      greetingsCount: 0,
      newCount: 0,
      groupedByVideo: [],
    })),
  ]);

  return (
    <div className="space-y-8">
      {/* Salutation d'accueil & Actions rapides */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-base-300 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-base-content">
            Tableau de Bord
          </h1>
          <p className="text-sm text-base-content/65 mt-1">
            Centre de communication et de gestion : prédications, citations, cultes et événements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/contenus"
            className="btn btn-primary btn-sm rounded-xl font-bold shadow-xs gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Contenu</span>
          </Link>
          <Link
            href="/admin/evenements"
            className="btn btn-outline btn-sm rounded-xl font-bold gap-1.5"
          >
            <Camera className="h-4 w-4" />
            <span>Nouvelle Photo / Publication</span>
          </Link>
          <Link
            href="/admin/citations"
            className="btn btn-outline btn-secondary btn-sm rounded-xl font-bold gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Citation</span>
          </Link>
        </div>
      </div>

      {/* Cartes de statistiques & Raccourcis (Grille 5 colonnes) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* 1. Événements & Photos */}
        <Link
          href="/admin/evenements"
          className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-xs hover:border-primary/50 transition group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition">
              <Camera className="h-5 w-5" />
            </span>
            <span className="text-2xl font-black text-base-content">
              {eventCount}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-base-content">Événements &amp; Photos</h3>
            <p className="text-[11px] text-base-content/60 mt-0.5 line-clamp-1">
              Photos des cultes, sainte cène &amp; conventions.
            </p>
          </div>
          <div className="pt-1 text-xs font-bold text-primary flex items-center gap-1 group-hover:underline">
            <span>Gérer les publications</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </Link>

        {/* 2. Citations de Prédications */}
        <Link
          href="/admin/citations"
          className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-xs hover:border-secondary/50 transition group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary group-hover:scale-105 transition">
              <Quote className="h-5 w-5" />
            </span>
            <span className="text-2xl font-black text-base-content">
              {quoteCount}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-base-content">Citations Spirituelles</h3>
            <p className="text-[11px] text-base-content/60 mt-0.5 line-clamp-1">
              Paroles édifiantes des prédicateurs.
            </p>
          </div>
          <div className="pt-1 text-xs font-bold text-secondary flex items-center gap-1 group-hover:underline">
            <span>Gérer les citations</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </Link>

        {/* 3. Audios & Prédications */}
        <Link
          href="/admin/contenus?tab=audios"
          className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-xs hover:border-primary/50 transition group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition">
              <Headphones className="h-5 w-5" />
            </span>
            <span className="text-2xl font-black text-base-content">
              {mediaCount}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-base-content">Médiathèque Audio</h3>
            <p className="text-[11px] text-base-content/60 mt-0.5 line-clamp-1">
              Prédications &amp; chants louange.
            </p>
          </div>
          <div className="pt-1 text-xs font-bold text-primary flex items-center gap-1 group-hover:underline">
            <span>Gérer les audios</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </Link>

        {/* 4. Vidéos (YouTube, Facebook, TikTok) */}
        <Link
          href="/admin/contenus?tab=videos"
          className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-xs hover:border-error/50 transition group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-error/10 text-error group-hover:scale-105 transition">
              <Video className="h-5 w-5" />
            </span>
            <span className="text-2xl font-black text-base-content">
              {videoCount}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-base-content">Vidéos Réseaux</h3>
            <p className="text-[11px] text-base-content/60 mt-0.5 line-clamp-1">
              YouTube, Facebook &amp; TikTok.
            </p>
          </div>
          <div className="pt-1 text-xs font-bold text-error flex items-center gap-1 group-hover:underline">
            <span>Gérer les vidéos</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </Link>

        {/* 5. Messages des fidèles */}
        <Link
          href="/admin/interactions"
          className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-xs hover:border-accent/50 transition group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent group-hover:scale-105 transition">
              <MessageSquareHeart className="h-5 w-5" />
            </span>
            <div className="text-right">
              <span className="text-2xl font-black text-base-content block">
                {interactionStats.total}
              </span>
              {interactionStats.newCount > 0 && (
                <span className="badge badge-xs badge-warning font-bold">
                  {interactionStats.newCount} new
                </span>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm text-base-content">Messages des fidèles</h3>
            <p className="text-[11px] text-base-content/60 mt-0.5 line-clamp-1">
              {interactionStats.newCount > 0 ? `${interactionStats.newCount} nouveau(x) à lire` : "Tous les messages ont été lus"}
            </p>
          </div>
          <div className="pt-1 text-xs font-bold text-accent flex items-center gap-1 group-hover:underline">
            <span>Gérer</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </Link>
      </div>

      {/* Récemment créés : 2 colonnes (Événements & Citations) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dernières Publications Photos */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-6 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Camera className="h-4 w-4 text-primary shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-base-content truncate">
                Dernières publications photos
              </h2>
            </div>
            <Link
              href="/admin/evenements"
              className="text-xs font-semibold text-primary hover:underline shrink-0"
            >
              Gérer tout →
            </Link>
          </div>

          {recentEvents.length === 0 ? (
            <p className="text-xs text-base-content/60 py-4">
              Aucune publication photo pour le moment.
            </p>
          ) : (
            <div className="divide-y divide-base-200">
              {recentEvents.map((evt: any) => (
                <div
                  key={evt.id}
                  className="py-3 flex items-center justify-between gap-3 min-w-0"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm truncate text-base-content">
                      {evt.title}
                    </h4>
                    <p className="text-[11px] text-base-content/60 flex items-center gap-2 mt-0.5">
                      <span>{evt.images?.length ?? 0} photo{(evt.images?.length ?? 0) > 1 ? "s" : ""}</span>
                      <span>·</span>
                      <span>
                        {new Date(evt.publishedAt || evt.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`badge badge-xs font-semibold shrink-0 ${
                      evt.status === "PUBLISHED" ? "badge-success" : "badge-ghost"
                    }`}
                  >
                    {evt.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dernières Citations */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-6 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Quote className="h-4 w-4 text-secondary shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-base-content truncate">
                Dernières citations fortes
              </h2>
            </div>
            <Link
              href="/admin/citations"
              className="text-xs font-semibold text-secondary hover:underline shrink-0"
            >
              Gérer tout →
            </Link>
          </div>

          {recentQuotes.length === 0 ? (
            <p className="text-xs text-base-content/60 py-4">
              Aucune citation pour le moment.
            </p>
          ) : (
            <div className="divide-y divide-base-200">
              {recentQuotes.map((q: any) => (
                <div
                  key={q.id}
                  className="py-3 flex items-center justify-between gap-3 min-w-0"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-serif italic text-xs sm:text-sm truncate text-base-content">
                      « {q.quote} »
                    </h4>
                    <p className="text-[11px] text-base-content/60 flex items-center gap-1.5 mt-0.5 min-w-0">
                      <span className="font-bold text-base-content/80 shrink-0">
                        {q.preacher}
                      </span>
                      {q.sermonTitle && (
                        <span className="truncate">· {q.sermonTitle}</span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`badge badge-xs font-semibold shrink-0 ${
                      q.status === "PUBLISHED" ? "badge-success" : "badge-ghost"
                    }`}
                  >
                    {q.status === "PUBLISHED" ? "Publié" : "Brouillon"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
