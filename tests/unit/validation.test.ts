import { describe, expect, it } from "vitest";

import {
  loginSchema,
  registerSchema,
} from "@/lib/validation/auth";
import {
  parseAdminId,
  parseAdminProjectSearchParams,
  projectFormSchema,
  taxonomyFormSchema,
  taxonomySlugValueSchema,
} from "@/lib/validation/admin";
import {
  isSafeReportUrl,
  pklReviewSchema,
  pklSubmissionSchema,
} from "@/lib/validation/pkl";
import {
  classProfileFormSchema,
  studentProfileFormSchema,
} from "@/lib/validation/profiles";
import {
  parseGallerySearchParams,
  parseProjectSlug,
} from "@/lib/validation/projects";

function validProject() {
  return {
    projectId: "",
    title: "Kasir Kita",
    slug: "kasir-kita",
    summary: "Aplikasi kasir sederhana untuk UMKM.",
    description:
      "Aplikasi kasir sederhana yang membantu UMKM mencatat transaksi harian.",
    categoryId: "cat_1",
    creatorId: "user_1",
    technologyIds: ["tech_1", "tech_2"],
    memberIds: ["user_2"],
    githubUrl: "https://github.com/example/kasir-kita",
    previewUrl: "https://kasir-kita.vercel.app",
    status: "PUBLISHED" as const,
    thumbnailPath: "/seed/thumbnails/kasir-kita.png",
    images: [
      {
        url: "/seed/screenshots/kasir-kita-1.png",
        caption: "Dashboard",
        sortOrder: 1,
      },
    ],
  };
}

