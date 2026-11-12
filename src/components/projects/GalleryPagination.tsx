import Link from "next/link";

import { getPaginationItems } from "@/lib/projects/pagination";
import type { GalleryFilters } from "@/lib/projects/types";
import { buildGalleryHref } from "@/lib/projects/urls";
import styles from "./GalleryPagination.module.css";

type GalleryPaginationProps = {
  filters: GalleryFilters;
  currentPage: number;
  totalPages: number;
};

export function GalleryPagination({
  filters,
  currentPage,
  totalPages,
}: GalleryPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const items = getPaginationItems(currentPage, totalPages);
  const previousHref = buildGalleryHref(filters, currentPage - 1);
  const nextHref = buildGalleryHref(filters, currentPage + 1);

  return (
    <nav className={styles.nav} aria-label="Navigasi halaman galeri">
      {currentPage > 1 ? (
        <Link href={previousHref} className={styles.control} rel="prev">
          ← Sebelumnya
        </Link>
      ) : (
        <span className={styles.disabled} aria-disabled="true">
          ← Sebelumnya
        </span>
      )}

      <ol className={styles.list}>
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <li key={`ellipsis-${index}`}>
              <span className={styles.ellipsis} aria-hidden="true">
                …
              </span>
            </li>
          ) : (
            <li key={item}>
              {item === currentPage ? (
                <span className={styles.current} aria-current="page">
                  {item}
                </span>
              ) : (
                <Link href={buildGalleryHref(filters, item)} className={styles.control}>
                  {item}
                </Link>
              )}
            </li>
          ),
        )}
      </ol>

      {currentPage < totalPages ? (
        <Link href={nextHref} className={styles.control} rel="next">
          Berikutnya →
        </Link>
      ) : (
        <span className={styles.disabled} aria-disabled="true">
          Berikutnya →
        </span>
      )}
    </nav>
  );
}
