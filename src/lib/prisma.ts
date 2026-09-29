import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://user:password@localhost:5432/dummy";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
<<<<<<< HEAD
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
=======
    ...(process.env.DATABASE_URL ? {
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      }
    } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
>>>>>>> f11bf6dbf967340d9b7621042ca557224fb24f80
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;