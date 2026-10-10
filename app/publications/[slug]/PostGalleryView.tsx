"use client";

import { useState } from "react";
import Image from "next/image";
import { Images, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface GalleryImage {
  id: string;
  imageUrl: string;
  caption?: string | null;
}

interface PostGalleryViewProps {
  images: GalleryImage[];
  postTitle: string;
}

export default function PostGalleryView({ images, postTitle }: PostGalleryViewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const currentImage = selectedIndex !== null ? images[selectedIndex] : null;

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  const handlePrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-base-200">
      <div className="flex items-center gap-2 text-sm font-bold text-base-content">
        <Images className="h-4 w-4 text-primary" />
        <span>Photos supplémentaires ({images.length})</span>
      </div>

      {/* Grille de miniatures */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setSelectedIndex(idx)}
            className="group relative aspect-4/3 w-full overflow-hidden rounded-xl bg-base-200 focus-visible:outline-2 focus-visible:outline-primary transition-all duration-200"
          >
            <Image
              src={img.imageUrl}
              alt={img.caption || `${postTitle} photo ${idx + 1}`}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
              <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {img.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-left text-[11px] text-white truncate">
                {img.caption}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Modale Lightbox Plein Écran */}
      {currentImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative flex flex-col items-center max-w-5xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="btn btn-circle btn-sm btn-ghost absolute -top-12 right-0 text-white hover:bg-white/20"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Image courante */}
            <div className="relative aspect-4/3 sm:aspect-16/10 w-full max-h-[75vh] overflow-hidden rounded-2xl bg-black">
              <Image
                src={currentImage.imageUrl}
                alt={currentImage.caption || postTitle}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Navigation et légende */}
            <div className="mt-3 flex items-center justify-between w-full px-2 text-white">
              <p className="text-sm text-white/80 truncate">
                {currentImage.caption || `Photo ${(selectedIndex ?? 0) + 1} sur ${images.length}`}
              </p>

              {images.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="btn btn-circle btn-xs btn-ghost text-white hover:bg-white/20"
                    aria-label="Précédent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-white/60">
                    {(selectedIndex ?? 0) + 1} / {images.length}
                  </span>
                  <button
                    onClick={handleNext}
                    className="btn btn-circle btn-xs btn-ghost text-white hover:bg-white/20"
                    aria-label="Suivant"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
