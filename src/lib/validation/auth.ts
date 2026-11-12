import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter.")
  .max(128, "Password maksimal 128 karakter.")
  .regex(/[A-Za-z]/, "Password harus mengandung huruf.")
  .regex(/[0-9]/, "Password harus mengandung angka.");

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email atau username wajib diisi.")
    .max(254, "Email atau username terlalu panjang.")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password wajib diisi.")
    .max(128, "Password maksimal 128 karakter."),
  next: z.string().max(2048).optional(),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Nama lengkap minimal 2 karakter.")
      .max(80, "Nama lengkap maksimal 80 karakter."),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Username minimal 3 karakter.")
      .max(30, "Username maksimal 30 karakter.")
      .regex(/^[a-z0-9_]+$/, "Username hanya boleh berisi huruf, angka, dan garis bawah."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254, "Email terlalu panjang.")
      .email("Format email tidak valid."),
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, "Konfirmasi password wajib diisi.")
      .max(128, "Konfirmasi password maksimal 128 karakter."),
    next: z.string().max(2048).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
