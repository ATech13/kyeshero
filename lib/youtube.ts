export function extractYouTubeVideoId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // Si c'est déjà un ID brut de 11 caractères
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Expression régulière universelle pour YouTube
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);

  return match && match[1] ? match[1] : null;
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

export async function isYouTubeVideoLive(urlOrId: string): Promise<boolean> {
  const videoId = extractYouTubeVideoId(urlOrId);
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (videoId && apiKey) {
    try {
      const apiRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoId}&key=${apiKey}`,
        { cache: "no-store", signal: AbortSignal.timeout(4000) }
      );
      if (apiRes.ok) {
        const data = await apiRes.json();
        const item = data?.items?.[0];
        if (item) {
          return (
            item.snippet?.liveBroadcastContent === "live" ||
            Boolean(item.liveStreamingDetails?.actualStartTime && !item.liveStreamingDetails?.actualEndTime)
          );
        }
      }
    } catch {
      // Fallback sur la vérification publique
    }
  }

  const targetUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : urlOrId.startsWith("http") && urlOrId.includes("youtube.com")
    ? urlOrId
    : null;

  if (!targetUrl) return false;

  try {
    const res = await fetch(targetUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(4500),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        Cookie: "SOCS=CAI",
      },
    });
    if (!res.ok) return false;

    const html = await res.text();
    const isLiveNow =
      html.includes('"liveBroadcastDetails":{"isLiveNow":true') ||
      html.includes('"isLiveNow":true');
    const hasEnded = html.includes('itemprop="endDate"');
    const isUpcoming = html.includes('"isUpcoming":true');

    return isLiveNow && !hasEnded && !isUpcoming;
  } catch {
    return false;
  }
}
