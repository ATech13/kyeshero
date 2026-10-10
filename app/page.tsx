import HomeHeroPresentation from "./components/HomeHeroPresentation";
import HomeTransitionSection from "./components/HomeTransitionSection";
import HomeLiveOrVideoSection from "./components/HomeLiveOrVideoSection";
import { getUnifiedPublications } from "@/actions/events";
import { getPublicYouTubeVideos } from "@/actions/videos";

export default async function Home() {

  const [publications, videos] = await Promise.all([
    getUnifiedPublications({ limit: 1 }),
    getPublicYouTubeVideos({ limit: 10 }),
  ]);

  const featuredPublication = publications[0] || null;

  return (
    <div className="w-full min-h-[240vh] flex flex-col justify-start animate-in fade-in duration-500 overflow-x-clip">
      {/* ============================================================ */}
      {/* ZONE 1 : PRÉSENTATION & ENSEIGNEMENT APOSTOLIQUE (0 -> 100vh)  */}
      {/* Carousel fluide, message principal, logo & fondements         */}
      {/* ============================================================ */}
      <HomeHeroPresentation />

      {/* ============================================================ */}
      {/* ZONE 2 : PRÉDICATION & DIRECT DU CULTE                       */}
      {/* Priorité stricte : Live si disponible, sinon dernière vidéo    */}
      {/* ============================================================ */}
      <HomeLiveOrVideoSection videos={videos as any} />

      {/* ============================================================ */}
      {/* ZONE 3 : TRANSITION & CONTENUS COMPLÉMENTAIRES                */}
      {/* Passerelle vers Contenus, Événements et À-propos             */}
      {/* ============================================================ */}
      <HomeTransitionSection featuredPublication={featuredPublication} />
    </div>
  );
}