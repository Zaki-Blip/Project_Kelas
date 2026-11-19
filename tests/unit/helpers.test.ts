import { describe, expect, it } from "vitest";

import {
  buildAdminProjectFormHref,
  buildAdminProjectListHref,
  safeAdminReturnPath,
  withAdminNotice,
} from "@/lib/admin/paths";
import { getAdminNotice } from "@/lib/admin/notices";
import { getPaginationItems } from "@/lib/projects/pagination";
import {
  buildGalleryHref,
  getLoginNextHref,
  getProjectHref,
  getProjectPreviewHref,
} from "@/lib/projects/urls";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("creates URL-safe slugs", () => {
    expect(slugify("Kasir Kita")).toBe("kasir-kita");
    expect(slugify("Karya Kelas 2026")).toBe("karya-kelas-2026");
    expect(slugify("  Hello, World!  ")).toBe("hello-world");
    expect(slugify("A--B")).toBe("a-b");
    expect(slugify("!!!")).toBe("");
  });

  it("strips accents", () => {
    expect(slugify("Café Résumé")).toBe("cafe-resume");
    expect(slugify("ñandú")).toBe("nandu");
  });

  it("caps the length and removes a trailing hyphen", () => {
    expect(slugify("abc-def", 4)).toBe("abc");
    expect(slugify("a".repeat(200), 10)).toBe("a".repeat(10));
    expect(slugify("a".repeat(200))).toHaveLength(160);
  });
});

