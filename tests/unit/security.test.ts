import { describe, expect, it } from "vitest";

import {
  IMAGE_EXTENSION,
  IMAGE_MIME,
  detectImageType,
} from "@/lib/security/magic-bytes";
import {
  isAllowedImagePath,
  isBlobUrl,
} from "@/lib/security/images";
import {
  getPreviewFrameSources,
  isPreviewHostAllowed,
  parsePreviewAllowedHosts,
} from "@/lib/preview/allowlist";
import {
  getGitHubUrl,
  getPreviewUrl,
  safeNextPath,
} from "@/lib/security/urls";
import {
  getExternalSocialUrl,
  getSocialLinksFromText,
  isSafeExternalSocialUrl,
  normalizeSocialUrlLines,
  splitSocialUrlLines,
} from "@/lib/social";

describe("detectImageType", () => {
  it("detects JPEG magic bytes", () => {
    expect(detectImageType(new Uint8Array([0xff, 0xd8, 0xff]))).toBe("jpeg");
    expect(
      detectImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])),
    ).toBe("jpeg");
  });

  it("detects PNG magic bytes", () => {
    expect(
      detectImageType(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ),
    ).toBe("png");
  });

  it("detects WebP magic bytes", () => {
    const bytes = new Uint8Array(12);
    bytes.set([0x52, 0x49, 0x46, 0x46], 0);
    bytes.set([0x57, 0x45, 0x42, 0x50], 8);

    expect(detectImageType(bytes)).toBe("webp");
  });

  it("rejects unknown, short, and empty payloads", () => {
    expect(detectImageType(new Uint8Array())).toBeNull();
    expect(detectImageType(new Uint8Array([0xff, 0xd8]))).toBeNull();
    expect(
      detectImageType(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a]),
      ),
    ).toBeNull();
    expect(
      detectImageType(new Uint8Array([0x52, 0x49, 0x46, 0x46])),
    ).toBeNull();
    expect(
      detectImageType(
        new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x41]),
      ),
    ).toBeNull();
    expect(
      detectImageType(new TextEncoder().encode("<script>alert(1)</script>")),
    ).toBeNull();
  });

  it("maps detected types to MIME types and extensions", () => {
    expect(IMAGE_MIME).toEqual({
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    });
    expect(IMAGE_EXTENSION).toEqual({
      jpeg: "jpg",
      png: "png",
      webp: "webp",
    });
  });
});

describe("isBlobUrl", () => {
  it("accepts HTTPS Vercel Blob public URLs", () => {
    expect(
      isBlobUrl(
        "https://abc123.public.blob.vercel-storage.com/projects/a/b.png",
      ),
    ).toBe(true);
    expect(
      isBlobUrl("https://x.public.blob.vercel-storage.com/file.webp"),
    ).toBe(true);
  });

  it("rejects insecure, credentialed, or lookalike URLs", () => {
    const invalid = [
      "",
      "http://abc123.public.blob.vercel-storage.com/a.png",
      "https://user:pass@abc123.public.blob.vercel-storage.com/a.png",
      "https://abc123.public.blob.vercel-storage.com:8443/a.png",
      "https://public.blob.vercel-storage.com/a.png",
      "https://abc123.public.blob.vercel-storage.com.evil.com/a.png",
      "https://evil.com/abc123.public.blob.vercel-storage.com/a.png",
      "https://evil.com/a.png",
      "not a url",
    ];

    for (const value of invalid) {
      expect(isBlobUrl(value)).toBe(false);
    }
  });
});

describe("isAllowedImagePath", () => {
  it("accepts bundled seed images", () => {
    const valid = [
      "/seed/thumbnails/kasir-kita.png",
      "/seed/thumbnails/kasir-kita.PNG",
      "/seed/screenshots/kasir-kita-1.jpg",
      "/seed/screenshots/kasir-kita-1.jpeg",
      "/seed/screenshots/kasir-kita-1.webp",
      "/seed/profiles/budi-santoso.png",
      "/seed/profiles/class.webp",
    ];

    for (const value of valid) {
      expect(isAllowedImagePath(value)).toBe(true);
    }
  });

  it("accepts Vercel Blob uploads", () => {
    expect(
      isAllowedImagePath(
        "https://abc123.public.blob.vercel-storage.com/projects/a/b.png",
      ),
    ).toBe(true);
  });

  it("rejects traversal, unsupported formats, and foreign hosts", () => {
    const invalid = [
      "",
      "/seed/thumbnails/foo_bar.png",
      "/seed/thumbnails/foo.gif",
      "/seed/thumbnails/../foo.png",
      "/seed/thumbnails/foo/bar.png",
      "/seed/other/foo.png",
      "/seed/profiles/../foo.png",
      "/seed/profiles/foo.gif",
      "/seed/thumbnails/foo.png?x=1",
      "http://abc123.public.blob.vercel-storage.com/a.png",
      "https://evil.com/a.png",
    ];

    for (const value of invalid) {
      expect(isAllowedImagePath(value)).toBe(false);
    }
  });
});

