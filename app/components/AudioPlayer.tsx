"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Download, HardDrive } from "lucide-react";
import Image from "next/image";

interface AudioPlayerProps {
  src: string;
  title: string;
  speaker?: string | null;
  coverUrl?: string | null;
  duration?: number | null;
  fileSize?: string | number | null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function AudioPlayer({
  src,
  title,
  speaker,
  coverUrl,
  duration: initialDuration,
  fileSize: initialFileSize,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [isMuted, setIsMuted] = useState(false);
  const [displayFileSize, setDisplayFileSize] = useState<string | null>(() => {
    if (initialFileSize) {
      return typeof initialFileSize === "number"
        ? formatBytes(initialFileSize)
        : String(initialFileSize);
    }
    return null;
  });

  // Détection de la taille du fichier via requête HEAD ou estimation
  useEffect(() => {
    if (initialFileSize) return;
    if (!src) return;

    let isMounted = true;

    fetch(src, { method: "HEAD" })
      .then((res) => {
        if (!isMounted) return;
        const contentLength = res.headers.get("content-length");
        if (contentLength) {
          const bytes = parseInt(contentLength, 10);
          if (!isNaN(bytes) && bytes > 0) {
            setDisplayFileSize(formatBytes(bytes));
            return;
          }
        }
        // Si HEAD ne renvoie pas Content-Length (ou CORS restreint), calcul estimatif basé sur la durée
        if (duration && duration > 0) {
          setDisplayFileSize(`~${formatBytes(duration * 16000)}`);
        }
      })
      .catch(() => {
        // En cas de blocage CORS, calcul estimé basé sur la durée
        if (isMounted && duration && duration > 0) {
          setDisplayFileSize(`~${formatBytes(duration * 16000)}`);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src, initialFileSize, duration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
        // Si la taille n'est toujours pas résolue, estimer avec la durée détectée
        setDisplayFileSize((prev) => {
          if (!prev && audio.duration > 0) {
            return `~${formatBytes(audio.duration * 16000)}`;
          }
          return prev;
        });
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn("Échec de lecture audio:", err);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5 shadow-sm transition hover:shadow-md w-full max-w-full overflow-hidden">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-3 sm:gap-4">
        {coverUrl ? (
          <div className="relative h-12 w-12 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl bg-base-200">
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-0.5" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm sm:text-base font-bold text-base-content" title={title}>
            {title}
          </h4>
          {speaker && (
            <p className="text-xs text-base-content/65 font-medium mt-0.5 truncate">
              {speaker}
            </p>
          )}
        </div>

        {/* Bouton Play principal */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content shadow-sm hover:scale-105 active:scale-95 transition"
          aria-label={isPlaying ? "Mettre en pause" : "Écouter l'enregistrement"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <Play className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5" />
          )}
        </button>
      </div>

      {/* Barre de progression & Temps */}
      <div className="mt-4 space-y-1">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer accent-primary"
            aria-label="Position de lecture audio"
          />
        </div>
        <div className="flex justify-between text-[11px] font-semibold text-base-content/60 font-mono pt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Contrôles secondaires */}
      <div className="mt-2 flex items-center justify-between pt-1 border-t border-base-200 text-base-content/60">
        <div className="flex items-center gap-2">
          {/* Taille du fichier au lieu du bouton recommencer */}
          {displayFileSize && (
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-base-200/80 text-[11px] font-medium text-base-content/75"
              title={`Taille du fichier : ${displayFileSize}`}
            >
              <HardDrive className="h-3 w-3 text-base-content/50" />
              <span>{displayFileSize}</span>
            </span>
          )}

          <a
            href={src}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-xs gap-1 text-[11px] text-primary font-semibold hover:bg-primary/10"
            title="Télécharger cet enregistrement audio"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Télécharger</span>
          </a>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          className="btn btn-ghost btn-xs btn-circle"
          aria-label={isMuted ? "Activer le son" : "Couper le son"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
