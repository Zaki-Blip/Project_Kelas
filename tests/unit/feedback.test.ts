import { describe, expect, it } from "vitest";

import { getFormspreeEndpoint } from "@/lib/feedback/formspree";
import { feedbackSchema } from "@/lib/validation/feedback";

describe("feedbackSchema", () => {
  it("accepts and trims a valid feedback message", () => {
    const result = feedbackSchema.safeParse({
      category: "saran",
      message: "  Tampilan beranda sudah bagus.  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.category).toBe("saran");
      expect(result.data.message).toBe("Tampilan beranda sudah bagus.");
    }
  });

  it("defaults the category to saran", () => {
    const result = feedbackSchema.safeParse({
      message: "Tolong tambahkan filter pencarian yang lebih lengkap.",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.category).toBe("saran");
    }
  });

  it("rejects short and long messages", () => {
    const short = feedbackSchema.safeParse({
      category: "saran",
      message: "pendek",
    });
    const long = feedbackSchema.safeParse({
      category: "saran",
      message: "a".repeat(1001),
    });

    expect(short.success).toBe(false);
    expect(long.success).toBe(false);

    if (!short.success) {
      expect(short.error.flatten().fieldErrors.message).toContain(
        "Tanggapan minimal 10 karakter.",
      );
    }

    if (!long.success) {
      expect(long.error.flatten().fieldErrors.message).toContain(
        "Tanggapan maksimal 1000 karakter.",
      );
    }
  });

  it("rejects unknown categories", () => {
    const result = feedbackSchema.safeParse({
      category: "keluhan",
      message: "Tolong periksa kembali halaman galeri.",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.category).toContain(
        "Pilih jenis tanggapan yang valid.",
      );
    }
  });
});

describe("getFormspreeEndpoint", () => {
  it("accepts official Formspree HTTPS endpoints", () => {
    expect(getFormspreeEndpoint("https://formspree.io/f/abcd1234")).toBe(
      "https://formspree.io/f/abcd1234",
    );
    expect(
      getFormspreeEndpoint("  https://www.formspree.io/f/abcd1234/  "),
    ).toBe("https://www.formspree.io/f/abcd1234/");
  });

  it("rejects insecure, lookalike, credentialed, and malformed endpoints", () => {
    const invalid = [
      undefined,
      "",
      "   ",
      "http://formspree.io/f/abcd1234",
      "https://evil.com/f/abcd1234",
      "https://formspree.io.evil.com/f/abcd1234",
      "https://user:pass@formspree.io/f/abcd1234",
      "https://formspree.io:8443/f/abcd1234",
      "https://formspree.io/",
      "https://formspree.io/f/",
      "javascript:alert(1)",
    ];

    for (const value of invalid) {
      expect(getFormspreeEndpoint(value)).toBeNull();
    }
  });
});
