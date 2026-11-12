import type { AdminProjectFilters } from "@/lib/admin/types";

export function buildAdminProjectListHref(
  filters: AdminProjectFilters,
  page = filters.page,
): string {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/admin?${query}` : "/admin";
}

/**
 * Restricts post-mutation redirects to admin pages. Rejects absolute URLs,
 * protocol-relative paths, backslashes, traversal, and encoded control chars.
 */
export function safeAdminReturnPath(
  value: string | null | undefined,
  fallback = "/admin",
): string {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();

  if (
    trimmed.length === 0 ||
    trimmed.length > 2048 ||
    !trimmed.startsWith("/admin") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    trimmed.includes("..") ||
    /%(?:2e|2f|5c|0[0-9a-f]|1[0-9a-f]|7f)/i.test(trimmed) ||
    /[\u0000-\u001f\u007f]/.test(trimmed)
  ) {
    return fallback;
  }

  try {
    const targetUrl = new URL(trimmed, "http://localhost");

    if (
      targetUrl.origin !== "http://localhost" ||
      (targetUrl.pathname !== "/admin" && !targetUrl.pathname.startsWith("/admin/"))
    ) {
      return fallback;
    }

    return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
  } catch {
    return fallback;
  }
}

export function buildAdminProjectFormHref(
  path: string,
  filters: AdminProjectFilters,
): string {
  const listHref = buildAdminProjectListHref(filters);

  if (listHref === "/admin") {
    return path;
  }

  return `${path}?returnTo=${encodeURIComponent(listHref)}`;
}

export function withAdminNotice(path: string, notice: string): string {
  const url = new URL(path, "http://localhost");
  url.searchParams.set("notice", notice);

  return `${url.pathname}${url.search}${url.hash}`;
}