describe("preview allowlist", () => {
  it("defaults to *.vercel.app", () => {
    expect(parsePreviewAllowedHosts(undefined)).toEqual(["*.vercel.app"]);
  });

  it("normalizes, validates, and deduplicates hosts", () => {
    expect(
      parsePreviewAllowedHosts(
        " *.vercel.app , EXAMPLE.com, example.com, bad host, https://evil.com, *.vercel.app ",
      ),
    ).toEqual(["*.vercel.app", "example.com"]);
  });

  it("rejects malformed wildcard and host entries", () => {
    expect(parsePreviewAllowedHosts("")).toEqual([]);
    expect(parsePreviewAllowedHosts("*")).toEqual([]);
    expect(parsePreviewAllowedHosts("foo..bar")).toEqual([]);
    expect(parsePreviewAllowedHosts("*.vercel.app:443")).toEqual([]);
    expect(parsePreviewAllowedHosts("a".repeat(254))).toEqual([]);
  });

  it("matches wildcard suffixes without matching the bare suffix", () => {
    const hosts = ["*.vercel.app"];

    expect(isPreviewHostAllowed("kasirkita.vercel.app", hosts)).toBe(true);
    expect(isPreviewHostAllowed("a.b.vercel.app", hosts)).toBe(true);
    expect(isPreviewHostAllowed("KASIRKITA.VERCEL.APP", hosts)).toBe(true);
    expect(isPreviewHostAllowed("vercel.app", hosts)).toBe(false);
    expect(isPreviewHostAllowed("evil.vercel.app.attacker.test", hosts)).toBe(
      false,
    );
    expect(isPreviewHostAllowed("kasirkita.vercel.app.", hosts)).toBe(false);
    expect(isPreviewHostAllowed("", hosts)).toBe(false);
  });

  it("matches exact hosts only when no wildcard is used", () => {
    expect(isPreviewHostAllowed("example.com", ["example.com"])).toBe(true);
    expect(isPreviewHostAllowed("sub.example.com", ["example.com"])).toBe(false);
    expect(isPreviewHostAllowed("example.com", ["*.example.com"])).toBe(false);
    expect(isPreviewHostAllowed("sub.example.com", ["*.example.com"])).toBe(
      true,
    );
  });

  it("builds HTTPS frame sources", () => {
    expect(getPreviewFrameSources(["*.vercel.app", "example.com"])).toEqual([
      "https://*.vercel.app",
      "https://example.com",
    ]);
    expect(getPreviewFrameSources([])).toEqual([]);
  });
});

describe("getPreviewUrl", () => {
  it("accepts allowlisted HTTPS preview URLs", () => {
    expect(getPreviewUrl("https://kasirkita.vercel.app")).toBe(
      "https://kasirkita.vercel.app/",
    );
    expect(getPreviewUrl("https://kasirkita.vercel.app:443")).toBe(
      "https://kasirkita.vercel.app/",
    );
    expect(
      getPreviewUrl("https://kasirkita.vercel.app/path?q=1#section"),
    ).toBe("https://kasirkita.vercel.app/path?q=1#section");
    expect(getPreviewUrl(" https://KASIRKITA.VERCEL.APP ")).toBe(
      "https://kasirkita.vercel.app/",
    );
  });

  it("rejects missing, insecure, credentialed, or foreign URLs", () => {
    const invalid = [
      null,
      undefined,
      "",
      "http://kasirkita.vercel.app",
      "https://vercel.app",
      "https://evil.com",
      "https://evil.vercel.app.attacker.test",
      "https://kasirkita.vercel.app.",
      "https://user:pass@kasirkita.vercel.app",
      "https://kasirkita.vercel.app:8443",
      "javascript:alert(1)",
      "not a url",
      `https://${"a".repeat(2049)}.vercel.app`,
    ];

    for (const value of invalid) {
      expect(getPreviewUrl(value)).toBeNull();
    }
  });
});

