import "server-only";

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  APP_URL: z
    .string()
    .url("APP_URL must be a valid URL.")
    .refine((value) => {
      if (process.env.NODE_ENV !== "production" || value.startsWith("https://")) {
        return true;
      }

      try {
        const { hostname } = new URL(value);

        return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
      } catch {
        return false;
      }
    }, "APP_URL must use https in production (localhost is allowed for local builds)."),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters."),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  FORMSPREE_ENDPOINT: z.string().optional(),
  PREVIEW_ALLOWED_HOSTS: z.string().default("*.vercel.app"),
});

const parsed = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  APP_URL: process.env.APP_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  FORMSPREE_ENDPOINT: process.env.FORMSPREE_ENDPOINT,
  PREVIEW_ALLOWED_HOSTS: process.env.PREVIEW_ALLOWED_HOSTS,
});

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables. Check .env.example.");
}

export const env = parsed.data;
