"use client";

import { useRef, useEffect, ReactNode } from "react";
import gsap from "gsap";

interface GSAPRevealProps {
  children: ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  staggerSelector?: string;
  scrollTrigger?: boolean;
}

/**
 * Composant de révélation GSAP ultra-robuste
 * Garantit que les éléments sont TOUJOURS visibles et ne disparaissent jamais au scroll.
 */
export default function GSAPReveal({
  children,
  className = "",
  y = 20,
  duration = 0.75,
  delay = 0,
  stagger,
  staggerSelector,
  scrollTrigger = true,
}: GSAPRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Respect des utilisateurs ayant demandé la réduction des mouvements
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const animateIn = () => {
      if (staggerSelector) {
        const targets = el.querySelectorAll(staggerSelector);
        if (targets && targets.length > 0) {
          gsap.fromTo(
            targets,
            { opacity: 0, y },
            {
              opacity: 1,
              y: 0,
              duration,
              delay,
              stagger: stagger ?? 0.08,
              ease: "power2.out",
              clearProps: "all", // Nettoie immédiatement les styles inline pour éviter tout blocage
            }
          );
          return;
        }
      }

      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: "power2.out",
          clearProps: "all", // Garantit que l'élément reste 100% visible et naturel
        }
      );
    };

    if (!scrollTrigger) {
      animateIn();
      return;
    }

    // Détection infaillible de visibilité native via IntersectionObserver
    // Évite tous les décalages de coordonnées ScrollTrigger après chargement des images/polices
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateIn();
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "0px 0px -20px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [scrollTrigger, y, duration, delay, stagger, staggerSelector]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
