import Image from "next/image";
import Link from "next/link";
import { Heart, BookOpen, Users, Cross, Calendar, MapPin, Sparkles, Quote as QuoteIcon, MessageCircle, ArrowRight } from "lucide-react";
import { getPublicSermonQuotes } from "@/actions/quotes";
import type { Metadata } from "next";
import QuotesCarousel from "./QuotesCarousel";
import ProgramsSchedule from "./ProgramsSchedule";
import { TeamShowcase, ChurchLifeGallery } from "./TeamGallery";
import bg from "../../public/images/church.webp"

export const metadata: Metadata = {
  title: "À Propos | Assemblée Chrétienne de Goma",
  description: "Vision, piliers de foi, programme des rassemblements et citations spirituelles de l'Assemblée Chrétienne de Goma Keshero.",
};

export default async function AboutPage() {
  // Récupération des citations de prédications publiées
  let quotes: any[] = [];
  try {
    quotes = await getPublicSermonQuotes({ limit: 6 });
  } catch (error) {
    console.error("Erreur lors de la récupération des citations:", error);
  }

  // Citations de repli si aucune citation n'est encore enregistrée en base
  const displayQuotes =
    quotes.length > 0
      ? quotes
      : [
          {
            id: "default-1",
            quote:
              "La foi ne rend pas les choses faciles, elle les rend possibles. Demeurez fermes dans les promesses divines.",
            preacher: "Pasteur de l'Assemblée",
            sermonTitle: "La Puissance de la Foi Vivante",
            category: "Foi & Persévérance",
          },
          {
            id: "default-2",
            quote:
              "L'amour de Dieu manifesté dans la communion fraternelle est le plus puissant témoignage pour notre génération.",
            preacher: "Conseil Pastoral",
            sermonTitle: "Marcher dans l'Amour Fraternel",
            category: "Amour & Unité",
          },
          {
            id: "default-3",
            quote:
              "La prière fervente et persévérante ouvre les portes que la force humaine ne peut ébranler.",
            preacher: "Ministère",
            sermonTitle: "La Ferveur dans la Prière",
            category: "Prière",
          },
        ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-16 animate-in fade-in duration-500">
      {/* En-tête */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <Cross className="h-3.5 w-3.5" />
          <span>Notre Vision &amp; Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-base-content">
          À propos de l’Assemblée Chrétienne de Goma Kyeshero
        </h1>
        <p className="text-base text-base-content/75 max-w-2xl mx-auto leading-relaxed">
          Une communauté de foi engagée à vivre et proclamer l’Évangile de Jésus-Christ avec authenticité apostolique, amour fraternel et ferveur spirituelle dans la ville de Goma, non loin du terrain SOTRAKI.
        </p>
      </div>

      {/* Bannière : notre temple */}
      <figure className="relative overflow-hidden rounded-3xl border border-base-300 shadow-sm -mt-6">
        <div className="relative aspect-[16/9] sm:aspect-[21/9]">
          <Image
            src={bg}
            alt="Vue architecturale du temple de l’Assemblée Chrétienne de Goma à Kyeshero"
            fill
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        </div>
        <figcaption className="absolute inset-x-0 bottom-0 flex flex-col sm:flex-row sm:items-end justify-between gap-2 p-5 sm:p-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Notre maison de prière</p>
            <p className="text-xl sm:text-2xl font-black text-white">Assemblée Chrétienne de Goma · Kyeshero</p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            <MapPin className="h-3.5 w-3.5" />
            Goma, RD Congo
          </span>
        </figcaption>
      </figure>

      {/* Piliers fondamentaux */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs hover:border-primary/40 transition">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg text-base-content">La Parole de Dieu</h3>
          <p className="text-sm text-base-content/70 leading-relaxed">
            Nous plaçons les Saintes Écritures au cœur absolu de notre enseignement, de notre doctrine et de notre marche quotidienne.
          </p>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs hover:border-primary/40 transition">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Heart className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg text-base-content">L’Amour Fraternel</h3>
          <p className="text-sm text-base-content/70 leading-relaxed">
            Un accueil bienveillant pour chaque âme : membres, familles, nouveaux convertis et visiteurs trouvent leur place dans la fraternité.
          </p>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 space-y-3 shadow-xs hover:border-primary/40 transition">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg text-base-content">La Prière &amp; Communion</h3>
          <p className="text-sm text-base-content/70 leading-relaxed">
            Des rendez-vous réguliers de prière et d’intercession pour la paix de notre pays, nos familles et l’édification du corps de Christ.
          </p>
        </div>
      </div>

      {/* Notre famille spirituelle */}
      <section className="space-y-8" aria-labelledby="famille-spirituelle">
        <div className="border-b border-base-300 pb-4 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <Users className="h-4 w-4" />
              <span>Leadership &amp; Ministères</span>
            </div>
            <h2 id="famille-spirituelle" className="text-2xl sm:text-3xl font-black text-base-content mt-1">
              Notre Famille Spirituelle
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-base-content/65 max-w-md text-center sm:text-right">
            Les hommes et les équipes qui, avec fidélité, servent le Seigneur et prennent soin de l’assemblée.
          </p>
        </div>

        <TeamShowcase />
      </section>

      {/* Vie de l'Église */}
      <section className="space-y-8" aria-labelledby="vie-eglise">
        <div className="border-b border-base-300 pb-4 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-secondary uppercase tracking-wider">
              <span>Ordonnances &amp; Communion</span>
            </div>
            <h2 id="vie-eglise" className="text-2xl sm:text-3xl font-black text-base-content mt-1">
              La Vie de l’Église
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-base-content/65 max-w-md text-center sm:text-right">
            Des moments sacrés qui rythment notre marche commune dans l’obéissance à la Parole.
          </p>
        </div>

        <ChurchLifeGallery />
      </section>

      {/* Programme Hebdomadaire */}
      <section className="space-y-8">
        <div className="border-b border-base-300 pb-4 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-secondary uppercase tracking-wider">
              <Calendar className="h-4 w-4" />
              <span>Horaires des Cultes &amp; Rassemblements</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-base-content mt-1">
              Notre Programme Hebdomadaire
            </h2>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-1.5 text-xs text-base-content/65">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>6 lieux de rassemblement à Goma</span>
          </div>
        </div>

        <ProgramsSchedule />
      </section>

      {/* Section Citations & Paroles d'Édification */}
      <section className="space-y-8">
        <div className="border-b border-base-300 pb-4 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <QuoteIcon className="h-4 w-4" />
              <span>Paroles d'Édification &amp; Enseignements</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-base-content mt-1">
              Citations &amp; Pensées Spirituelles
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-base-content/65 max-w-md text-center sm:text-right">
            Extraits inspirants tirés des prédications pour nourrir votre méditation et fortifier votre foi au quotidien.
          </p>
        </div>

        <QuotesCarousel quotes={displayQuotes} />
      </section>

      {/* Section Contact */}
      <section className="space-y-6" id="contact-eglise">
        <div className="border-b border-base-300 pb-4 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <span>Contact</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-base-content mt-1">
              Envoyer un Message ou une Requête
            </h2>
          </div>
          <div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-base-300 bg-base-100 px-4 py-2.5 text-xs sm:text-sm font-bold text-base-content hover:border-primary hover:text-primary transition shadow-xs"
            >
              <MessageCircle className="h-4 w-4 text-primary" />
              <span>Accéder au contact</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}