describe("loginSchema", () => {
  it("normalizes the identifier and accepts valid input", () => {
    const result = loginSchema.safeParse({
      identifier: "  Budi  ",
      password: "secret",
      next: "/dashboard",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.identifier).toBe("budi");
      expect(result.data.password).toBe("secret");
      expect(result.data.next).toBe("/dashboard");
    }
  });

  it("requires a non-empty identifier", () => {
    const result = loginSchema.safeParse({ identifier: "   ", password: "x" });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.identifier).toContain(
        "Email atau username wajib diisi.",
      );
    }
  });

  it("rejects an identifier longer than 254 characters", () => {
    const result = loginSchema.safeParse({
      identifier: "a".repeat(255),
      password: "x",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.identifier).toContain(
        "Email atau username terlalu panjang.",
      );
    }
  });

  it("requires a password and caps it at 128 characters", () => {
    const missing = loginSchema.safeParse({ identifier: "budi", password: "" });
    const tooLong = loginSchema.safeParse({
      identifier: "budi",
      password: "a".repeat(129),
    });

    expect(missing.success).toBe(false);
    expect(tooLong.success).toBe(false);

    if (!missing.success) {
      expect(missing.error.flatten().fieldErrors.password).toContain(
        "Password wajib diisi.",
      );
    }

    if (!tooLong.success) {
      expect(tooLong.error.flatten().fieldErrors.password).toContain(
        "Password maksimal 128 karakter.",
      );
    }
  });

  it("rejects a next value longer than 2048 characters", () => {
    const result = loginSchema.safeParse({
      identifier: "budi",
      password: "secret",
      next: "/" + "a".repeat(2048),
    });

    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  function validRegister() {
    return {
      fullName: "Budi Santoso",
      username: "Budi_01",
      email: "Budi@Example.com",
      password: "Test12345",
      confirmPassword: "Test12345",
    };
  }

  it("normalizes username and email", () => {
    const result = registerSchema.safeParse(validRegister());

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.username).toBe("budi_01");
      expect(result.data.email).toBe("budi@example.com");
    }
  });

  it("validates the full name length", () => {
    const short = registerSchema.safeParse({
      ...validRegister(),
      fullName: " A ",
    });
    const long = registerSchema.safeParse({
      ...validRegister(),
      fullName: "a".repeat(81),
    });

    expect(short.success).toBe(false);
    expect(long.success).toBe(false);

    if (!short.success) {
      expect(short.error.flatten().fieldErrors.fullName).toContain(
        "Nama lengkap minimal 2 karakter.",
      );
    }

    if (!long.success) {
      expect(long.error.flatten().fieldErrors.fullName).toContain(
        "Nama lengkap maksimal 80 karakter.",
      );
    }
  });

  it("validates the username shape and length", () => {
    const short = registerSchema.safeParse({
      ...validRegister(),
      username: "ab",
    });
    const long = registerSchema.safeParse({
      ...validRegister(),
      username: "a".repeat(31),
    });
    const invalid = registerSchema.safeParse({
      ...validRegister(),
      username: "budi santoso",
    });

    expect(short.success).toBe(false);
    expect(long.success).toBe(false);
    expect(invalid.success).toBe(false);

    if (!short.success) {
      expect(short.error.flatten().fieldErrors.username).toContain(
        "Username minimal 3 karakter.",
      );
    }

    if (!long.success) {
      expect(long.error.flatten().fieldErrors.username).toContain(
        "Username maksimal 30 karakter.",
      );
    }

    if (!invalid.success) {
      expect(invalid.error.flatten().fieldErrors.username).toContain(
        "Username hanya boleh berisi huruf, angka, dan garis bawah.",
      );
    }
  });

  it("accepts uppercase usernames after normalization", () => {
    const result = registerSchema.safeParse({
      ...validRegister(),
      username: "Budi",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.username).toBe("budi");
    }
  });

  it("validates the email format and length", () => {
    const invalid = registerSchema.safeParse({
      ...validRegister(),
      email: "not-an-email",
    });
    const tooLong = registerSchema.safeParse({
      ...validRegister(),
      email: `${"a".repeat(250)}@example.com`,
    });

    expect(invalid.success).toBe(false);
    expect(tooLong.success).toBe(false);

    if (!invalid.success) {
      expect(invalid.error.flatten().fieldErrors.email).toContain(
        "Format email tidak valid.",
      );
    }

    if (!tooLong.success) {
      expect(tooLong.error.flatten().fieldErrors.email).toContain(
        "Email terlalu panjang.",
      );
    }
  });

  it("requires 8-128 characters with a letter and a number", () => {
    const cases = [
      { password: "Ab1", message: "Password minimal 8 karakter." },
      {
        password: `a1${"x".repeat(127)}`,
        message: "Password maksimal 128 karakter.",
      },
      { password: "12345678", message: "Password harus mengandung huruf." },
      { password: "abcdefgh", message: "Password harus mengandung angka." },
    ];

    for (const { password, message } of cases) {
      const result = registerSchema.safeParse({
        ...validRegister(),
        password,
        confirmPassword: password,
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toContain(message);
      }
    }
  });

  it("requires the confirmation to match", () => {
    const result = registerSchema.safeParse({
      ...validRegister(),
      confirmPassword: "Different123",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toContain(
        "Konfirmasi password tidak cocok.",
      );
    }
  });

  it("requires a confirmation and caps it at 128 characters", () => {
    const missing = registerSchema.safeParse({
      ...validRegister(),
      confirmPassword: "",
    });
    const tooLong = registerSchema.safeParse({
      ...validRegister(),
      confirmPassword: "a".repeat(129),
    });

    expect(missing.success).toBe(false);
    expect(tooLong.success).toBe(false);

    if (!missing.success) {
      expect(missing.error.flatten().fieldErrors.confirmPassword).toContain(
        "Konfirmasi password wajib diisi.",
      );
    }

    if (!tooLong.success) {
      expect(tooLong.error.flatten().fieldErrors.confirmPassword).toContain(
        "Konfirmasi password maksimal 128 karakter.",
      );
    }
  });
});

describe("project slug validation", () => {
  it("accepts lowercase slugs with single hyphens", () => {
    expect(parseProjectSlug("kasirkita")).toBe("kasirkita");
    expect(parseProjectSlug("  kasir-kita  ")).toBe("kasir-kita");
    expect(parseProjectSlug("kasir-kita-2")).toBe("kasir-kita-2");
    expect(parseProjectSlug("a".repeat(160))).toBe("a".repeat(160));
  });

  it("rejects unsafe or malformed slugs", () => {
    const invalid = [
      "Kasir-Kita",
      "kasir kita",
      "-kasir",
      "kasir-",
      "kasir--kita",
      "kasir_kita",
      "kasir/kita",
      "",
      "a".repeat(161),
    ];

    for (const value of invalid) {
      expect(parseProjectSlug(value)).toBeNull();
    }
  });
});

