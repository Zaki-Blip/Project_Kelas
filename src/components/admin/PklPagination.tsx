import Link from "next/link";

import { buildPklListHref, type PklListFilters } from "@/lib/pkl/paths";
import { getPaginationItems } from "@/lib/projects/pagination";
import styles from "./AdminPagination.module.css";

type PklPaginationProps = {
  filters: PklListFilters;
  currentPage: number;
  totalPages: number;
};

export function PklPagination({
  filters,
  currentPage,
  totalPages,
}: PklPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const items = getPaginationItems(currentPage, totalPages);
  const previousHref = buildPklListHref(filters, currentPage - 1);
  const nextHref = buildPklListHref(filters, currentPage + 1);

  return (
    <nav className={styles.nav} aria-label="Navigasi halaman laporan PKL">
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
            <li key={`ellipsis-${index}`} className={styles.ellipsis} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              {item === currentPage ? (
                <span className={styles.current} aria-current="page">
                  {item}
                </span>
              ) : (
                <Link
                  href={buildPklListHref(filters, item)}
                  className={styles.control}
                  aria-label={`Halaman ${item}`}
                >
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
