import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth/guards";
import { cn } from "@/lib/cn";
import pageStyles from "../app-pages.module.css";
import styles from "./laporan-pkl.module.css";

export const metadata: Metadata = {
  title: "Laporan PKL",
  description:
    "Pengumpulan laporan Praktik Kerja Lapangan akan dibuka 1 bulan sebelum masa PKL selesai.",
  alternates: {
    canonical: "/laporan-pkl",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PklReportPage() {
  await requireUser("/laporan-pkl");

  return (
    <section className={cn("container", pageStyles.page)}>
      <header className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>PKL</p>
        <h1 className={pageStyles.title}>Laporan PKL</h1>
        <p className={pageStyles.text}>
          Pengumpulan laporan Praktik Kerja Lapangan belum dibuka.
        </p>
      </header>

      <div
        className={cn(pageStyles.panel, styles.panel)}
        aria-labelledby="pkl-coming-soon-title"
      >
        <span className={pageStyles.badge}>Coming Soon</span>

        <div className={styles.iconWrap} aria-hidden="true">
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable="false"
          >
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M8 3v4M16 3v4M3 10h18" />
            <path d="M12 14v3l2 1" />
          </svg>
        </div>

        <h2 id="pkl-coming-soon-title" className={pageStyles.panelTitle}>
          Pengumpulan laporan segera hadir
        </h2>
        <p className={pageStyles.panelText}>
          Halaman ini akan dibuka <strong>1 bulan sebelum masa PKL selesai</strong>.
          Setelah dibuka, kamu bisa mengumpulkan judul, tempat PKL, ringkasan, dan
          tautan laporan.
        </p>

        <div className={styles.prep}>
          <p className={styles.prepTitle}>Sambil menunggu, siapkan:</p>
          <ul className={styles.list}>
            <li>Judul laporan PKL</li>
            <li>Nama tempat PKL</li>
            <li>Ringkasan kegiatan</li>
            <li>Tautan laporan yang bisa diakses pengelola</li>
          </ul>
        </div>

        <p className={styles.hint}>
          Tanggal pastinya akan diinformasikan oleh pembimbing atau pengelola kelas.
        </p>

        <div className={pageStyles.actions}>
          <Button href="/dashboard" variant="secondary">
            Lihat Galeri Karya
          </Button>
        </div>
      </div>
    </section>
  );
}
