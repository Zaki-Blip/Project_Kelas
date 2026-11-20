import { z } from "zod";

export const feedbackCategoryValues = [
  "saran",
  "masukan",
  "bug",
  "lainnya",
] as const;

export type FeedbackCategory = (typeof feedbackCategoryValues)[number];

export const feedbackCategoryLabels: Record<FeedbackCategory, string> = {
  saran: "Saran",
  masukan: "Masukan tampilan",
  bug: "Laporan bug",
  lainnya: "Lainnya",
};

export const feedbackSchema = z.object({
  category: z
    .enum(feedbackCategoryValues, "Pilih jenis tanggapan yang valid.")
    .default("saran"),
  message: z
    .string()
    .trim()
    .min(10, "Tanggapan minimal 10 karakter.")
    .max(1000, "Tanggapan maksimal 1000 karakter."),
});

export type FeedbackValues = z.infer<typeof feedbackSchema>;
