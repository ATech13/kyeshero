
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";

/**
 * Récupère les emails autorisés à être administrateurs principaux.
 *
 * Exemple dans .env :
 * SUPER_ADMIN_EMAILS=admin@example.com,pasteur@example.com
 */
function getSuperAdminEmails(): string[] {
  const envEmails = process.env.SUPER_ADMIN_EMAILS || "";

  return envEmails
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Récupère ou crée l'utilisateur connecté dans notre base Prisma.
 *
 * Clerk = source d'identité
 * Prisma = profil + rôle de l'utilisateur
 */
export async function getOrCreateCurrentUser() {
  const clerkUser = await currentUser();

  // Aucun utilisateur connecté
  if (!clerkUser) {
    return null;
  }

  const email =
    clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase() || null;

  const superAdminEmails = getSuperAdminEmails();

  const isSuperAdminEmail =
    !!email && superAdminEmails.includes(email);

  /**
   * Vérifier si cet utilisateur existe déjà.
   *
   * clerkId est @unique dans Prisma.
   */
  let dbUser = await prisma.user.findUnique({
    where: {
      clerkId: clerkUser.id,
    },
  });

  /**
   * Si l'utilisateur existe déjà,
   * on synchronise simplement ses informations Clerk.
   *
   * IMPORTANT :
   * On ne recrée jamais l'utilisateur.
   */
  if (dbUser) {
    const shouldPromoteToAdmin =
      dbUser.role !== "ADMIN" &&
      isSuperAdminEmail;

    dbUser = await prisma.user.update({
      where: {
        id: dbUser.id,
      },
      data: {
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,

        ...(shouldPromoteToAdmin
          ? {
              role: "ADMIN" as UserRole,
            }
          : {}),
      },
    });

    return dbUser;
  }

  /**
   * L'utilisateur n'existe pas encore.
   *
   * On regarde s'il existe déjà un administrateur humain.
   *
   * Le compte système "system_church_admin"
   * n'est pas considéré comme un administrateur humain.
   */
  const realAdminsCount = await prisma.user.count({
    where: {
      clerkId: {
        not: "system_church_admin",
      },
      role: "ADMIN",
    },
  });

  /**
   * Le premier utilisateur humain devient ADMIN.
   *
   * Un email présent dans SUPER_ADMIN_EMAILS
   * devient également ADMIN.
   */
  const role: UserRole =
    isSuperAdminEmail || realAdminsCount === 0
      ? "ADMIN"
      : "MEMBER";

  /**
   * IMPORTANT :
   * On utilise upsert au lieu de create.
   *
   * Cela protège contre le cas où deux requêtes
   * essaient de créer le même utilisateur simultanément.
   */
  dbUser = await prisma.user.upsert({
    where: {
      clerkId: clerkUser.id,
    },

    /**
     * Si une autre requête a créé l'utilisateur
     * entre-temps, on met simplement ses données à jour.
     */
    update: {
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },

    /**
     * Sinon, on crée normalement le nouvel utilisateur.
     */
    create: {
      clerkId: clerkUser.id,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      role,
    },
  });

  return dbUser;
}

/**
 * Vérifie que l'utilisateur actuel possède
 * les privilèges nécessaires pour accéder à l'administration.
 *
 * ADMIN et EDITOR sont autorisés.
 */
export async function requireAdmin() {
  const user = await getOrCreateCurrentUser();

  /**
   * Pas connecté
   */
  if (!user) {
    throw new Error("Non authentifié : veuillez vous connecter");
  }

  /**
   * ADMIN et EDITOR ont directement accès.
   */
  if (user.role === "ADMIN" || user.role === "EDITOR") {
    return user;
  }

  /**
   * Sécurité supplémentaire :
   * si l'email est dans SUPER_ADMIN_EMAILS,
   * on le transforme en ADMIN.
   */
  const email = user.email?.toLowerCase();

  const superAdminEmails = getSuperAdminEmails();

  if (email && superAdminEmails.includes(email)) {
    return await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        role: "ADMIN",
      },
    });
  }

  /**
   * Vérifier s'il existe réellement un administrateur humain.
   */
  const realAdminsCount = await prisma.user.count({
    where: {
      clerkId: {
        not: "system_church_admin",
      },
      role: "ADMIN",
    },
  });

  /**
   * S'il n'existe aucun ADMIN humain,
   * le premier utilisateur peut devenir ADMIN.
   */
  if (realAdminsCount === 0) {
    return await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        role: "ADMIN",
      },
    });
  }

  /**
   * L'utilisateur est authentifié,
   * mais n'a pas les permissions nécessaires.
   */
  throw new Error(
    "Accès refusé : privilèges administrateur requis"
  );
}

