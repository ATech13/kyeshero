import { MapPin, Phone, Youtube } from "lucide-react";
import { CHURCH_CONFIG } from "@/lib/church-info";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10 animate-in fade-in duration-500">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-base-content">
          Contactez l’Assemblée Chrétienne
        </h1>
        <p className="text-base text-base-content/70 max-w-xl mx-auto">
          Vous êtes de passage à Goma ou vous cherchez une communauté pour prier ? N’hésitez pas à nous écrire ou nous rendre visite.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-start gap-4 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-xs hover:border-primary/40 transition">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Adresse du lieu de culte</h3>
              <p className="text-sm text-base-content/70 mt-0.5">
                Quartier Keshero, Ville de Goma, Nord-Kivu, RDC
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-xs hover:border-primary/40 transition">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Téléphone &amp; WhatsApp</h3>
              <p className="text-sm text-base-content/70 mt-0.5">
                +243 997 717 686
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-base text-base-content">Nos Plateformes Officielles</h3>
            <p className="text-xs text-base-content/65">
              Rejoignez la communauté en ligne sur nos réseaux officiels :
            </p>

            <div className="grid gap-2.5 pt-1">
              {/* YouTube */}
              <a
                href={CHURCH_CONFIG.social.youtube.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-base-200 p-2.5 hover:border-error/40 hover:bg-error/5 transition group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-error text-white shrink-0 group-hover:scale-105 transition-transform">
                  <Youtube className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-base-content truncate">YouTube</div>
                  <div className="text-[11px] text-error truncate font-medium">{CHURCH_CONFIG.social.youtube.handle}</div>
                </div>
              </a>

              {/* Facebook */}
              <a
                href={CHURCH_CONFIG.social.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-base-200 p-2.5 hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5 transition group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1877F2] text-white shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-base-content truncate">Facebook</div>
                  <div className="text-[11px] text-[#1877F2] truncate font-medium">{CHURCH_CONFIG.social.facebook.handle}</div>
                </div>
              </a>

              {/* TikTok */}
              <a
                href={CHURCH_CONFIG.social.tiktok.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-base-200 p-2.5 hover:border-base-content/40 hover:bg-base-200 transition group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="h-4 w-4 text-[#00f2fe]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-base-content truncate">TikTok</div>
                  <div className="text-[11px] text-base-content/80 truncate font-medium">{CHURCH_CONFIG.social.tiktok.handle}</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <form className="rounded-3xl border border-base-300 bg-base-200/50 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold">Envoyer un message à l’église</h2>
          <div>
            <label className="block text-xs font-semibold text-base-content/70 mb-1" htmlFor="fullName">
              Nom complet
            </label>
            <input
              id="fullName"
              type="text"
              className="input input-bordered w-full rounded-xl"
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-base-content/70 mb-1" htmlFor="contactInfo">
              Numéro de téléphone ou email
            </label>
            <input
              id="contactInfo"
              type="text"
              className="input input-bordered w-full rounded-xl"
              placeholder="Ex: +243... ou email@exemple.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-base-content/70 mb-1" htmlFor="message">
              Votre message ou requête de prière
            </label>
            <textarea
              id="message"
              className="textarea textarea-bordered w-full rounded-xl h-32"
              placeholder="Écrivez votre message ici..."
            />
          </div>
          <button
            type="button"
            className="btn btn-primary w-full rounded-xl"
          >
            Envoyer le message
          </button>
        </form>
      </div>
    </div>
  );
}