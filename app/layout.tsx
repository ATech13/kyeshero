import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Assemblée Chrétienne de Goma | Église Locale",
    template: "%s | Assemblée Chrétienne de Goma",
  },
  description:
    "Plateforme officielle de l'Assemblée Chrétienne de Goma. Retrouvez les horaires des cultes, les événements à venir, les prédications audio et les vidéos officielles de notre chaîne YouTube.",
  keywords: [
    "église goma",
    "assemblée chrétienne de goma",
    "culte goma",
    "prédications audio",
    "église keshero",
    "église république démocratique du congo",
  ],
  authors: [{ name: "Assemblée Chrétienne de Goma" }],
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "Assemblée Chrétienne de Goma | Église Locale",
    description: "Cultes dominicaux, prédications bibliques, chants et communion fraternelle à Goma.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="fr" data-theme="eglise" className={montserrat.variable}>
        <body className={`${montserrat.className} min-h-screen flex flex-col antialiased`}>
          <Navbar />
          <Toaster
            position="top-right"
            richColors
            duration={3500}
            visibleToasts={3}
          />
          <main className="flex-1 w-full max-w-full overflow-x-clip">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}