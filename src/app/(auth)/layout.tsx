import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./auth-layout.module.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="KaryaKelas, beranda">
          <span className={styles.brandMark} aria-hidden="true" />
          <span>KaryaKelas</span>
        </Link>
      </header>
      <main id="konten" className={styles.main}>
        {children}
      </main>
    </div>
  );
}
