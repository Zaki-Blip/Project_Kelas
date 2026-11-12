import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import styles from "./SiteFooter.module.css";

export async function SiteFooter() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <footer className={styles.footer}>
      <div className={cn("container", styles.inner)}>
        <div className={styles.brandBlock}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              K
            </span>
            <span>KaryaKelas</span>
          </Link>
          <p className={styles.description}>
            Katalog karya siswa untuk melihat, mencari, dan mencoba proyek kelas.
          </p>
        </div>

        <nav className={styles.nav} aria-label="Navigasi footer">
          <Link href="/">Beranda</Link>
          <Link href="/about">Tentang</Link>
          {user ? (
            <>
              <Link href="/dashboard">Galeri</Link>
              {isAdmin ? <Link href="/admin">Admin</Link> : null}
            </>
          ) : (
            <>
              <Link href="/login">Masuk</Link>
              <Link href="/register">Daftar</Link>
            </>
          )}
        </nav>

        <p className={styles.copy}>© 2026 KaryaKelas. XII RPL 1.</p>
      </div>
    </footer>
  );
}