describe("parseGallerySearchParams", () => {
  it("returns defaults for empty params", () => {
    expect(parseGallerySearchParams({})).toEqual({
      q: "",
      category: undefined,
      tech: undefined,
      page: 1,
    });
  });

  it("parses and normalizes valid filters", () => {
    expect(
      parseGallerySearchParams({
        q: "  kasir  ",
        category: "web-app",
        tech: "next-js",
        page: "2",
      }),
    ).toEqual({
      q: "kasir",
      category: "web-app",
      tech: "next-js",
      page: 2,
    });
  });

  it("uses the first value when a param is repeated", () => {
    expect(
      parseGallerySearchParams({
        q: ["first", "second"],
        category: ["web-app", "mobile"],
        tech: ["next-js"],
        page: ["3", "4"],
      }),
    ).toEqual({
      q: "first",
      category: "web-app",
      tech: "next-js",
      page: 3,
    });
  });

  it("drops invalid filters and falls back to page 1", () => {
    expect(
      parseGallerySearchParams({
        q: "x".repeat(101),
        category: "Bad Slug",
        tech: "UPPER",
        page: "0",
      }),
    ).toEqual({
      q: "",
      category: undefined,
      tech: undefined,
      page: 1,
    });
  });

  it("rejects out-of-range or non-integer pages", () => {
    expect(parseGallerySearchParams({ page: "10001" }).page).toBe(1);
    expect(parseGallerySearchParams({ page: "1.5" }).page).toBe(1);
    expect(parseGallerySearchParams({ page: "abc" }).page).toBe(1);
    expect(parseGallerySearchParams({ page: "10000" }).page).toBe(10000);
  });

  it("trims a whitespace-only search to an empty string", () => {
    expect(parseGallerySearchParams({ q: "   " }).q).toBe("");
  });
});

