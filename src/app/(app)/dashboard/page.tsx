import type { Metadata } from "next";

import { GalleryFilters } from "@/components/projects/GalleryFilters";
import { GalleryPagination } from "@/components/projects/GalleryPagination";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth/guards";
import { cn } from "@/lib/cn";
import { GALLERY_PAGE_SIZE } from "@/lib/projects/constants";
import { getGalleryProjects, getProjectTaxonomies } from "@/lib/projects/queries";
import { buildGalleryHref } from "@/lib/projects/urls";
import { parseGallerySearchParams } from "@/lib/validation/projects";
import styles from "./dashboard.module.css";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Jelajahi karya kelas, cari berdasarkan judul atau pembuat, dan filter kategori.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser("/dashboard");

  const params = await searchParams;
  const requestedFilters = parseGallerySearchParams(params);
  const taxonomies = await getProjectTaxonomies();
  const filters = {
    ...requestedFilters,
    category:
      requestedFilters.category &&
      taxonomies.categories.some((category) => category.slug === requestedFilters.category)
        ? requestedFilters.category
        : undefined,
    tech:
      requestedFilters.tech &&
      taxonomies.technologies.some((technology) => technology.slug === requestedFilters.tech)
        ? requestedFilters.tech
        : undefined,
  };
  const result = await getGalleryProjects(filters);

  const totalPages = Math.max(1, Math.ceil(result.total / GALLERY_PAGE_SIZE));
  const pageOutOfRange = result.total > 0 && filters.page > totalPages;
  const hasFilters = Boolean(filters.q || filters.category || filters.tech);
  const forbidden = firstParam(params.notice) === "forbidden";
  const start = result.items.length > 0 ? (filters.page - 1) * GALLERY_PAGE_SIZE + 1 : 0;
  const end = result.items.length > 0 ? start + result.items.length - 1 : 0;

  let resultText: string;

  if (pageOutOfRange) {
    resultText = `Halaman ${filters.page} tidak memiliki karya.`;
  } else if (result.total === 0) {
    resultText = hasFilters
      ? "Tidak ada karya yang cocok."
      : "Belum ada karya yang dipublikasikan.";
  } else {
    resultText = `Menampilkan ${start}–${end} dari ${result.total} karya`;
  }

  return (
    <section className={cn("container", styles.page)}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Galeri</p>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Galeri Karya</h1>
          <span className={styles.count}>{result.total} karya</span>
        </div>
        <p className={styles.text}>
          Jelajahi proyek yang dibuat di kelas. Cari berdasarkan judul atau pembuat, lalu
          persempit dengan kategori dan teknologi.
        </p>
      </div>

      {forbidden ? (
        <p className={styles.notice} role="status">
          Kamu tidak memiliki akses ke halaman admin.
        </p>
      ) : null}

      <GalleryFilters filters={filters} taxonomies={taxonomies} />

      <p className={styles.results} aria-live="polite">
        {resultText}
      </p>

      {pageOutOfRange ? (
        <div className={styles.empty}>
          <h2>Halaman ini tidak memiliki karya.</h2>
          <p>Kembali ke halaman pertama untuk melihat karya yang tersedia.</p>
          <div>
            <Button href={buildGalleryHref(filters, 1)}>Ke Halaman Pertama</Button>
          </div>
        </div>
      ) : result.items.length === 0 ? (
        <div className={styles.empty}>
          <h2>
            {hasFilters
              ? "Tidak ada karya yang cocok."
              : "Belum ada karya yang dipublikasikan."}
          </h2>
          <p>
            {hasFilters
              ? "Coba kata kunci lain atau reset filter untuk melihat semua karya."
              : "Karya yang sudah terbit akan muncul di sini."}
          </p>
          {hasFilters ? (
            <div>
              <Button href="/dashboard" variant="outline">
                Reset Filter
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <h2 className="visuallyHidden">Daftar karya</h2>
          <ProjectGrid projects={result.items} isAuthenticated priorityFirst />
          <GalleryPagination
            filters={filters}
            currentPage={filters.page}
            totalPages={totalPages}
          />
        </>
      )}
    </section>
  );
}
