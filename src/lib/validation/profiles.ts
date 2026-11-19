import { z } from "zod";

import { isAllowedImagePath } from "@/lib/security/images";
import {
  isSafeExternalSocialUrl,
  MAX_SOCIAL_URL_LENGTH,
  MAX_STUDENT_SOCIAL_LINKS,
  normalizeSocialUrlLines,
  splitSocialUrlLines,
} from "@/lib/social";

const optionalIdSchema = z.string().trim().max(30).optional().or(z.literal(""));

const optionalImagePathSchema = z
  .string()
  .trim()
  .max(2048, "URL gambar terlalu panjang.")
  .refine((value) => value.length === 0 || isAllowedImagePath(value), {
    message: "Gambar tidak valid. Unggah ulang gambar.",
  });

const requiredImagePathSchema = z
  .string()
  .trim()
  .min(1, "Foto wajib diunggah.")
  .max(2048, "URL gambar terlalu panjang.")
  .refine(isAllowedImagePath, {
    message: "Foto tidak valid. Unggah ulang gambar.",
  });

const classNameSchema = z
  .string()
  .trim()
  .min(2, "Nama kelas minimal 2 karakter.")
  .max(80, "Nama kelas maksimal 80 karakter.");

const taglineSchema = z
  .string()
  .trim()
  .max(120, "Tagline maksimal 120 karakter.");

const classDescriptionSchema = z
  .string()
  .trim()
  .max(1000, "Deskripsi maksimal 1000 karakter.");

const studentNameSchema = z
  .string()
  .trim()
  .min(2, "Nama siswa minimal 2 karakter.")
  .max(80, "Nama siswa maksimal 80 karakter.");

const studentRoleSchema = z
  .string()
  .trim()
  .max(80, "Peran maksimal 80 karakter.");

const studentBioSchema = z
  .string()
  .trim()
  .max(500, "Bio maksimal 500 karakter.");

const studentSocialLinksSchema = z
  .string()
  .max(
    MAX_STUDENT_SOCIAL_LINKS * (MAX_SOCIAL_URL_LENGTH + 1),
    "Tautan sosial terlalu panjang.",
  )
  .superRefine((value, ctx) => {
    const lines = splitSocialUrlLines(value);

    if (lines.length > MAX_STUDENT_SOCIAL_LINKS) {
      ctx.addIssue({
        code: "custom",
        message: `Maksimal ${MAX_STUDENT_SOCIAL_LINKS} tautan sosial.`,
      });
      return;
    }

    for (const line of lines) {
      if (line.length > MAX_SOCIAL_URL_LENGTH) {
        ctx.addIssue({
          code: "custom",
          message: "Satu tautan sosial terlalu panjang.",
        });
        continue;
      }

      if (!isSafeExternalSocialUrl(line)) {
        ctx.addIssue({
          code: "custom",
          message:
            "Gunakan URL HTTPS yang valid tanpa kredensial atau port khusus.",
        });
      }
    }
  })
  .transform((value) => normalizeSocialUrlLines(value).join("\n"));

export const classProfileFormSchema = z.object({
  className: classNameSchema,
  tagline: taglineSchema,
  description: classDescriptionSchema,
  photoPath: optionalImagePathSchema,
});

export const studentProfileFormSchema = z.object({
  studentId: optionalIdSchema,
  name: studentNameSchema,
  role: studentRoleSchema,
  bio: studentBioSchema,
  photoPath: requiredImagePathSchema,
  socialLinks: studentSocialLinksSchema,
  sortOrder: z.coerce
    .number()
    .int("Urutan harus berupa angka bulat.")
    .min(0, "Urutan minimal 0.")
    .max(999, "Urutan maksimal 999."),
  isVisible: z.boolean(),
});

export type ClassProfileFormValues = z.infer<typeof classProfileFormSchema>;
export type StudentProfileFormValues = z.infer<typeof studentProfileFormSchema>;
