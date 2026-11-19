import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const tokensCss = readFileSync(
  new URL("../../src/styles/tokens.css", import.meta.url),
  "utf8",
);

function getToken(name: string): string {
  const match = tokensCss.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"));

  const value = match?.[1];

  if (!value) {
    throw new Error(`Missing color token: --${name}`);
  }

  return value;
}

function relativeLuminance(hex: string): number {
  const value = hex.replace("#", "");
  const [red = 0, green = 0, blue = 0] = [0, 2, 4].map((index) => {
    const channel = Number.parseInt(value.slice(index, index + 2), 16) / 255;

    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

describe("Soft Neobrutalism color contrast", () => {
  it.each([
    ["muted text on page background", "color-muted", "color-bg", 4.5],
    ["muted text on surface", "color-muted", "color-surface", 4.5],
    ["muted text on skeleton", "color-muted", "color-skeleton", 4.5],
    ["ink text on yellow badge", "color-ink", "color-yellow", 4.5],
    ["surface text on blue badge", "color-surface", "color-blue", 4.5],
    ["danger text on danger background", "color-danger", "color-danger-bg", 4.5],
    ["success text on success background", "color-success", "color-success-bg", 4.5],
    ["large ink initials on blue", "color-ink", "color-blue", 3],
  ] as const)("%s meets WCAG 2.1 AA", (_label, foregroundToken, backgroundToken, minimum) => {
    const ratio = contrastRatio(
      getToken(foregroundToken),
      getToken(backgroundToken),
    );

    expect(ratio).toBeGreaterThanOrEqual(minimum);
  });
});
