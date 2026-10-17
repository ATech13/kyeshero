"use client";

import { useState, useMemo } from "react";
import MediaFilters, { MediaTab } from "../components/MediaFilters";
import AudioPlayer from "../components/AudioPlayer";
import YouTubeVideoCard from "../components/YouTubeVideoCard";
import EmptyState from "../components/EmptyState";
import { Headphones, Video, Radio } from "lucide-react";
import type { ChurchMedia, ChurchYouTubeVideo } from "@/types/type";
import { matchesSearchQuery } from "@/lib/search";

interface MediaExplorerProps {
  initialAudios: ChurchMedia[];
  initialVideos: ChurchYouTubeVideo[];
}

export default function MediaExplorer({
  initialAudios,
  initialVideos,
}: MediaExplorerProps) {
  const [currentTab, setCurrentTab] = useState<MediaTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAudios = useMemo(() => {
    if (currentTab === "VIDEO") return [];
    return initialAudios.filter((audio) => {
      const matchType =
        currentTab === "ALL" ||
        (currentTab === "SERMON" && audio.type === "SERMON") ||
        (currentTab === "SONG" && audio.type === "SONG") ||
        (currentTab === "MEETING" && audio.type === "MEETING");

      return (
        matchType &&
        matchesSearchQuery(searchQuery, audio.title, audio.speakerName, audio.description)
      );
    });
  }, [initialAudios, currentTab, searchQuery]);

  const filteredVideos = useMemo(() => {
    if (currentTab !== "ALL" && currentTab !== "VIDEO") return [];
    return initialVideos.filter((video) => {
      return matchesSearchQuery(searchQuery, video.title, video.description);
    });
  }, [initialVideos, currentTab, searchQuery]);

  const totalResults = filteredAudios.length + filteredVideos.length;

  return (
    <div className="space-y-10">
      <MediaFilters
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {totalResults === 0 ? (
        <EmptyState
          icon={<Radio className="h-7 w-7" />}
          title="Aucun média trouvé"
          description="Les contenus audio et vidéo apparaîtront ici. Essayez de modifier vos filtres ou termes de recherche."
        />
      ) : (
        <div className="space-y-12">
          {/* Section Audio */}
          {filteredAudios.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-base-300 pb-2">
                <Headphones className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/80">
                  Enregistrements Audio ({filteredAudios.length})
                </h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredAudios.map((audio) => (
                  <AudioPlayer
                    key={audio.id}
                    src={audio.audioUrl}
                    title={audio.title}
                    speaker={audio.speakerName}
                    coverUrl={audio.coverImageUrl}
                    duration={audio.durationSeconds}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section Vidéos YouTube */}
          {filteredVideos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-base-300 pb-2">
                <Video className="h-4 w-4 text-error" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/80">
                  Vidéos Officielles YouTube ({filteredVideos.length})
                </h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredVideos.map((video) => (
                  <YouTubeVideoCard
                    key={video.id}
                    id={video.id}
                    youtubeVideoId={video.youtubeVideoId}
                    title={video.title}
                    description={video.description}
                    thumbnailUrl={video.thumbnailUrl}
                    channelName={video.channelName}
                    youtubeUrl={video.youtubeUrl}
                    publishedAt={video.publishedAt}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
