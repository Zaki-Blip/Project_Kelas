import { z } from "zod";

import type { GalleryFilters } from "@/lib/projects/types";

const qSchema = z.string().trim().max(100);
const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const projectSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const pageSchema = z.coerce.number().int().min(1).max(10_000);

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseField<T>(schema: z.ZodType<T>, value: string | undefined): T | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsed = schema.safeParse(value);

  return parsed.success ? parsed.data : undefined;
}

export function parseProjectSlug(value: string): string | null {
  const parsed = projectSlugSchema.safeParse(value);

  return parsed.success ? parsed.data : null;
}

export function parseGallerySearchParams(
  params: Record<string, string | string[] | undefined>,
): GalleryFilters {
  const q = parseField(qSchema, firstParam(params.q)) ?? "";
  const category = parseField(slugSchema, firstParam(params.category));
  const tech = parseField(slugSchema, firstParam(params.tech));
  const page = parseField(pageSchema, firstParam(params.page)) ?? 1;

  return { q, category, tech, page };
}
