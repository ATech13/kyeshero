import { getPublicMedia } from "@/actions/media";
import { getPublicYouTubeVideos } from "@/actions/videos";
import ContentsExplorer from "./ContentsExplorer";
import { Headphones, Youtube, Radio } from "lucide-react";
import { CHURCH_CONFIG } from "@/lib/church-info";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contenus · Prédications, Chansons & Vidéos",
  description:
    "Médiathèque officielle de l'Assemblée Chrétienne de Goma : prédications audio, chants et diffusions vidéo YouTube, Facebook et TikTok.",
};

export default async function ContentsPage() {
  const [audios, videos] = await Promise.all([
    getPublicMedia({ limit: 60 }),
    getPublicYouTubeVideos({ limit: 60 }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10 animate-in fade-in duration-500">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-base-300 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3">
            <Radio className="h-3.5 w-3.5" />
            <span>Médiathèque &amp; Ressources Spirituelles</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-base-content tracking-tight">
            Contenus
          </h1>
          <p className="mt-2 text-sm sm:text-base text-base-content/70 max-w-2xl leading-relaxed">
            Écoutez les prédications audio et louanges de l'Assemblée, et retrouvez toutes les vidéos officielles sur YouTube, Facebook et TikTok.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          <a
            href={CHURCH_CONFIG.social.youtube.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-error/10 text-error px-3.5 py-2 text-xs font-bold hover:bg-error/20 transition shadow-2xs"
            title="Chaîne YouTube officielle"
          >
            <Youtube className="h-4 w-4" />
            <span>YouTube</span>
          </a>

          <a
            href={CHURCH_CONFIG.social.facebook.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1877F2]/10 text-[#1877F2] px-3.5 py-2 text-xs font-bold hover:bg-[#1877F2]/20 transition shadow-2xs"
            title="Page Facebook officielle"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg>
            <span>Facebook</span>
          </a>

          <a
            href={CHURCH_CONFIG.social.tiktok.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-base-200 text-base-content border border-base-300 px-3.5 py-2 text-xs font-bold hover:bg-base-300 transition shadow-2xs"
            title="Compte TikTok officiel"
          >
            <svg className="h-4 w-4 text-[#00f2fe]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
            <span>TikTok</span>
          </a>
        </div>
      </div>

      {/* Explorateur de contenus unifié */}
      <ContentsExplorer
        initialAudios={audios as any}
        initialVideos={videos as any}
      />
    </div>
  );
}
