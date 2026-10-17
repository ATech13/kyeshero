import { getPhotoPublications } from "@/actions/events";
import EventsExplorer from "./EventsExplorer";
import { Camera } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Événements en Images · Assemblée Chrétienne de Goma",
  description:
    "Retrouvez en photos la vie de l'assemblée, les cultes, réunions de serviteurs et moments bénis de la communauté à Kyeshero.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EventsPage() {
  const publications = await getPhotoPublications({ limit: 50 });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
      {/* Header épuré et moderne */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pb-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
          <Camera className="h-3.5 w-3.5" />
          <span>Moments &amp; Vie de l'Assemblée</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-base-content tracking-tight">
          Événements en Images
        </h1>
      </div>

      {/* Fil interactif des publications photos */}
      <EventsExplorer initialPublications={publications} />
    </div>
  );
}
