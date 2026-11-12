import "server-only";

import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";
import { createPrismaAdapter } from "@/lib/prisma-adapter";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter: createPrismaAdapter(env.DATABASE_URL),
    log: ["warn", "error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
