import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Les routes administratives et mutations réservées nécessitent une authentification
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const session = await auth();
    if (!session.userId) {
      const signInUrl = new URL("/sign-in", req.url);
      const returnUrl = req.nextUrl.pathname + req.nextUrl.search;
      signInUrl.searchParams.set("redirect_url", returnUrl);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    // Ignorer les fichiers statiques Next.js et les assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Toujours exécuter pour les routes API
    "/(api|trpc)(.*)",
  ],
};
