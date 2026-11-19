import { describe, expect, it } from "vitest";

import { getInitials, hasSocialLinks } from "@/lib/profiles/display";

describe("profile display helpers", () => {
  it("builds initials from the first two name parts", () => {
    expect(getInitials("Nabila Putri")).toBe("NP");
    expect(getInitials("  Budi   Santoso  ")).toBe("BS");
    expect(getInitials("Raka")).toBe("R");
    expect(getInitials("")).toBe("");
  });

  it("detects prepared social links", () => {
    expect(
      hasSocialLinks({
        socialLinks: [
          {
            platform: "tiktok",
            label: "TikTok",
            href: "https://www.tiktok.com/@nabila",
          },
        ],
      }),
    ).toBe(true);
  });

  it("reports no social links for an empty list", () => {
    expect(hasSocialLinks({ socialLinks: [] })).toBe(false);
  });
});
