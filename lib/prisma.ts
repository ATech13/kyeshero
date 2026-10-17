import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    prismaSchemaVersion: string | undefined;
};

// Version de schéma incrémentée pour forcer le rechargement immédiat du client Prisma en mémoire
const CURRENT_SCHEMA_VERSION = "2026-10-17-likesCount-v3";

if (globalForPrisma.prismaSchemaVersion !== CURRENT_SCHEMA_VERSION) {
    if (globalForPrisma.prisma) {
        try {
            globalForPrisma.prisma.$disconnect();
        } catch {
            // Ignorer
        }
    }
    globalForPrisma.prisma = undefined;
    globalForPrisma.prismaSchemaVersion = CURRENT_SCHEMA_VERSION;
}

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}