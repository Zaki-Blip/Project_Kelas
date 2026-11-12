import { z } from "zod";

const MAX_REPORT_URL_LENGTH = 2048;

/**
 * Report links are only rendered as outbound anchors, but we still require a
 * clean HTTPS URL. Credentials, custom ports, and local hosts are rejected so
 * a stored link cannot masquerade as an internal address.
 */
export function isSafeReportUrl(value: string): boolean {
  const trimmed = value.trim();

  if (trimmed.length === 0 || trimmed.length > MAX_REPORT_URL_LENGTH) {
    return false;
  }

  try {
    const url = new URL(trimmed);

    if (
      url.protocol !== "https:" ||
      url.username.length > 0 ||
      url.password.length > 0 ||
      url.port.length > 0
    ) {
      return false;
    }

    const hostname = url.hostname.toLowerCase();

    return (
      hostname.includes(".") &&
      hostname !== "localhost" &&
      !hostname.endsWith(".localhost")
    );
  } catch {
    return false;
  }
}

export const pklSubmissionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Judul laporan minimal 5 karakter.")
    .max(160, "Judul laporan maksimal 160 karakter."),
  company: z
    .string()
    .trim()
    .min(2, "Tempat PKL minimal 2 karakter.")
    .max(120, "Tempat PKL maksimal 120 karakter."),
  summary: z
    .string()
    .trim()
    .min(20, "Ringkasan minimal 20 karakter.")
    .max(2000, "Ringkasan maksimal 2000 karakter."),
  reportUrl: z
    .string()
    .trim()
    .min(1, "Tautan laporan wajib diisi.")
    .max(MAX_REPORT_URL_LENGTH, "Tautan laporan terlalu panjang.")
    .refine(isSafeReportUrl, "Gunakan URL HTTPS yang valid tanpa port khusus."),
});

export const pklReviewSchema = z.object({
  submissionId: z.string().trim().min(1).max(30),
  status: z.enum(["SUBMITTED", "REVIEWED", "REVISION"]),
  reviewNote: z
    .string()
    .trim()
    .max(1000, "Catatan tinjauan maksimal 1000 karakter.")
    .optional()
    .default(""),
});

export const pklSubmissionIdSchema = z.string().trim().min(1).max(30);

export type PklSubmissionValues = z.infer<typeof pklSubmissionSchema>;
export type PklReviewValues = z.infer<typeof pklReviewSchema>;
