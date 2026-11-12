import Link from "next/link";

import type { AdminProjectFilters } from "@/lib/admin/types";
import { buildAdminProjectListHref } from "@/lib/admin/paths";
import { getPaginationItems } from "@/lib/projects/pagination";
import styles from "./AdminPagination.module.css";

type AdminPaginationProps = {
  filters: AdminProjectFilters;
  currentPage: number;
  totalPages: number;
};

export function AdminPagination({
  filters,
  currentPage,
  totalPages,
}: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const items = getPaginationItems(currentPage, totalPages);
  const previousHref = buildAdminProjectListHref(filters, currentPage - 1);
  const nextHref = buildAdminProjectListHref(filters, currentPage + 1);

  return (
    <nav className={styles.nav} aria-label="Navigasi halaman project">
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
                  href={buildAdminProjectListHref(filters, item)}
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
