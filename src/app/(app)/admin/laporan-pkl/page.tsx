import type { Metadata } from "next";

import { AdminNotice } from "@/components/admin/AdminNotice";
import { PklPagination } from "@/components/admin/PklPagination";
import { PklSubmissionTable } from "@/components/admin/PklSubmissionTable";
import { Button } from "@/components/ui/Button";
import { getAdminNotice } from "@/lib/admin/notices";
import { requireAdmin } from "@/lib/auth/guards";
import { cn } from "@/lib/cn";
import { PKL_PAGE_SIZE } from "@/lib/pkl/constants";
import { buildPklListHref } from "@/lib/pkl/paths";
import {
  getAdminPklSubmissions,
  parsePklSearchParams,
} from "@/lib/pkl/queries";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "Laporan PKL",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminPklPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin("/admin/laporan-pkl");

  const params = await searchParams;
  const filters = parsePklSearchParams(params);
  const notice = getAdminNotice(firstParam(params.notice));
  const { items, total } = await getAdminPklSubmissions(filters);
  const totalPages = Math.max(1, Math.ceil(total / PKL_PAGE_SIZE));
  const pageOutOfRange = total > 0 && filters.page > totalPages;
  const start = total === 0 ? 0 : (filters.page - 1) * PKL_PAGE_SIZE + 1;
  const end = Math.min(filters.page * PKL_PAGE_SIZE, total);
  const returnTo = buildPklListHref(filters);

  return (
    <section className={cn("container", styles.page)}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>Pengelola</p>
          <h1 className={styles.title}>Laporan PKL</h1>
          <p className={styles.text}>
            Pantau laporan hasil PKL yang dikumpulkan siswa, buka tautan laporannya,
            lalu tandai status tinjauan.
          </p>
        </div>
      </div>

      <AdminNotice notice={notice} />

      <form
        className={styles.searchForm}
        method="get"
        action="/admin/laporan-pkl"
        role="search"
        aria-label="Cari laporan PKL"
      >
        <div className={styles.searchField}>
          <label className={styles.searchLabel} htmlFor="pkl-q">
            Cari laporan
          </label>
          <input
            id="pkl-q"
            name="q"
            type="search"
            defaultValue={filters.q}
            maxLength={100}
            placeholder="Nama siswa, judul, atau tempat PKL…"
            className={styles.searchInput}
          />
        </div>
        <div className={styles.searchActions}>
          <Button type="submit" variant="secondary">
            Cari
          </Button>
          <Button href="/admin/laporan-pkl" variant="outline">
            Reset
          </Button>
        </div>
      </form>

      <div className={styles.resultsRow}>
        <p className={styles.results} aria-live="polite">
          {pageOutOfRange
            ? "Halaman tidak tersedia."
            : total === 0
              ? "Tidak ada laporan PKL."
              : `Menampilkan ${start}–${end} dari ${total} laporan PKL.`}
        </p>
        <span className={styles.countBadge}>{total} laporan</span>
      </div>

      {pageOutOfRange ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>Halaman tidak tersedia.</h2>
          <p className={styles.emptyText}>
            Halaman yang kamu buka melebihi jumlah laporan yang ada.
          </p>
          <Button href={buildPklListHref({ ...filters, page: 1 })}>
            Ke Halaman Pertama
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>
            {filters.q ? "Laporan tidak ditemukan." : "Belum ada laporan PKL."}
          </h2>
          <p className={styles.emptyText}>
            {filters.q
              ? "Coba kata kunci lain atau reset pencarian."
              : "Laporan yang dikumpulkan siswa akan muncul di sini."}
          </p>
          {filters.q ? (
            <Button href="/admin/laporan-pkl" variant="outline">
              Reset Pencarian
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <p className={styles.mobileHint}>
            Geser tabel ke samping untuk melihat semua kolom.
          </p>
          <PklSubmissionTable items={items} returnTo={returnTo} />
          <PklPagination
            filters={filters}
            currentPage={filters.page}
            totalPages={totalPages}
          />
        </>
      )}
    </section>
  );
}
