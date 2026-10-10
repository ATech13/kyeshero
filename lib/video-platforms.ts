export type VideoPlatform = "YOUTUBE" | "FACEBOOK" | "TIKTOK";

export interface ParsedVideoInfo {
  platform: VideoPlatform;
  videoId: string;
  originalUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  platformLabel: string;
}

/**
 * Détecte la plateforme d'une URL de vidéo
 */
export function detectVideoPlatform(urlOrId: string): VideoPlatform {
  if (!urlOrId) return "YOUTUBE";
  const lower = urlOrId.toLowerCase();

  if (lower.includes("facebook.com") || lower.includes("fb.watch") || lower.startsWith("fb_")) {
    return "FACEBOOK";
  }
  if (lower.includes("tiktok.com") || lower.startsWith("tt_") || lower.startsWith("tiktok_")) {
    return "TIKTOK";
  }
  return "YOUTUBE";
}

/**
 * Extrait l'identifiant YouTube standard (11 caractères)
 */
export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : null;
}

/**
 * Extrait l'identifiant TikTok
 */
export function extractTikTokId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  if (/^\d{15,22}$/.test(trimmed)) return trimmed;

  const match = trimmed.match(/\/video\/(\d+)/);
  if (match && match[1]) return match[1];

  const shortMatch = trimmed.match(/vm\.tiktok\.com\/([a-zA-Z0-9]+)/);
  return shortMatch && shortMatch[1] ? shortMatch[1] : null;
}

/**
 * Extrait l'identifiant ou le lien propre Facebook
 */
export function extractFacebookId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  const match = trimmed.match(/(?:videos\/|watch\/\?v=)(\d+)/);
  if (match && match[1]) return match[1];

  return null;
}

/**
 * Analyse une vidéo pour fournir son embed et sa miniature
 */
export function parseVideo(urlOrId: string, fallbackThumb?: string | null): ParsedVideoInfo {
  const platform = detectVideoPlatform(urlOrId);

  if (platform === "FACEBOOK") {
    const fbId = extractFacebookId(urlOrId) || "facebook_video";
    const encodedUrl = encodeURIComponent(
      urlOrId.startsWith("http") ? urlOrId : `https://www.facebook.com/watch/?v=${urlOrId}`
    );
    return {
      platform: "FACEBOOK",
      videoId: fbId,
      originalUrl: urlOrId.startsWith("http") ? urlOrId : `https://www.facebook.com/watch/?v=${urlOrId}`,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&t=0`,
      thumbnailUrl: fallbackThumb || "/images/church.jpeg",
      platformLabel: "Facebook",
    };
  }

  if (platform === "TIKTOK") {
    const ttId = extractTikTokId(urlOrId) || urlOrId;
    return {
      platform: "TIKTOK",
      videoId: ttId,
      originalUrl: urlOrId.startsWith("http") ? urlOrId : `https://www.tiktok.com/@video/${ttId}`,
      embedUrl: `https://www.tiktok.com/embed/v2/${ttId}`,
      thumbnailUrl: fallbackThumb || "/images/church.jpeg",
      platformLabel: "TikTok",
    };
  }

  // Par défaut: YouTube
  const ytId = extractYouTubeId(urlOrId) || urlOrId;
  return {
    platform: "YOUTUBE",
    videoId: ytId,
    originalUrl: urlOrId.startsWith("http") ? urlOrId : `https://www.youtube.com/watch?v=${ytId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}`,
    thumbnailUrl: fallbackThumb || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    platformLabel: "YouTube",
  };
}

export type VideoContentType = "SERMON" | "CLIP" | "SONG" | "SHORT";

/**
 * Détermine le type de contenu de la vidéo selon les règles établies :
 * - YouTube & Facebook : Prédications complètes / cultes
 * - TikTok : Extraits de prédications, Chants & Louanges, Courtes vidéos
 */
export function getVideoContentType(video: {
  title?: string;
  description?: string | null;
  channelName?: string | null;
  youtubeUrl?: string;
}): {
  type: VideoContentType;
  label: string;
} {
  const platform = detectVideoPlatform(video.youtubeUrl || "");
  const text = `${video.title || ""} ${video.description || ""} ${video.channelName || ""}`.toLowerCase();

  if (platform === "TIKTOK") {
    if (text.includes("chant") || text.includes("louange") || text.includes("adoration") || text.includes("song")) {
      return { type: "SONG", label: "Chant / Louange" };
    }
    if (text.includes("extrait") || text.includes("clip") || text.includes("prédication") || text.includes("sermon")) {
      return { type: "CLIP", label: "Extrait de prédication" };
    }
    return { type: "SHORT", label: "Courte vidéo" };
  }

  return { type: "SERMON", label: "Prédication / Culte" };
}

