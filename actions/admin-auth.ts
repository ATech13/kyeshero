"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function selfPromoteDevAdmin() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Cette action n'est disponible qu'en environnement de développement.");
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error("Non authentifié : veuillez vous connecter");
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress || null;

  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    create: {
      clerkId: clerkUser.id,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      role: "ADMIN",
    },
    update: {
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      role: "ADMIN",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/evenements");
  revalidatePath("/admin/audios");
  revalidatePath("/admin/videos");

  return { success: true, user };
}
