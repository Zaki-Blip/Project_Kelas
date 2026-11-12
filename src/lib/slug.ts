/**
 * Turns a display name into a URL-safe slug. This helper is intentionally
 * dependency-free so it can be used by both client and server code.
 */
export function slugify(value: string, maxLength = 160): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}