describe("projectFormSchema", () => {
  it("accepts a complete valid project", () => {
    const result = projectFormSchema.safeParse(validProject());

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.thumbnailPath).toBe(
        "/seed/thumbnails/kasir-kita.png",
      );
      expect(result.data.images).toHaveLength(1);
    }
  });

  it("accepts an empty thumbnail and no screenshots", () => {
    const result = projectFormSchema.safeParse({
      ...validProject(),
      thumbnailPath: "",
      images: [],
    });

    expect(result.success).toBe(true);
  });

  it("accepts seed and Vercel Blob image paths", () => {
    const paths = [
      "/seed/thumbnails/kasir-kita.png",
      "/seed/thumbnails/kasir-kita.PNG",
      "/seed/screenshots/kasir-kita-1.jpg",
      "/seed/screenshots/kasir-kita-1.jpeg",
      "/seed/screenshots/kasir-kita-1.webp",
      "/seed/profiles/budi.png",
      "https://abc123.public.blob.vercel-storage.com/projects/a/b.png",
    ];

    for (const thumbnailPath of paths) {
      const result = projectFormSchema.safeParse({
        ...validProject(),
        thumbnailPath,
      });

      expect(result.success).toBe(true);
    }
  });

  it("rejects image paths outside the allowlist", () => {
    const paths = [
      "/seed/thumbnails/foo_bar.png",
      "/seed/thumbnails/foo.gif",
      "/seed/thumbnails/../foo.png",
      "/seed/other/foo.png",
      "http://abc123.public.blob.vercel-storage.com/projects/a/b.png",
      "https://abc123.public.blob.vercel-storage.com.evil.com/a.png",
      "https://evil.com/a.png",
      "javascript:alert(1)",
    ];

    for (const thumbnailPath of paths) {
      const result = projectFormSchema.safeParse({
        ...validProject(),
        thumbnailPath,
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.flatten().fieldErrors.thumbnailPath).toContain(
          "Gambar tidak valid. Unggah ulang gambar.",
        );
      }
    }
  });

  it("validates the title, summary, and description lengths", () => {
    const cases = [
      {
        input: { title: "ab" },
        field: "title" as const,
        message: "Judul minimal 3 karakter.",
      },
      {
        input: { title: "a".repeat(161) },
        field: "title" as const,
        message: "Judul maksimal 160 karakter.",
      },
      {
        input: { summary: "too short" },
        field: "summary" as const,
        message: "Ringkasan minimal 10 karakter.",
      },
      {
        input: { summary: "a".repeat(281) },
        field: "summary" as const,
        message: "Ringkasan maksimal 280 karakter.",
      },
      {
        input: { description: "a".repeat(19) },
        field: "description" as const,
        message: "Deskripsi minimal 20 karakter.",
      },
      {
        input: { description: "a".repeat(20_001) },
        field: "description" as const,
        message: "Deskripsi terlalu panjang.",
      },
    ];

    for (const { input, field, message } of cases) {
      const result = projectFormSchema.safeParse({
        ...validProject(),
        ...input,
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.flatten().fieldErrors[field]).toContain(message);
      }
    }
  });

  it("requires a category, creator, technology, and member ids", () => {
    const result = projectFormSchema.safeParse({
      ...validProject(),
      categoryId: "",
      creatorId: "",
      technologyIds: [""],
      memberIds: [""],
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      expect(errors.categoryId).toContain("Kategori wajib dipilih.");
      expect(errors.creatorId).toContain("Creator wajib dipilih.");
      expect(errors.technologyIds).toContain("Teknologi tidak valid.");
      expect(errors.memberIds).toContain("Anggota tim tidak valid.");
    }
  });

  it("caps technology and member selections", () => {
    const result = projectFormSchema.safeParse({
      ...validProject(),
      technologyIds: Array.from({ length: 21 }, (_, index) => `tech_${index}`),
      memberIds: Array.from({ length: 51 }, (_, index) => `user_${index}`),
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      expect(errors.technologyIds).toContain("Terlalu banyak teknologi.");
      expect(errors.memberIds).toContain("Terlalu banyak anggota tim.");
    }
  });

  it("validates the slug and status", () => {
    const slug = projectFormSchema.safeParse({
      ...validProject(),
      slug: "Kasir Kita",
    });
    const status = projectFormSchema.safeParse({
      ...validProject(),
      status: "ARCHIVED",
    });

    expect(slug.success).toBe(false);
    expect(status.success).toBe(false);

    if (!slug.success) {
      expect(slug.error.flatten().fieldErrors.slug).toContain(
        "Gunakan huruf kecil, angka, dan tanda hubung.",
      );
    }
  });

  it("caps GitHub and preview URLs at 2048 characters", () => {
    const github = projectFormSchema.safeParse({
      ...validProject(),
      githubUrl: `https://github.com/${"a".repeat(2048)}`,
    });
    const preview = projectFormSchema.safeParse({
      ...validProject(),
      previewUrl: `https://${"a".repeat(2048)}.vercel.app`,
    });

    expect(github.success).toBe(false);
    expect(preview.success).toBe(false);

    if (!github.success) {
      expect(github.error.flatten().fieldErrors.githubUrl).toContain(
        "URL GitHub terlalu panjang.",
      );
    }

    if (!preview.success) {
      expect(preview.error.flatten().fieldErrors.previewUrl).toContain(
        "URL preview terlalu panjang.",
      );
    }
  });

  it("defaults the screenshot sort order and validates captions", () => {
    const defaultOrder = projectFormSchema.safeParse({
      ...validProject(),
      images: [
        { url: "/seed/screenshots/kasir-kita-1.png", caption: "" },
      ],
    });
    const longCaption = projectFormSchema.safeParse({
      ...validProject(),
      images: [
        {
          url: "/seed/screenshots/kasir-kita-1.png",
          caption: "a".repeat(201),
        },
      ],
    });

    expect(defaultOrder.success).toBe(true);
    expect(longCaption.success).toBe(false);

    if (defaultOrder.success) {
      expect(defaultOrder.data.images[0]?.sortOrder).toBe(0);
    }

    if (!longCaption.success) {
      expect(longCaption.error.flatten().fieldErrors.images).toContain(
        "Caption maksimal 200 karakter.",
      );
    }
  });

  it("caps screenshots at six and rejects invalid screenshot URLs", () => {
    const tooMany = projectFormSchema.safeParse({
      ...validProject(),
      images: Array.from({ length: 7 }, (_, index) => ({
        url: `/seed/screenshots/kasir-kita-${index + 1}.png`,
        caption: "",
      })),
    });
    const invalidUrl = projectFormSchema.safeParse({
      ...validProject(),
      images: [{ url: "https://evil.com/screenshot.png", caption: "" }],
    });

    expect(tooMany.success).toBe(false);
    expect(invalidUrl.success).toBe(false);

    if (!tooMany.success) {
      expect(tooMany.error.flatten().fieldErrors.images).toContain(
        "Maksimal 6 screenshot.",
      );
    }

    if (!invalidUrl.success) {
      expect(invalidUrl.error.flatten().fieldErrors.images).toContain(
        "Screenshot tidak valid. Unggah ulang gambar.",
      );
    }
  });
});

