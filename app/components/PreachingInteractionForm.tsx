"use client";

import { useState } from "react";
import { MessageSquare, Heart, Send, CheckCircle2, AlertCircle, Loader2, Volume2 } from "lucide-react";
import { submitInteraction, InteractionType } from "@/actions/interactions";
import { toast } from "sonner";

interface PreachingInteractionFormProps {
  videoId: string;
  videoTitle: string;
}

/**
 * Carillon sonore mélodieux via l'API Web Audio (aucun fichier externe requis, fiable sur tous navigateurs)
 */
function playGreetingChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // Accord C majeur : Do, Mi, Sol, Do aigu
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + idx * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.1 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.65);
    });
  } catch (e) {
    // Si l'autoplay audio est restreint, ignorer silencieusement
  }
}

export default function PreachingInteractionForm({
  videoId,
  videoTitle,
}: PreachingInteractionFormProps) {
  const [type, setType] = useState<InteractionType>("GREETING");
  const [authorName, setAuthorName] = useState("");
  const [contact, setContact] = useState("");
  const [content, setContent] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (honeypot) {
      // Spam robot
      return;
    }

    if (!authorName.trim() || authorName.trim().length < 2) {
      setErrorMessage("Veuillez indiquer votre prénom ou votre nom.");
      return;
    }

    if (!content.trim() || content.trim().length < 3) {
      setErrorMessage("Veuillez saisir votre message ou votre salutation.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await submitInteraction({
        videoId,
        videoTitle,
        type,
        authorName: authorName.trim(),
        contact: contact.trim() || null,
        content: content.trim(),
        honeypot,
      });

      if (res.success) {
        // Son de confirmation / salutation
        playGreetingChime();

        setIsSuccess(true);
        setContent("");
        toast.success(res.message);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setContent("");
    setErrorMessage(null);
  };

  return (
    <div className="flex flex-col h-full bg-base-100/95 border border-base-300 rounded-2xl p-4 sm:p-5 shadow-xs">
      {/* En-tête du formulaire */}
      <div className="border-b border-base-200 pb-3 mb-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
            Interaction
          </span>
        </div>
        <h4 className="text-sm font-black text-base-content mt-0.5">
          Partager un message ou saluer
        </h4>
      </div>

      {isSuccess ? (
        <div className="my-auto py-6 text-center space-y-4 animate-in fade-in duration-300">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-success/15 text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h5 className="text-base font-bold text-base-content">
              Votre message a bien été envoyé !
            </h5>
            <p className="text-xs text-base-content/70 leading-relaxed max-w-xs mx-auto">
              Merci pour votre participation et que la grâce du Seigneur Jésus-Christ vous accompagne.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-outline btn-xs rounded-xl font-bold"
          >
            Envoyer un autre message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5 flex flex-col justify-between flex-1">
          {/* Sélection du Type : Commentaire vs Salutation */}
          <div>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-base-200 border border-base-300/60">
              <button
                type="button"
                onClick={() => setType("GREETING")}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  type === "GREETING"
                    ? "bg-secondary text-secondary-content shadow-xs"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                <Heart className="h-3.5 w-3.5 text-error" />
                <span>Saluer l'église</span>
                <span title="Accompagné d'un carillon sonore">
                  <Volume2 className="h-3 w-3 opacity-60" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setType("COMMENT")}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  type === "COMMENT"
                    ? "bg-base-100 text-primary shadow-xs"
                    : "text-base-content/70 hover:text-base-content"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Commentaire</span>
              </button>

            </div>
          </div>

          {/* Champ caché anti-spam (honeypot) */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          {/* Nom du visiteur */}
          <div>
            <label className="block text-[11px] font-bold text-base-content/75 mb-1" htmlFor="interaction-author">
              Votre prénom ou nom *
            </label>
            <input
              id="interaction-author"
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Ex: Frère David, Sœur Marie..."
              className="input input-sm input-bordered w-full rounded-xl text-xs bg-base-100"
            />
          </div>

          {/* Contact ou Ville optionnelle */}
          <div>
            <label className="block text-[11px] font-bold text-base-content/75 mb-1" htmlFor="interaction-contact">
              Ville ou Contact <span className="font-normal text-base-content/50">(optionnel)</span>
            </label>
            <input
              id="interaction-contact"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Ex: Goma, Butembo, +243..."
              className="input input-sm input-bordered w-full rounded-xl text-xs bg-base-100"
            />
          </div>

          {/* Message / Salutation */}
          <div>
            <label className="block text-[11px] font-bold text-base-content/75 mb-1" htmlFor="interaction-content">
              {type === "COMMENT" ? "Votre commentaire *" : "Votre message de salutation *"}
            </label>
            <textarea
              id="interaction-content"
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                type === "COMMENT"
                  ? "Commentez ici..."
                  : "Saluez ici..."
              }
              className="textarea textarea-bordered w-full rounded-xl text-xs leading-relaxed bg-base-100"
            />
          </div>

          {/* Message d'erreur */}
          {errorMessage && (
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-error/10 text-error text-xs">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Bouton d'envoi */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !authorName.trim() || !content.trim()}
              className={`btn btn-sm w-full rounded-xl font-bold gap-2 shadow-xs transition ${
                type === "GREETING"
                  ? "btn-secondary text-secondary-content"
                  : "btn-primary text-primary-content"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Transmission...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {type === "GREETING" ? "Envoyer ma salutation" : "Envoyer mon commentaire"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
