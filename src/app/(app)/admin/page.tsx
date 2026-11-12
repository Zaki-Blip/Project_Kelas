import type { Metadata } from "next";

import { AdminNotice } from "@/components/admin/AdminNotice";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ProjectTable } from "@/components/admin/ProjectTable";
import { Button } from "@/components/ui/Button";
import { getAdminNotice } from "@/lib/admin/notices";
import {
  buildAdminProjectFormHref,
  buildAdminProjectListHref,
} from "@/lib/admin/paths";
import { ADMIN_PAGE_SIZE } from "@/lib/admin/constants";
import { getAdminProjects } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/guards";
import { cn } from "@/lib/cn";
import { parseAdminProjectSearchParams } from "@/lib/validation/admin";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Kelola Project",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin("/admin");

  const params = await searchParams;
  const filters = parseAdminProjectSearchParams(params);
  const notice = getAdminNotice(firstParam(params.notice));
  const { items, total } = await getAdminProjects(filters);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const pageOutOfRange = total > 0 && filters.page > totalPages;
  const start = total === 0 ? 0 : (filters.page - 1) * ADMIN_PAGE_SIZE + 1;
  const end = Math.min(filters.page * ADMIN_PAGE_SIZE, total);
  const returnTo = buildAdminProjectListHref(filters);

  return (
    <section className={cn("container", styles.page)}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>Pengelola</p>
          <h1 className={styles.title}>Kelola Project</h1>
          <p className={styles.text}>
            Tambah, ubah, terbitkan, atau simpan project sebagai draf. Perubahan
            langsung terlihat di galeri setelah project diterbitkan.
          </p>
        </div>
        <Button href={buildAdminProjectFormHref("/admin/projects/new", filters)}>
          Tambah Project
        </Button>
      </div>

      <AdminNotice notice={notice} />

      <form
        className={styles.searchForm}
        method="get"
        action="/admin"
        role="search"
        aria-label="Cari project"
      >
        <div className={styles.searchField}>
          <label className={styles.searchLabel} htmlFor="admin-q">
            Cari project
          </label>
          <input
            id="admin-q"
            name="q"
            type="search"
            defaultValue={filters.q}
            maxLength={100}
            placeholder="Judul, slug, atau nama creator…"
            className={styles.searchInput}
          />
        </div>
        <div className={styles.searchActions}>
          <Button type="submit" variant="secondary">
            Cari
          </Button>
          <Button href="/admin" variant="outline">
            Reset
          </Button>
        </div>
      </form>

      <div className={styles.resultsRow}>
        <p className={styles.results} aria-live="polite">
          {pageOutOfRange
            ? "Halaman tidak tersedia."
            : total === 0
              ? "Tidak ada project."
              : `Menampilkan ${start}–${end} dari ${total} project.`}
        </p>
        <span className={styles.countBadge}>{total} project</span>
      </div>

      {pageOutOfRange ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>Halaman tidak tersedia.</h2>
          <p className={styles.emptyText}>
            Halaman yang kamu buka melebihi jumlah project yang ada.
          </p>
          <Button href={buildAdminProjectListHref({ ...filters, page: 1 })}>
            Ke Halaman Pertama
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>
            {filters.q ? "Project tidak ditemukan." : "Belum ada project."}
          </h2>
          <p className={styles.emptyText}>
            {filters.q
              ? "Coba kata kunci lain atau reset pencarian."
              : "Mulai dengan menambahkan project pertama ke katalog."}
          </p>
          {filters.q ? (
            <Button href="/admin" variant="outline">
              Reset Pencarian
            </Button>
          ) : (
            <Button href={buildAdminProjectFormHref("/admin/projects/new", filters)}>
              Tambah Project
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className={styles.mobileHint}>
            Geser tabel ke samping untuk melihat semua kolom.
          </p>
          <ProjectTable projects={items} returnTo={returnTo} />
          <AdminPagination
            filters={filters}
            currentPage={filters.page}
            totalPages={totalPages}
          />
        </>
      )}
    </section>
  );
}