describe("taxonomy validation", () => {
  it("accepts a valid taxonomy form", () => {
    const result = taxonomyFormSchema.safeParse({
      id: "",
      name: "Web App",
      slug: "web-app",
    });

    expect(result.success).toBe(true);
  });

  it("validates the taxonomy name and slug length", () => {
    const shortName = taxonomyFormSchema.safeParse({
      id: "",
      name: " A ",
      slug: "web-app",
    });
    const longName = taxonomyFormSchema.safeParse({
      id: "",
      name: "a".repeat(61),
      slug: "web-app",
    });
    const longSlug = taxonomyFormSchema.safeParse({
      id: "",
      name: "Web App",
      slug: "a".repeat(81),
    });

    expect(shortName.success).toBe(false);
    expect(longName.success).toBe(false);
    expect(longSlug.success).toBe(false);

    if (!shortName.success) {
      expect(shortName.error.flatten().fieldErrors.name).toContain(
        "Nama minimal 2 karakter.",
      );
    }

    if (!longName.success) {
      expect(longName.error.flatten().fieldErrors.name).toContain(
        "Nama maksimal 60 karakter.",
      );
    }

    if (!longSlug.success) {
      expect(longSlug.error.flatten().fieldErrors.slug).toContain(
        "Slug maksimal 80 karakter.",
      );
    }
  });

  it("allows an empty form slug but rejects an invalid slug value", () => {
    expect(
      taxonomyFormSchema.safeParse({
        id: "",
        name: "Web App",
        slug: "",
      }).success,
    ).toBe(true);

    expect(taxonomySlugValueSchema.safeParse("web-app").success).toBe(true);
    expect(taxonomySlugValueSchema.safeParse("next-js").success).toBe(true);

    for (const value of [
      "",
      "Web App",
      "-web",
      "web-",
      "web--app",
      "web_app",
      "a".repeat(81),
    ]) {
      expect(taxonomySlugValueSchema.safeParse(value).success).toBe(false);
    }
  });
});

describe("parseAdminProjectSearchParams", () => {
  it("returns defaults for empty params", () => {
    expect(parseAdminProjectSearchParams({})).toEqual({ q: "", page: 1 });
  });

  it("parses and trims valid filters", () => {
    expect(
      parseAdminProjectSearchParams({ q: "  kasir  ", page: "2" }),
    ).toEqual({ q: "kasir", page: 2 });
  });

  it("uses the first value when a param is repeated", () => {
    expect(
      parseAdminProjectSearchParams({
        q: ["kasir", "other"],
        page: ["3", "4"],
      }),
    ).toEqual({ q: "kasir", page: 3 });
  });

  it("drops invalid values and falls back to page 1", () => {
    expect(
      parseAdminProjectSearchParams({
        q: "x".repeat(101),
        page: "0",
      }),
    ).toEqual({ q: "", page: 1 });

    expect(parseAdminProjectSearchParams({ page: "10001" })).toEqual({
      q: "",
      page: 1,
    });
    expect(parseAdminProjectSearchParams({ page: "abc" })).toEqual({
      q: "",
      page: 1,
    });
    expect(parseAdminProjectSearchParams({ page: "1.5" })).toEqual({
      q: "",
      page: 1,
    });
  });

  it("accepts the maximum search and page values", () => {
    expect(
      parseAdminProjectSearchParams({
        q: "x".repeat(100),
        page: "10000",
      }),
    ).toEqual({ q: "x".repeat(100), page: 10000 });
  });

  it("trims a whitespace-only search to an empty string", () => {
    expect(parseAdminProjectSearchParams({ q: "   " })).toEqual({
      q: "",
      page: 1,
    });
  });
});

