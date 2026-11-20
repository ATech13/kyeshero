"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Enregistrement du Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Enregistrement silencieux
      });
    }

    // 2. Vérifier si l'application est déjà lancée en mode installé (Standalone)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return;
    }

    // 3. Vérifier si l'utilisateur a fermé la bannière récemment
    const dismissedAt = sessionStorage.getItem("pwa_prompt_dismissed");
    if (dismissedAt) {
      return;
    }

    // 4. Détecter iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    // 5. Écouter l'événement standard Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Sur iOS, afficher la bannière après quelques secondes si non standalone
    let iosTimer: NodeJS.Timeout | null = null;
    if (isIosDevice) {
      iosTimer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("pwa_prompt_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Installation de l'application"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="rounded-2xl border border-primary/30 bg-base-100/95 p-3.5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-base-300 bg-base-200 p-1">
            <Image
              src="/icons/icon-192x192.png"
              alt="ACKyeshero"
              width={44}
              height={44}
              className="h-full w-full object-contain"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black tracking-tight text-base-content uppercase">
              ACKyeshero
            </h4>
            <p className="text-[11px] text-base-content/70 truncate">
              Installer l&apos;application sur votre téléphone
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="btn btn-ghost btn-circle btn-xs text-base-content/50 hover:text-base-content"
            aria-label="Fermer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {showIosGuide ? (
          <div className="mt-3 rounded-xl bg-base-200/80 p-2.5 text-[11px] text-base-content/85 space-y-1">
            <p className="font-semibold flex items-center gap-1 text-primary">
              <Share className="h-3.5 w-3.5" /> Sur Safari iOS :
            </p>
            <p>
              1. Appuyez sur le bouton <strong>Partager</strong> en bas de Safari.
            </p>
            <p>
              2. Faites défiler et appuyez sur <strong>« Sur l&apos;écran d&apos;accueil »</strong>.
            </p>
          </div>
        ) : (
          <div className="mt-2.5 flex items-center justify-end gap-2">
            <button
              onClick={handleDismiss}
              className="px-2.5 py-1 text-xs text-base-content/60 hover:text-base-content"
            >
              Plus tard
            </button>
            <button
              onClick={handleInstallClick}
              className="btn btn-primary btn-xs rounded-lg font-bold gap-1.5 px-3"
            >
              <Download className="h-3 w-3" />
              Installer
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
