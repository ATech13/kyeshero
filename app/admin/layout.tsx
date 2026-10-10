import Link from "next/link";
import {
  Calendar,
  Headphones,
  Video,
  Radio,
  LayoutDashboard,
  ExternalLink,
  Shield,
  ShieldAlert,
  LogOut,
  ArrowLeft,
  Newspaper,
  Quote,
  MessageSquareHeart,
} from "lucide-react";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateCurrentUser } from "@/lib/auth-user";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // Si non authentifié, rediriger vers la page de connexion locale
  if (!userId) {
    redirect("/sign-in?redirect_url=/admin");
  }

  const clerkUser = await currentUser();

  // Récupérer le compte synchronisé dans la base de données
  const user = await getOrCreateCurrentUser();

  // Vérifier si l'utilisateur possède les privilèges requis
  const isAuthorized = user && (user.role === "ADMIN" || user.role === "EDITOR");

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-base-200/50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl border border-base-300 bg-base-100 p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/15 text-warning">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-base-content">
              Accès Administrateur Restreint
            </h1>
            <p className="text-sm text-base-content/70">
              Votre compte est bien connecté mais ne dispose pas des droits d'administration de la plateforme de l'église.
            </p>
          </div>

          <div className="rounded-2xl bg-base-200/70 p-4 text-left text-xs space-y-2 border border-base-300">
            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Utilisateur :</span>
              <span className="font-bold text-base-content">
                {clerkUser?.firstName || user?.firstName || "Utilisateur"} {clerkUser?.lastName || user?.lastName || ""}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Email :</span>
              <span className="font-bold text-base-content">
                {user?.email || clerkUser?.emailAddresses?.[0]?.emailAddress || "Non renseigné"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-content/60">Rôle actuel :</span>
              <span className="badge badge-sm badge-ghost font-bold">
                {user?.role || "MEMBER"}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/" className="btn btn-ghost btn-sm gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Retour au site public</span>
            </Link>

            <SignOutButton redirectUrl="/sign-in?redirect_url=/admin">
              <button className="btn btn-outline btn-error btn-sm gap-2">
                <LogOut className="h-4 w-4" />
                <span>Changer de compte</span>
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Tableau de bord", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Contenus (Vidéos & Audios)", href: "/admin/contenus", icon: <Radio className="h-4 w-4" /> },
    { label: "Publications & Travaux", href: "/admin/publications", icon: <Newspaper className="h-4 w-4" /> },
    { label: "Citations de Prédications", href: "/admin/citations", icon: <Quote className="h-4 w-4" /> },
    { label: "Événements & Actualités", href: "/admin/evenements", icon: <Calendar className="h-4 w-4" /> },
    { label: "Interactions Prédications", href: "/admin/interactions", icon: <MessageSquareHeart className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-base-200/50 flex flex-col w-full overflow-x-hidden">
      {/* Barre d'administration supérieure */}
      <header className="sticky top-0 z-40 border-b border-base-300 bg-base-100 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-content shadow-xs">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-black text-base-content leading-none block">
                Gestion de l'Église
              </span>
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                Espace Responsables
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="btn btn-ghost btn-sm gap-1.5 text-xs text-base-content/75 hidden sm:inline-flex"
            >
              <span>Voir le site public</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <UserButton />
          </div>
        </div>

        {/* Navigation Admin */}
        <div className="border-t border-base-200 bg-base-100/90 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none">
          <div className="mx-auto flex max-w-7xl gap-2 py-2">
            {navItems.map(({ label, href, icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold text-base-content/80 hover:bg-base-200 hover:text-base-content transition shrink-0"
              >
                {icon}
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Contenu de l'espace admin */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0">
        {children}
      </main>
    </div>
  );
}
