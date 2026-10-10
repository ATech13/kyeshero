import { getAllAdminYouTubeVideos } from "@/actions/videos";
import { getAllAdminMedia } from "@/actions/media";
import AdminContentsManager from "./AdminContentsManager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestion des Contenus (Vidéos & Audios) | Admin",
  description:
    "Espace administrateur pour la gestion des vidéos (YouTube, Facebook, TikTok) et des audios ImageKit (prédications, chants).",
};

interface AdminContentsPageProps {
  searchParams?: Promise<{ tab?: string }>;
}

export default async function AdminContentsPage({
  searchParams,
}: AdminContentsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const defaultTab = resolvedParams.tab === "audios" ? "audios" : "videos";

  const [videos, audios] = await Promise.all([
    getAllAdminYouTubeVideos(),
    getAllAdminMedia(),
  ]);

  return (
    <AdminContentsManager
      initialVideos={videos}
      initialAudios={audios}
      defaultTab={defaultTab}
    />
  );
}
