import { getPublicMedia } from "@/actions/media";
import { getPublicYouTubeVideos } from "@/actions/videos";
import { isYouTubeVideoLive } from "@/lib/youtube";
import { detectVideoPlatform } from "@/lib/video-platforms";
import ContentsExplorer from "./ContentsExplorer";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Contenus · Prédications, Chansons & Vidéos",
  description:
    "Médiathèque officielle de l'Assemblée Chrétienne de Goma : prédications audio, chants et diffusions vidéo YouTube, Facebook et TikTok.",
  openGraph: {
    title: "Contenus · Prédications, Chansons & Vidéos",
    description:
      "Médiathèque officielle de l'Assemblée Chrétienne de Goma : prédications audio, chants et diffusions vidéo YouTube, Facebook et TikTok.",
    images: [{ url: "/images/logo.png", width: 1254, height: 1254, alt: "Logo Assemblée Chrétienne de Goma" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contenus · Prédications, Chansons & Vidéos",
    description:
      "Médiathèque officielle de l'Assemblée Chrétienne de Goma : prédications audio, chants et diffusions vidéo YouTube, Facebook et TikTok.",
    images: ["/images/logo.png"],
  },
};

export default async function ContentsPage() {
  const [audios, videos] = await Promise.all([
    getPublicMedia({ limit: 60 }),
    getPublicYouTubeVideos({ limit: 60 }),
  ]);

  const latestYouTubeVideo = videos.find(
    (v) => detectVideoPlatform(v.youtubeUrl || v.youtubeVideoId) === "YOUTUBE"
  );
  const isLatestLive = latestYouTubeVideo
    ? await isYouTubeVideoLive(latestYouTubeVideo.youtubeUrl || latestYouTubeVideo.youtubeVideoId)
    : false;
  const liveVideoId = isLatestLive && latestYouTubeVideo ? latestYouTubeVideo.id : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10 animate-in fade-in duration-500">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-base-300 pb-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-base-content tracking-tight">
            Contenus
          </h1>
        </div>
      </div>

      {/* Explorateur de contenus unifié */}
      <ContentsExplorer
        initialAudios={audios as any}
        initialVideos={videos as any}
        liveVideoId={liveVideoId}
      />
    </div>
  );
}