describe("parseAdminId", () => {
  it("accepts and trims ids up to 30 characters", () => {
    expect(parseAdminId("abc")).toBe("abc");
    expect(parseAdminId("  abc  ")).toBe("abc");
    expect(parseAdminId("a".repeat(30))).toBe("a".repeat(30));
  });

  it("rejects empty, whitespace-only, or overlong ids", () => {
    expect(parseAdminId("")).toBeNull();
    expect(parseAdminId("   ")).toBeNull();
    expect(parseAdminId("a".repeat(31))).toBeNull();
  });
});

describe("isSafeReportUrl", () => {
  it("accepts clean HTTPS report links", () => {
    expect(
      isSafeReportUrl("https://drive.google.com/file/d/abc/view"),
    ).toBe(true);
    expect(isSafeReportUrl("https://example.com/laporan-pkl.pdf")).toBe(true);
    expect(isSafeReportUrl("  https://onedrive.live.com/report  ")).toBe(true);
    expect(isSafeReportUrl("https://example.com:443/laporan.pdf")).toBe(true);
  });

  it("rejects non-HTTPS, credentialed, or custom-port URLs", () => {
    const invalid = [
      "http://example.com/laporan.pdf",
      "https://user:pass@example.com/laporan.pdf",
      "https://example.com:8443/laporan.pdf",
      "javascript:alert(1)",
      "data:text/html,hello",
      "",
    ];

    for (const value of invalid) {
      expect(isSafeReportUrl(value)).toBe(false);
    }
  });

  it("rejects local hosts and hostnames without a dot", () => {
    expect(isSafeReportUrl("https://localhost/laporan.pdf")).toBe(false);
    expect(isSafeReportUrl("https://app.localhost/laporan.pdf")).toBe(false);
    expect(isSafeReportUrl("https://internal/laporan.pdf")).toBe(false);
  });

  it("rejects URLs longer than 2048 characters", () => {
    expect(
      isSafeReportUrl(`https://example.com/${"a".repeat(2048)}`),
    ).toBe(false);
  });
});

