"use client";

import { useState } from "react";
import { Send, MessageCircle, HeartHandshake, PhoneCall, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { CHURCH_CONFIG } from "@/lib/church-info";

interface WhatsAppContactFormProps {
  title?: string;
  subtitle?: string;
  defaultSubject?: string;
  source?: string;
}

const SUBJECT_OPTIONS = [
  "Requête de prière",
  "Question spirituelle ou conseil pastoral",
  "Témoignage & action de grâce",
  "Visite & informations sur les cultes",
  "Autre message",
];

export default function WhatsAppContactForm({
  title = "Envoyer un message à l’église",
  subtitle = "Votre message sera directement préparé et envoyé via WhatsApp à nos serviteurs.",
  defaultSubject = "Requête de prière",
}: WhatsAppContactFormProps) {
  const [fullName, setFullName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Veuillez saisir votre nom complet.");
      return;
    }

    if (!message.trim()) {
      toast.error("Veuillez saisir votre message ou requête.");
      return;
    }

    setIsSending(true);

    const whatsappNumber = CHURCH_CONFIG.whatsappNumber || "243900163658";
    
    const formattedText = [
      `*Assemblée Chrétienne de Goma (Kyeshero)*`,
      `_Nouveau message depuis le site web_`,
      ``,
      `👤 *Nom :* ${fullName.trim()}`,
      `📞 *Contact (Tél / Email) :* ${contactInfo.trim() || "Non spécifié"}`,
      `📌 *Objet :* ${subject}`,
      ``,
      `💬 *Message / Requête :*`,
      `${message.trim()}`,
    ].join("\n");

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(formattedText)}`;

    // Notification utilisateur
    toast.success("Ouverture de WhatsApp en cours avec votre message...", {
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    });

    // Ouvrir WhatsApp
    if (typeof window !== "undefined") {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }

    setTimeout(() => {
      setIsSending(false);
    }, 1500);
  };

  const directChatUrl = `https://wa.me/${CHURCH_CONFIG.whatsappNumber || "243900163658"}?text=${encodeURIComponent(
    "Bonjour Assemblée Chrétienne de Goma, je vous écris depuis votre site internet."
  )}`;

  return (
    <div className="rounded-3xl border border-base-300 bg-base-100/90 shadow-sm overflow-hidden">
      {/* En-tête */}
      <div className="border-b border-base-200/80 bg-base-200/40 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-base-content">{title}</h3>
          <p className="text-xs sm:text-sm text-base-content/70">{subtitle}</p>
        </div>
      </div>

      {/* Formulaire interactif */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-base-content/80 mb-1.5" htmlFor="form-fullName">
              Votre Nom complet <span className="text-error">*</span>
            </label>
            <input
              id="form-fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input input-bordered w-full rounded-xl text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="Ex: Frère David / Sœur Marie"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-base-content/80 mb-1.5" htmlFor="form-contactInfo">
              Votre Téléphone ou Email <span className="text-base-content/50 font-normal">(optionnel)</span>
            </label>
            <input
              id="form-contactInfo"
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="input input-bordered w-full rounded-xl text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="Ex: +243 9... ou email@exemple.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-base-content/80 mb-1.5" htmlFor="form-subject">
            Objet du message
          </label>
          <select
            id="form-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="select select-bordered w-full rounded-xl text-sm focus:border-emerald-500 focus:outline-none"
          >
            {SUBJECT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-base-content/80 mb-1.5" htmlFor="form-message">
            Votre message ou requête de prière <span className="text-error">*</span>
          </label>
          <textarea
            id="form-message"
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="textarea textarea-bordered w-full rounded-xl text-sm focus:border-emerald-500 focus:outline-none leading-relaxed"
            placeholder="Écrivez votre message, requête d'intercession, question ou salutation ici..."
          />
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="submit"
            disabled={isSending}
            className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-xl gap-2 font-bold px-6 shadow-sm"
          >
            <Send className="h-4 w-4" />
            <span>{isSending ? "Envoi vers WhatsApp..." : "Envoyer sur WhatsApp"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
