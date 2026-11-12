import type { GalleryFilters } from "@/lib/projects/types";

export function getProjectHref(slug: string): string {
  return `/projects/${encodeURIComponent(slug)}`;
}

export function getProjectPreviewHref(slug: string): string {
  return `${getProjectHref(slug)}/preview`;
}

export function getLoginNextHref(nextPath: string): string {
  return `/login?${new URLSearchParams({ next: nextPath }).toString()}`;
}

export function buildGalleryHref(filters: GalleryFilters, page = filters.page): string {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.tech) {
    params.set("tech", filters.tech);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/dashboard?${query}` : "/dashboard";
}
