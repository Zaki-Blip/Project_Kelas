export type PklListFilters = {
  q: string;
  page: number;
};

export function buildPklListHref(
  filters: PklListFilters,
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

  return query ? `/admin/laporan-pkl?${query}` : "/admin/laporan-pkl";
}
