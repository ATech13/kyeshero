"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { MapPin, Phone, Youtube, Cross, Shield } from "lucide-react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import logo from "../../public/images/logo.png"
import Image from "next/image"

import { CHURCH_SOCIAL_LINKS } from "@/lib/church-info";
export { CHURCH_SOCIAL_LINKS };

// Icône Facebook officielle
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
    </svg>
  );
}

// Icône TikTok officielle
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

export default function Footer() {
  const pathname = usePathname();
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const el = footerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cols = el.querySelectorAll(".footer-col");
            if (cols.length > 0) {
              gsap.fromTo(
                cols,
                { opacity: 0, y: 16 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  stagger: 0.08,
                  ease: "power2.out",
                  clearProps: "all",
                }
              );
            }
            observer.disconnect();
          }
        });
      },
      { rootMargin: "0px 0px -20px 0px", threshold: 0.01 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer ref={footerRef} className="border-t border-base-300 bg-base-200/60 text-base-content">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1 : Identité & Présentation */}
          <div className="footer-col space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center text-primary-content shadow-xs">
                          <Image
                            src={logo}
                            alt="logo"
                            className="object-cover" />
                        </div>
              <span className="font-black text-base tracking-tight">Assemblée Chrétienne</span>
            </Link>
            <p className="text-xs sm:text-sm text-base-content/70 leading-relaxed">
              Une communauté vivante unie par la foi, le partage de la Parole de Dieu et le service mutuel à Goma, Quartier Keshero.
            </p>
            <p className="text-xs text-base-content/50 italic">
              « Jésus-Christ est le même hier, aujourd'hui et éternellement. » — Hébreux 13:8
            </p>
          </div>

          {/* Col 2 : Navigation simplifiée */}
          <div className="footer-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-3">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition">Accueil</Link>
              </li>
              <li>
                <Link href="/contenus" className="hover:text-primary transition">Contenus (Vidéos &amp; Audios)</Link>
              </li>
              <li>
                <Link href="/evenements" className="hover:text-primary transition">Événements &amp; Actualités</Link>
              </li>
              <li>
                <Link href="/a-propos" className="hover:text-primary transition">À propos de l'Église</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition">Contact &amp; Accès</Link>
              </li>
              <li className="pt-1">
                <Link
                  href="/admin"
                  className="hover:text-primary transition inline-flex items-center gap-1.5 text-xs text-base-content/60"
                >
                  <Shield className="h-3 w-3" />
                  <span>Espace Responsables</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 : Rassemblements */}
          <div className="footer-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-3">
              Cultes &amp; Rassemblements
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-base-content/75">
              <p><strong className="text-base-content">Dimanche :</strong> 09h00 – 12h00</p>
              <p><strong className="text-base-content">Vendredi :</strong> 09h00 – 14h00 &amp; 15h00 – 17h00</p>
              <p><strong className="text-base-content">Mardi &amp; Mercredi :</strong> 15h00 – 17h00</p>
            </div>
            <div className="mt-3 text-xs text-base-content/60 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Quartier Keshero, Ville de Goma, RDC</span>
            </div>
          </div>

          {/* Col 4 : Réseaux Sociaux Officiels */}
          <div className="footer-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-3">
              Réseaux Sociaux Officiels
            </h3>
            <p className="text-xs text-base-content/70 mb-3">
              Suivez nos cultes en direct, extraits de prédications et annonces sur nos comptes officiels :
            </p>
            <div className="flex flex-col gap-2">
              {/* YouTube */}
              <a
                href={CHURCH_SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-xl bg-base-100 border border-base-300 px-3 py-2 text-xs font-bold hover:bg-error/10 hover:border-error/40 hover:text-error transition group shadow-2xs"
                aria-label="Chaîne YouTube officielle de l'Assemblée Chrétienne"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-error text-white shrink-0 group-hover:scale-105 transition-transform">
                  <Youtube className="h-3.5 w-3.5" />
                </div>
                <span>YouTube</span>
              </a>

              {/* TikTok */}
              <a
                href={CHURCH_SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-xl bg-base-100 border border-base-300 px-3 py-2 text-xs font-bold hover:bg-base-300 transition group shadow-2xs"
                aria-label="Compte TikTok officiel de l'Assemblée Chrétienne"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-black text-white shrink-0 group-hover:scale-105 transition-transform">
                  <TikTokIcon className="h-3.5 w-3.5 text-[#00f2fe]" />
                </div>
                <span>TikTok</span>
              </a>

              {/* Facebook */}
              <a
                href={CHURCH_SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-xl bg-base-100 border border-base-300 px-3 py-2 text-xs font-bold hover:bg-[#1877F2]/10 hover:border-[#1877F2]/40 hover:text-[#1877F2] transition group shadow-2xs"
                aria-label="Page Facebook officielle de l'Assemblée Chrétienne"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#1877F2] text-white shrink-0 group-hover:scale-105 transition-transform">
                  <FacebookIcon className="h-3.5 w-3.5" />
                </div>
                <span>Facebook</span>
              </a>
            </div>

            <div className="mt-3 text-xs text-base-content/60 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>+243 997 717 686</span>
            </div>
          </div>
        </div>

        {/* Ligne inférieure de copyright */}
        <div className="mt-10 border-t border-base-300 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-base-content/50">
          <p>© {new Date().getFullYear()} Assemblée Chrétienne de Goma. Tous droits réservés.</p>
          <p className="flex items-center gap-2">
            <span>Foi</span>
            <span>·</span>
            <span>Édification</span>
            <span>·</span>
            <span>Espérance</span>
          </p>
        </div>
      </div>
    </footer>
  );
}