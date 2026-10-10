"use client";

import Link from "next/link";
import { Cross, Shield, LogIn, Menu, X, Phone, Heart, Youtube } from "lucide-react";
import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ToggleTheme from "./ToggleTheme";
import { CHURCH_SOCIAL_LINKS } from "@/lib/church-info";

gsap.registerPlugin(useGSAP);

export default function Navbar() {
  const [openExtra, setOpenExtra] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();
  const headerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      gsap.from(".nav-brand", {
        opacity: 0,
        x: -12,
        duration: 0.6,
        ease: "power2.out",
        clearProps: "all",
      });

      gsap.from(".nav-link-item", {
        opacity: 0,
        y: -6,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out",
        delay: 0.1,
        clearProps: "all",
      });

      gsap.from(".nav-actions", {
        opacity: 0,
        x: 10,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.12,
        clearProps: "all",
      });
    },
    { scope: headerRef }
  );

  // Masquer dans l'espace admin pour conserver le header d'administration dédié
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Exactement 3 onglets principaux (Accueil exclu, accessible via le logo)
  const mainTabs = [
    { label: "Contenus", href: "/contenus", matchPrefix: ["/contenus", "/medias"] },
    { label: "Événements", href: "/evenements", matchPrefix: ["/evenements", "/publications"] },
    { label: "À-propos", href: "/a-propos", matchPrefix: ["/a-propos"] },
  ];

  const isTabActive = (item: (typeof mainTabs)[0]) => {
    if (!pathname) return false;
    return item.matchPrefix.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 w-full max-w-full border-b border-base-300/80 bg-base-100/95 backdrop-blur-md"
    >
      {/* Barre supérieure principale */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        {/* Logo de l'église -> Accueil (/) */}
        <Link
          href="/"
          className="nav-brand flex items-center gap-2.5 rounded-xl p-1 transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-primary"
          title="Accueil — Assemblée Chrétienne de Goma"
          aria-label="Retour à l'accueil"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-content shadow-xs">
            <Cross className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight leading-tight text-base-content">
              Assemblée Chrétienne
            </span>
            <span className="text-[10px] font-bold tracking-wider text-base-content/60 uppercase">
              Goma · Keshero
            </span>
          </div>
        </Link>

        {/* Navigation Desktop — Uniquement les 3 onglets principaux */}
        <nav
          className="hidden md:flex items-center gap-1.5 rounded-2xl bg-base-200/60 p-1 border border-base-300/60"
          aria-label="Navigation principale"
        >
          {mainTabs.map((item) => {
            const active = isTabActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link-item px-4 py-1.5 text-sm font-bold rounded-xl transition ${
                  active
                    ? "bg-base-100 text-primary shadow-xs"
                    : "text-base-content/75 hover:text-base-content hover:bg-base-100/50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions à droite */}
        <div className="nav-actions flex items-center gap-2 sm:gap-2.5">
          <ToggleTheme />
          
          {/* Menu secondaire mobile (contact, infos) */}
          <button
            className="btn btn-ghost btn-square btn-sm md:hidden text-base-content/70"
            onClick={() => setOpenExtra(!openExtra)}
            aria-label={openExtra ? "Fermer le menu secondaire" : "Ouvrir le menu d'informations"}
            aria-expanded={openExtra}
          >
            {openExtra ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Barre d'onglets mobile — Directement visible et tactile (Contenus | Événements | À-propos) */}
      <div className="md:hidden border-t border-base-200/80 bg-base-100/95 px-3 py-1.5">
        <nav
          className="grid grid-cols-3 gap-1 rounded-xl bg-base-200/70 p-1 border border-base-300/50 text-center"
          aria-label="Navigation principale mobile"
        >
          {mainTabs.map((item) => {
            const active = isTabActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  active
                    ? "bg-base-100 text-primary shadow-xs"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Menu d'options supplémentaires sur mobile (Contact, À propos rapide, Accès admin) */}
      {openExtra && (
        <div className="md:hidden border-t border-base-300 bg-base-100 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-200 space-y-2">
          <div className="flex flex-col gap-1 text-sm font-medium">
            <Link
              href="/contact"
              onClick={() => setOpenExtra(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-base-200 transition text-base-content/85"
            >
              <Phone className="h-4 w-4 text-primary" />
              <span>Nous contacter &amp; Itinéraire</span>
            </Link>

            <Link
              href="/a-propos"
              onClick={() => setOpenExtra(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-base-200 transition text-base-content/85"
            >
              <Heart className="h-4 w-4 text-secondary" />
              <span>Horaires des cultes &amp; Rassemblements</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-base-200 flex items-center justify-around px-2 py-1 text-xs font-semibold text-base-content/75">
            <a
              href={CHURCH_SOCIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-error transition"
            >
              <Youtube className="h-3.5 w-3.5 text-error" />
              <span>YouTube</span>
            </a>
            <a
              href={CHURCH_SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#1877F2] transition"
            >
              <svg className="h-3.5 w-3.5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
              <span>Facebook</span>
            </a>
            <a
              href={CHURCH_SOCIAL_LINKS.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-primary transition"
            >
              <svg className="h-3.5 w-3.5 text-[#00f2fe]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
              <span>TikTok</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}