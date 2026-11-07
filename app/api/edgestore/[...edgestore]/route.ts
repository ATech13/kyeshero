import { initEdgeStore } from "@edgestore/server";
import { createEdgeStoreNextHandler } from "@edgestore/server/adapters/next/app";

const es = initEdgeStore.create();

/**
 * Routeur EdgeStore principal de l'application
 * Configuré avec une limite de 150 Mo pour accueillir les fichiers audio volumineux (> 28 Mo)
 */
const edgeStoreRouter = es.router({
  publicFiles: es.fileBucket({
    maxSize: 1024 * 1024 * 150, // 150 Mo (largement suffisant pour les cultes et prédications de 2h)
  }),
});

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
});

export { handler as GET, handler as POST };

export type EdgeStoreRouter = typeof edgeStoreRouter;

