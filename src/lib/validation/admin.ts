import { z } from "zod";

import type { AdminProjectFilters } from "@/lib/admin/types";
import { ADMIN_PROJECT_IMAGE_LIMIT } from "@/lib/admin/constants";
import { isAllowedImagePath } from "@/lib/security/images";

const adminIdSchema = z.string().trim().min(1).max(30);
const optionalIdSchema = z.string().trim().max(30).optional().or(z.literal(""));
const categoryIdSchema = z
  .string()
  .trim()
  .min(1, "Kategori wajib dipilih.")
  .max(30);
const creatorIdSchema = z
  .string()
  .trim()
  .min(1, "Creator wajib dipilih.")
  .max(30);
const technologyIdSchema = z
  .string()
  .trim()
  .min(1, "Teknologi tidak valid.")
  .max(30);
const memberIdSchema = z
  .string()
  .trim()
  .min(1, "Anggota tim tidak valid.")
  .max(30);
const adminPageSchema = z.coerce.number().int().min(1).max(10_000);
const adminSearchSchema = z.string().trim().max(100);

const projectSlugSchema = z
  .string()
  .trim()
  .min(1, "Slug wajib diisi.")
  .max(160, "Slug maksimal 160 karakter.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Gunakan huruf kecil, angka, dan tanda hubung.");

const taxonomySlugSchema = z
  .string()
  .trim()
  .min(1, "Slug wajib diisi.")
  .max(80, "Slug maksimal 80 karakter.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Gunakan huruf kecil, angka, dan tanda hubung.");

const imagePathSchema = z
  .string()
  .trim()
  .max(2048, "URL gambar terlalu panjang.")
  .refine((value) => value.length === 0 || isAllowedImagePath(value), {
    message: "Gambar tidak valid. Unggah ulang gambar.",
  });

const projectImageSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URL gambar wajib diisi.")
    .max(2048, "URL gambar terlalu panjang.")
    .refine(isAllowedImagePath, {
      message: "Screenshot tidak valid. Unggah ulang gambar.",
    }),
  caption: z.string().trim().max(200, "Caption maksimal 200 karakter."),
  sortOrder: z.coerce.number().int().min(0).max(999).optional().default(0),
});

export const projectFormSchema = z.object({
  projectId: optionalIdSchema,
  title: z
    .string()
    .trim()
    .min(3, "Judul minimal 3 karakter.")
    .max(160, "Judul maksimal 160 karakter."),
  slug: projectSlugSchema,
  summary: z
    .string()
    .trim()
    .min(10, "Ringkasan minimal 10 karakter.")
    .max(280, "Ringkasan maksimal 280 karakter."),
  description: z
    .string()
    .trim()
    .min(20, "Deskripsi minimal 20 karakter.")
    .max(20_000, "Deskripsi terlalu panjang."),
  categoryId: categoryIdSchema,
  creatorId: creatorIdSchema,
  technologyIds: z.array(technologyIdSchema).max(20, "Terlalu banyak teknologi."),
  memberIds: z.array(memberIdSchema).max(50, "Terlalu banyak anggota tim."),
  githubUrl: z.string().trim().max(2048, "URL GitHub terlalu panjang."),
  previewUrl: z.string().trim().max(2048, "URL preview terlalu panjang."),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  thumbnailPath: imagePathSchema,
  images: z
    .array(projectImageSchema)
    .max(ADMIN_PROJECT_IMAGE_LIMIT, "Maksimal 6 screenshot."),
});

export const taxonomyFormSchema = z.object({
  id: optionalIdSchema,
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(60, "Nama maksimal 60 karakter."),
  slug: z.string().trim().max(80, "Slug maksimal 80 karakter."),
});

export const taxonomySlugValueSchema = taxonomySlugSchema;

export function parseAdminProjectSearchParams(
  params: Record<string, string | string[] | undefined>,
): AdminProjectFilters {
  const q = firstParam(params.q);
  const page = firstParam(params.page);
  const parsedQ = adminSearchSchema.safeParse(q ?? "");
  const parsedPage = adminPageSchema.safeParse(page);

  return {
    q: parsedQ.success ? parsedQ.data : "",
    page: parsedPage.success ? parsedPage.data : 1,
  };
}

export function parseAdminId(value: string): string | null {
  const parsed = adminIdSchema.safeParse(value);

  return parsed.success ? parsed.data : null;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
