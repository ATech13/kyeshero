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