describe("pklSubmissionSchema", () => {
  function validSubmission() {
    return {
      title: "Laporan PKL di PT Contoh Teknologi",
      company: "PT Contoh Teknologi",
      summary:
        "Selama PKL saya mengerjakan modul administrasi dan membantu pengujian aplikasi.",
      reportUrl: "https://drive.google.com/file/d/abc/view",
    };
  }

  it("accepts and trims a valid submission", () => {
    const result = pklSubmissionSchema.safeParse({
      title: "  Laporan PKL di PT Contoh Teknologi  ",
      company: "  PT Contoh Teknologi  ",
      summary: `  ${validSubmission().summary}  `,
      reportUrl: "  https://drive.google.com/file/d/abc/view  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.title).toBe("Laporan PKL di PT Contoh Teknologi");
      expect(result.data.company).toBe("PT Contoh Teknologi");
      expect(result.data.reportUrl).toBe(
        "https://drive.google.com/file/d/abc/view",
      );
    }
  });

  it("validates title, company, and summary lengths", () => {
    const cases = [
      {
        input: { title: "PKL" },
        field: "title" as const,
        message: "Judul laporan minimal 5 karakter.",
      },
      {
        input: { title: "a".repeat(161) },
        field: "title" as const,
        message: "Judul laporan maksimal 160 karakter.",
      },
      {
        input: { company: "A" },
        field: "company" as const,
        message: "Tempat PKL minimal 2 karakter.",
      },
      {
        input: { company: "a".repeat(121) },
        field: "company" as const,
        message: "Tempat PKL maksimal 120 karakter.",
      },
      {
        input: { summary: "terlalu pendek" },
        field: "summary" as const,
        message: "Ringkasan minimal 20 karakter.",
      },
      {
        input: { summary: "a".repeat(2001) },
        field: "summary" as const,
        message: "Ringkasan maksimal 2000 karakter.",
      },
    ];

    for (const { input, field, message } of cases) {
      const result = pklSubmissionSchema.safeParse({
        ...validSubmission(),
        ...input,
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.flatten().fieldErrors[field]).toContain(message);
      }
    }
  });

  it("rejects an unsafe report URL", () => {
    const result = pklSubmissionSchema.safeParse({
      ...validSubmission(),
      reportUrl: "http://example.com/laporan.pdf",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.reportUrl).toContain(
        "Gunakan URL HTTPS yang valid tanpa port khusus.",
      );
    }
  });
});

describe("classProfileFormSchema", () => {
  function validClassProfile() {
    return {
      className: "XII RPL 1",
      tagline: "Kelas yang bikin ide jadi karya.",
      description:
        "Kami belajar membangun aplikasi, bekerja dalam tim, dan menyajikan karya.",
      photoPath: "/seed/profiles/class.png",
    };
  }

  it("accepts a complete class profile and trims values", () => {
    const result = classProfileFormSchema.safeParse({
      ...validClassProfile(),
      className: "  XII RPL 1  ",
      tagline: "  Kelas yang bikin ide jadi karya.  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.className).toBe("XII RPL 1");
      expect(result.data.tagline).toBe("Kelas yang bikin ide jadi karya.");
    }
  });

  it("accepts empty optional fields", () => {
    const result = classProfileFormSchema.safeParse({
      className: "XII RPL 1",
      tagline: "",
      description: "",
      photoPath: "",
    });

    expect(result.success).toBe(true);
  });

  it("validates class name, tagline, and description lengths", () => {
    const cases = [
      {
        input: { className: "A" },
        field: "className" as const,
        message: "Nama kelas minimal 2 karakter.",
      },
      {
        input: { className: "a".repeat(81) },
        field: "className" as const,
        message: "Nama kelas maksimal 80 karakter.",
      },
      {
        input: { tagline: "a".repeat(121) },
        field: "tagline" as const,
        message: "Tagline maksimal 120 karakter.",
      },
      {
        input: { description: "a".repeat(1001) },
        field: "description" as const,
        message: "Deskripsi maksimal 1000 karakter.",
      },
    ];

    for (const { input, field, message } of cases) {
      const result = classProfileFormSchema.safeParse({
        ...validClassProfile(),
        ...input,
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.flatten().fieldErrors[field]).toContain(message);
      }
    }
  });

  it("rejects unsafe photos", () => {
    const photo = classProfileFormSchema.safeParse({
      ...validClassProfile(),
      photoPath: "https://evil.com/class.png",
    });

    expect(photo.success).toBe(false);

    if (!photo.success) {
      expect(photo.error.flatten().fieldErrors.photoPath).toContain(
        "Gambar tidak valid. Unggah ulang gambar.",
      );
    }
  });
});

describe("studentProfileFormSchema", () => {
  function validStudentProfile() {
    return {
      studentId: "",
      name: "Budi Santoso",
      role: "Ketua Kelas",
      bio: "Suka membangun aplikasi web.",
      photoPath: "/seed/profiles/budi.png",
      socialLinks: [
        "https://www.tiktok.com/@budi",
        "https://www.instagram.com/budi.santoso",
        "https://github.com/budi-santoso",
      ].join("\n"),
      sortOrder: "1",
      isVisible: true,
    };
  }

  it("accepts a valid student profile", () => {
    const result = studentProfileFormSchema.safeParse(validStudentProfile());

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.sortOrder).toBe(1);
      expect(result.data.isVisible).toBe(true);
      expect(result.data.socialLinks.split("\n")).toHaveLength(3);
    }
  });

  it("accepts an empty social links field", () => {
    const result = studentProfileFormSchema.safeParse({
      ...validStudentProfile(),
      socialLinks: "   ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.socialLinks).toBe("");
    }
  });

  it("requires a valid photo", () => {
    const missing = studentProfileFormSchema.safeParse({
      ...validStudentProfile(),
      photoPath: "",
    });
    const invalid = studentProfileFormSchema.safeParse({
      ...validStudentProfile(),
      photoPath: "https://evil.com/budi.png",
    });

    expect(missing.success).toBe(false);
    expect(invalid.success).toBe(false);

    if (!missing.success) {
      expect(missing.error.flatten().fieldErrors.photoPath).toContain(
        "Foto wajib diunggah.",
      );
    }

    if (!invalid.success) {
      expect(invalid.error.flatten().fieldErrors.photoPath).toContain(
        "Foto tidak valid. Unggah ulang gambar.",
      );
    }
  });

  it("validates name, role, and bio lengths", () => {
    const cases = [
      {
        input: { name: "A" },
        field: "name" as const,
        message: "Nama siswa minimal 2 karakter.",
      },
      {
        input: { name: "a".repeat(81) },
        field: "name" as const,
        message: "Nama siswa maksimal 80 karakter.",
      },
      {
        input: { role: "a".repeat(81) },
        field: "role" as const,
        message: "Peran maksimal 80 karakter.",
      },
      {
        input: { bio: "a".repeat(501) },
        field: "bio" as const,
        message: "Bio maksimal 500 karakter.",
      },
    ];

    for (const { input, field, message } of cases) {
      const result = studentProfileFormSchema.safeParse({
        ...validStudentProfile(),
        ...input,
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.flatten().fieldErrors[field]).toContain(message);
      }
    }
  });

  it("validates the sort order and visibility", () => {
    const negative = studentProfileFormSchema.safeParse({
      ...validStudentProfile(),
      sortOrder: "-1",
    });
    const tooHigh = studentProfileFormSchema.safeParse({
      ...validStudentProfile(),
      sortOrder: "1000",
    });
    const decimal = studentProfileFormSchema.safeParse({
      ...validStudentProfile(),
      sortOrder: "1.5",
    });
    const notBoolean = studentProfileFormSchema.safeParse({
      ...validStudentProfile(),
      isVisible: "true",
    });

    expect(negative.success).toBe(false);
    expect(tooHigh.success).toBe(false);
    expect(decimal.success).toBe(false);
    expect(notBoolean.success).toBe(false);
  });

  it("normalizes, trims, and deduplicates social links", () => {
    const result = studentProfileFormSchema.safeParse({
      ...validStudentProfile(),
      socialLinks:
        "  https://www.instagram.com/budi  \n\nhttps://github.com/budi\nhttps://www.instagram.com/budi\n",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.socialLinks).toBe(
        "https://www.instagram.com/budi\nhttps://github.com/budi",
      );
    }
  });

  it("accepts arbitrary HTTPS social platforms", () => {
    const result = studentProfileFormSchema.safeParse({
      ...validStudentProfile(),
      socialLinks:
        "https://www.linkedin.com/in/budi\nhttps://kelas.example.com/budi",
    });

    expect(result.success).toBe(true);
  });

  it("rejects unsafe social links", () => {
    const invalid = [
      "http://www.instagram.com/budi",
      "https://user:pass@linkedin.com/in/budi",
      "https://linkedin.com:8443/in/budi",
      "https://localhost/budi",
      "https://intranet/budi",
    ];

    for (const socialLinks of invalid) {
      const result = studentProfileFormSchema.safeParse({
        ...validStudentProfile(),
        socialLinks,
      });

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.flatten().fieldErrors.socialLinks).toContain(
          "Gunakan URL HTTPS yang valid tanpa kredensial atau port khusus.",
        );
      }
    }
  });

  it("caps social links at five", () => {
    const result = studentProfileFormSchema.safeParse({
      ...validStudentProfile(),
      socialLinks: Array.from(
        { length: 6 },
        (_, index) => `https://example.com/${index + 1}`,
      ).join("\n"),
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.flatten().fieldErrors.socialLinks).toContain(
        "Maksimal 5 tautan sosial.",
      );
    }
  });
});

describe("pklReviewSchema", () => {
  it("accepts valid statuses and defaults an empty note", () => {
    const result = pklReviewSchema.safeParse({
      submissionId: "pkl_1",
      status: "REVIEWED",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.reviewNote).toBe("");
    }
  });

  it("rejects an unknown status or overlong note", () => {
    const invalidStatus = pklReviewSchema.safeParse({
      submissionId: "pkl_1",
      status: "APPROVED",
    });
    const longNote = pklReviewSchema.safeParse({
      submissionId: "pkl_1",
      status: "REVISION",
      reviewNote: "a".repeat(1001),
    });

    expect(invalidStatus.success).toBe(false);
    expect(longNote.success).toBe(false);
  });
});
