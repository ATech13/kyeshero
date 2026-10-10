export type UserRole = "ADMIN" | "EDITOR" | "MEMBER";

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export type MediaType = "SERMON" | "SONG" | "MEETING" | "OTHER";

export type MediaStatus = "DRAFT" | "PUBLISHED";

export type VideoStatus = "DRAFT" | "PUBLISHED";

export type Visibility = "PUBLIC" | "PRIVATE";

export interface ChurchEvent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  startAt: string | Date;
  endAt?: string | Date | null;
  location: string | null;
  contactInfo?: string | null;
  coverImageUrl?: string | null;
  coverImageKitFileId?: string | null;
  status: EventStatus;
  visibility: Visibility;
  publishedAt?: string | Date | null;
}

export interface ChurchMedia {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: MediaType;
  status: MediaStatus;
  visibility: Visibility;
  audioUrl: string;
  imageKitFileId?: string | null;
  coverImageUrl?: string | null;
  speakerName?: string | null;
  durationSeconds?: number | null;
  publishedAt?: string | Date | null;
}

export interface ChurchYouTubeVideo {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  youtubeUrl: string;
  youtubeVideoId: string;
  thumbnailUrl?: string | null;
  channelName?: string | null;
  durationSeconds?: number | null;
  status: VideoStatus;
  visibility: Visibility;
  publishedAt?: string | Date | null;
}