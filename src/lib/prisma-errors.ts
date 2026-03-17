import { Prisma } from "@prisma/client";

export function getPrismaConnectionErrorMessage(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P1001") {
      return "Database server is currently unreachable.";
    }

    if (error.code === "P2037") {
      return "Database connection limit reached. Please retry in a moment.";
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return "Database client could not initialize.";
  }

  return null;
}