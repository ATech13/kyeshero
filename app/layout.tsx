import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { EdgeStoreProvider } from "@/lib/edgestore";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kyeshero.net";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Assemblée Chrétienne de Goma | Église Locale - Kyeshero",
    template: "%s | Assemblée Chrétienne de Goma",
  },
  description:
    "Plateforme officielle de l'Assemblée Chrétienne de Goma (Keshero). Retrouvez les horaires des cultes, les événements à venir, les prédications audio et les vidéos officielles de notre chaîne YouTube.",
  keywords: [
    "église goma",
    "assemblée chrétienne de goma",
    "église keshero",
    "église kyeshero",
    "culte goma",
    "prédications audio",
    "prédications bibliques",
    "pasteur bake norbert",
    "église république démocratique du congo",
    "message du temps de la fin",
    "kyeshero net",
  ],
  authors: [{ name: "Assemblée Chrétienne de Goma" }],
  creator: "Assemblée Chrétienne de Goma",
  publisher: "Assemblée Chrétienne de Goma",
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: "/images/logo.png" },
      { url: "/icon.png" },
    ],
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "Assemblée Chrétienne de Goma | Église Locale",
    description: "Cultes dominicaux, prédications bibliques, chants et communion fraternelle à Goma (Kyeshero).",
    url: siteUrl,
    siteName: "Assemblée Chrétienne de Goma",
    type: "website",
    locale: "fr_FR",
    images: [
      {
        url: "/images/logo.png",
        width: 1254,
        height: 1254,
        alt: "Logo officiel de l'Assemblée Chrétienne de Goma",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assemblée Chrétienne de Goma | Église Locale",
    description: "Cultes dominicaux, prédications bibliques, chants et communion fraternelle à Goma (Kyeshero).",
    images: ["/images/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const churchJsonLd = {
  "@context": "https://schema.org",
  "@type": "Church",
  name: "Assemblée Chrétienne de Goma",
  alternateName: ["Assemblée Chrétienne de Keshero", "Assemblée Chrétienne de Kyeshero"],
  url: siteUrl,
  logo: `${siteUrl}/images/logo.png`,
  image: `${siteUrl}/images/logo.png`,
  description:
    "Plateforme officielle de l'Assemblée Chrétienne de Goma (Keshero). Cultes d'adoration, prédications de la parole de Dieu, chants et communion fraternelle.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Quartier Keshero",
    addressLocality: "Goma",
    addressRegion: "Nord-Kivu",
    addressCountry: "CD",
  },
  telephone: "+243991267790",
  sameAs: [
    "https://www.youtube.com/@assembleechretiennegomakeshero",
    "https://www.facebook.com/p/Assembl%C3%A9e-Chr%C3%A9tienne-de-Kyeshero-61561481871201/",
    "https://www.tiktok.com/@ass.chret.kyeshero",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="fr" data-theme="eglise" className={montserrat.variable}>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(churchJsonLd) }}
          />
        </head>
        <body className={`${montserrat.className} min-h-screen flex flex-col antialiased`}>
          <EdgeStoreProvider>
            <Navbar />
            <Toaster
              position="top-right"
              richColors
              duration={3500}
              visibleToasts={3}
            />
            <main className="flex-1 w-full max-w-full overflow-x-clip">{children}</main>
            <Footer />
          </EdgeStoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}