describe("getGitHubUrl", () => {
  it("accepts github.com and www.github.com HTTPS URLs", () => {
    expect(getGitHubUrl("https://github.com/user/repo")).toBe(
      "https://github.com/user/repo",
    );
    expect(getGitHubUrl("https://www.github.com/user/repo")).toBe(
      "https://www.github.com/user/repo",
    );
    expect(getGitHubUrl("https://github.com")).toBe("https://github.com/");
  });

  it("rejects other hosts, protocols, ports, and credentials", () => {
    const invalid = [
      null,
      undefined,
      "",
      "http://github.com/user/repo",
      "https://gitlab.com/user/repo",
      "https://github.com.evil.com/user/repo",
      "https://github.com:8443/user/repo",
      "https://user:pass@github.com/user/repo",
      "javascript:alert(1)",
    ];

    for (const value of invalid) {
      expect(getGitHubUrl(value)).toBeNull();
    }
  });
});

describe("custom social profile URLs", () => {
  it("accepts HTTPS links on any public host", () => {
    expect(
      getExternalSocialUrl("https://www.linkedin.com/company/karyakelas"),
    ).toBe("https://www.linkedin.com/company/karyakelas");
    expect(getExternalSocialUrl("https://youtu.be/abc123")).toBe(
      "https://youtu.be/abc123",
    );
    expect(getExternalSocialUrl("https://x.com/karyakelas")).toBe(
      "https://x.com/karyakelas",
    );
    expect(getExternalSocialUrl("  https://kelas.example.com  ")).toBe(
      "https://kelas.example.com/",
    );
  });

  it("rejects insecure, credentialed, custom-port, and local URLs", () => {
    const invalid = [
      null,
      undefined,
      "",
      "http://linkedin.com/company/kelas",
      "https://user:pass@linkedin.com/company/kelas",
      "https://linkedin.com:8443/company/kelas",
      "https://localhost/kelas",
      "https://app.localhost/kelas",
      "https://internal/kelas",
      "javascript:alert(1)",
      "not a url",
      `https://example.com/${"a".repeat(2048)}`,
    ];

    for (const value of invalid) {
      expect(getExternalSocialUrl(value)).toBeNull();
      expect(isSafeExternalSocialUrl(value ?? "")).toBe(false);
    }
  });
});

describe("student social link text", () => {
  it("splits, normalizes, and deduplicates one URL per line", () => {
    expect(
      splitSocialUrlLines("  https://a.example.com  \n\nhttps://b.example.com  "),
    ).toEqual(["https://a.example.com", "https://b.example.com"]);

    expect(
      normalizeSocialUrlLines(
        "https://GITHUB.com/user\nhttps://github.com/user\nhttp://bad.example.com",
      ),
    ).toEqual(["https://github.com/user"]);
  });

  it("detects common platforms and falls back to the hostname", () => {
    const links = getSocialLinksFromText(
      [
        "https://www.instagram.com/kelas",
        "https://youtu.be/abc",
        "https://x.com/kelas",
        "https://kelas.example.com/profil",
      ].join("\n"),
    );

    expect(links).toEqual([
      {
        platform: "instagram",
        label: "Instagram",
        href: "https://www.instagram.com/kelas",
      },
      {
        platform: "youtube",
        label: "YouTube",
        href: "https://youtu.be/abc",
      },
      {
        platform: "x",
        label: "X",
        href: "https://x.com/kelas",
      },
      {
        platform: "website",
        label: "kelas.example.com",
        href: "https://kelas.example.com/profil",
      },
    ]);
  });
});

describe("safeNextPath", () => {
  it("accepts same-origin internal paths", () => {
    expect(safeNextPath("/dashboard")).toBe("/dashboard");
    expect(safeNextPath("/projects/kasir-kita")).toBe("/projects/kasir-kita");
    expect(safeNextPath("/dashboard?q=kasir#top")).toBe(
      "/dashboard?q=kasir#top",
    );
    expect(safeNextPath("  /dashboard  ")).toBe("/dashboard");
  });

  it("falls back for missing or unsafe values", () => {
    const invalid = [
      null,
      undefined,
      "",
      "   ",
      "https://evil.example",
      "http://localhost:3000/dashboard",
      "//evil.example/path",
      "\\\\evil.example",
      "/\\evil.example",
      "/dashboard\n",
      "/dashboard\u0000",
      "/" + "a".repeat(2049),
      "/login",
      "/login/",
      "/login?next=/dashboard",
      "/register",
      "/register/foo",
    ];

    for (const value of invalid) {
      expect(safeNextPath(value)).toBe("/dashboard");
    }
  });

  it("supports a custom fallback", () => {
    expect(safeNextPath(null, "/home")).toBe("/home");
    expect(safeNextPath("https://evil.example", "/home")).toBe("/home");
  });

  it("keeps internal traversal on the same origin", () => {
    expect(safeNextPath("/dashboard/../admin")).toBe("/admin");
    expect(safeNextPath("/dashboard/../../evil.example")).toBe("/evil.example");
  });
});
