const DEFAULT_SITE_URL = "http://localhost:3000";

export const SITE_NAME = "KaryaKelas";
export const SITE_DESCRIPTION =
  "Katalog proyek hasil karya siswa: temukan karya, buka detail, dan coba pratinjau langsung.";
export const SITE_URL = new URL(process.env.APP_URL ?? DEFAULT_SITE_URL);
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "KaryaKelas — Katalog Karya Kelas XII RPL 1",
};

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * Serializes JSON-LD without allowing user-controlled strings to close the
 * surrounding <script> element. JSON.stringify alone is not enough because
 * project titles and summaries can contain HTML-significant characters.
 */
export function serializeJsonLd(value: unknown): string {
  return (JSON.stringify(value) ?? "null")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
