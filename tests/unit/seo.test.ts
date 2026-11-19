import { describe, expect, it } from "vitest";

import { absoluteUrl, serializeJsonLd, SITE_URL } from "@/lib/seo";

describe("SEO helpers", () => {
  it("builds absolute URLs on the configured site origin", () => {
    const url = absoluteUrl("/about");

    expect(url).toBe(`${SITE_URL.origin}/about`);
  });

  it("keeps absolute Blob image URLs unchanged", () => {
    const blobUrl = "https://store.public.blob.vercel-storage.com/thumbnails/a.png";

    expect(absoluteUrl(blobUrl)).toBe(blobUrl);
  });

  it("escapes characters that could close a JSON-LD script", () => {
    const serialized = serializeJsonLd({
      name: "</script><script>alert(1)</script>",
      note: "A & B",
    });

    expect(serialized).not.toContain("<");
    expect(serialized).not.toContain(">");
    expect(serialized).toContain("\\u003c/script\\u003e");
    expect(serialized).toContain("\\u0026");
  });

  it("serializes undefined values as null", () => {
    expect(serializeJsonLd(undefined)).toBe("null");
  });
});