describe("getPaginationItems", () => {
  it("lists every page when there are seven or fewer", () => {
    expect(getPaginationItems(1, 1)).toEqual([1]);
    expect(getPaginationItems(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(getPaginationItems(0, 0)).toEqual([]);
  });

  it("adds ellipses around a window near the start", () => {
    expect(getPaginationItems(1, 10)).toEqual([1, 2, "ellipsis", 10]);
    expect(getPaginationItems(2, 10)).toEqual([1, 2, 3, "ellipsis", 10]);
    expect(getPaginationItems(3, 10)).toEqual([1, 2, 3, 4, "ellipsis", 10]);
  });

  it("adds ellipses around a window in the middle", () => {
    expect(getPaginationItems(5, 10)).toEqual([
      1,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      10,
    ]);
  });

  it("adds ellipses around a window near the end", () => {
    expect(getPaginationItems(9, 10)).toEqual([
      1,
      "ellipsis",
      8,
      9,
      10,
    ]);
    expect(getPaginationItems(10, 10)).toEqual([1, "ellipsis", 9, 10]);
    expect(getPaginationItems(8, 8)).toEqual([1, "ellipsis", 7, 8]);
  });
});

describe("project URLs", () => {
  it("builds encoded project and preview hrefs", () => {
    expect(getProjectHref("kasir-kita")).toBe("/projects/kasir-kita");
    expect(getProjectHref("kasir kita")).toBe("/projects/kasir%20kita");
    expect(getProjectHref("a/b")).toBe("/projects/a%2Fb");
    expect(getProjectPreviewHref("kasir-kita")).toBe(
      "/projects/kasir-kita/preview",
    );
  });

  it("builds login redirects with the next path", () => {
    expect(getLoginNextHref("/projects/kasir-kita")).toBe(
      "/login?next=%2Fprojects%2Fkasir-kita",
    );
    expect(getLoginNextHref("/projects/kasir-kita?tab=preview")).toBe(
      "/login?next=%2Fprojects%2Fkasir-kita%3Ftab%3Dpreview",
    );
  });

  it("builds gallery hrefs from filters", () => {
    expect(buildGalleryHref({ q: "", page: 1 })).toBe("/dashboard");
    expect(buildGalleryHref({ q: "kasir", page: 1 })).toBe(
      "/dashboard?q=kasir",
    );
    expect(
      buildGalleryHref({
        q: "kasir",
        category: "web-app",
        tech: "next-js",
        page: 2,
      }),
    ).toBe("/dashboard?q=kasir&category=web-app&tech=next-js&page=2");
    expect(buildGalleryHref({ q: "", page: 2 })).toBe("/dashboard?page=2");
    expect(
      buildGalleryHref({ q: "kasir", category: "", tech: "", page: 1 }),
    ).toBe("/dashboard?q=kasir");
    expect(buildGalleryHref({ q: "kasir", page: 1 }, 3)).toBe(
      "/dashboard?q=kasir&page=3",
    );
  });
});

describe("safeAdminReturnPath", () => {
  it("accepts admin paths, queries, and hashes", () => {
    expect(safeAdminReturnPath("/admin")).toBe("/admin");
    expect(safeAdminReturnPath("/admin?q=kasir&page=2")).toBe(
      "/admin?q=kasir&page=2",
    );
    expect(safeAdminReturnPath("/admin/projects/new")).toBe(
      "/admin/projects/new",
    );
    expect(safeAdminReturnPath("/admin/profil-kelas")).toBe(
      "/admin/profil-kelas",
    );
    expect(safeAdminReturnPath("/admin/laporan-pkl")).toBe(
      "/admin/laporan-pkl",
    );
    expect(safeAdminReturnPath("/admin#section")).toBe("/admin#section");
    expect(safeAdminReturnPath("  /admin?q=kasir  ")).toBe("/admin?q=kasir");
    expect(safeAdminReturnPath("/admin?q=hello%20world")).toBe(
      "/admin?q=hello%20world",
    );
    expect(safeAdminReturnPath("/admin?next=//evil.example")).toBe(
      "/admin?next=//evil.example",
    );
  });

  it("rejects absolute, protocol-relative, and non-admin paths", () => {
    const invalid = [
      null,
      undefined,
      "",
      "   ",
      "https://evil.example/admin",
      "http://localhost/admin",
      "//evil.example/admin",
      "/administer",
      "/dashboard",
      "/admin/" + "a".repeat(2049),
    ];

    for (const value of invalid) {
      expect(safeAdminReturnPath(value)).toBe("/admin");
    }
  });

  it("rejects traversal and encoded separators or control bytes", () => {
    const invalid = [
      "/admin/../secret",
      "/admin/%2e%2e/secret",
      "/admin/%2f%2fevil.example",
      "/admin/%5c%5cevil.example",
      "/admin\\evil.example",
      "/admin?x=%00",
      "/admin?x=%0a",
      "/admin?x=%1f",
      "/admin?x=%7f",
      "/admin\u0000",
    ];

    for (const value of invalid) {
      expect(safeAdminReturnPath(value)).toBe("/admin");
    }
  });

  it("supports a custom fallback", () => {
    expect(safeAdminReturnPath("https://evil.example", "/admin/categories")).toBe(
      "/admin/categories",
    );
  });
});

describe("admin href builders", () => {
  it("builds the project list href from filters", () => {
    expect(buildAdminProjectListHref({ q: "", page: 1 })).toBe("/admin");
    expect(buildAdminProjectListHref({ q: "kasir", page: 1 })).toBe(
      "/admin?q=kasir",
    );
    expect(buildAdminProjectListHref({ q: "", page: 2 })).toBe(
      "/admin?page=2",
    );
    expect(buildAdminProjectListHref({ q: "kasir", page: 2 })).toBe(
      "/admin?q=kasir&page=2",
    );
    expect(buildAdminProjectListHref({ q: "kasir", page: 2 }, 3)).toBe(
      "/admin?q=kasir&page=3",
    );
    expect(buildAdminProjectListHref({ q: "kasir", page: 2 }, 1)).toBe(
      "/admin?q=kasir",
    );
    expect(buildAdminProjectListHref({ q: "kasir kita", page: 1 })).toBe(
      "/admin?q=kasir+kita",
    );
  });

  it("adds returnTo only when the list has filters", () => {
    expect(
      buildAdminProjectFormHref("/admin/projects/new", { q: "", page: 1 }),
    ).toBe("/admin/projects/new");
    expect(
      buildAdminProjectFormHref("/admin/projects/new", {
        q: "kasir",
        page: 2,
      }),
    ).toBe(
      "/admin/projects/new?returnTo=%2Fadmin%3Fq%3Dkasir%26page%3D2",
    );
    expect(
      buildAdminProjectFormHref("/admin/projects/abc/edit", {
        q: "kasir",
        page: 2,
      }),
    ).toBe(
      "/admin/projects/abc/edit?returnTo=%2Fadmin%3Fq%3Dkasir%26page%3D2",
    );
  });

  it("adds or replaces a notice while preserving the hash", () => {
    expect(withAdminNotice("/admin", "created")).toBe(
      "/admin?notice=created",
    );
    expect(withAdminNotice("/admin?q=kasir", "updated")).toBe(
      "/admin?q=kasir&notice=updated",
    );
    expect(withAdminNotice("/admin?notice=old", "deleted")).toBe(
      "/admin?notice=deleted",
    );
    expect(withAdminNotice("/admin#top", "created")).toBe(
      "/admin?notice=created#top",
    );
  });
});

describe("getAdminNotice", () => {
  it("returns known success and error notices", () => {
    expect(getAdminNotice("created")).toEqual({
      kind: "success",
      message: "Project berhasil dibuat.",
    });
    expect(getAdminNotice("taxonomy-in-use")).toEqual({
      kind: "error",
      message: "Data masih digunakan oleh project dan tidak bisa dihapus.",
    });
    expect(getAdminNotice("pkl-reviewed")).toEqual({
      kind: "success",
      message: "Status laporan PKL berhasil diperbarui.",
    });
    expect(getAdminNotice("pkl-deleted")).toEqual({
      kind: "success",
      message: "Laporan PKL berhasil dihapus.",
    });
    expect(getAdminNotice("profile-updated")).toEqual({
      kind: "success",
      message: "Profil kelas berhasil disimpan.",
    });
    expect(getAdminNotice("student-created")).toEqual({
      kind: "success",
      message: "Profil siswa berhasil ditambahkan.",
    });
    expect(getAdminNotice("student-updated")).toEqual({
      kind: "success",
      message: "Perubahan profil siswa berhasil disimpan.",
    });
    expect(getAdminNotice("student-deleted")).toEqual({
      kind: "success",
      message: "Profil siswa berhasil dihapus.",
    });
    expect(getAdminNotice("student-not-found")).toEqual({
      kind: "error",
      message: "Profil siswa tidak ditemukan.",
    });
  });

  it("uses the first value for repeated params", () => {
    expect(getAdminNotice(["deleted", "created"])).toEqual({
      kind: "success",
      message: "Project berhasil dihapus.",
    });
  });

  it("returns null for missing or unknown notices", () => {
    expect(getAdminNotice(undefined)).toBeNull();
    expect(getAdminNotice("")).toBeNull();
    expect(getAdminNotice("unknown")).toBeNull();
  });
});
