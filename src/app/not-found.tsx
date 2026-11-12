import { connection } from "next/server";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import styles from "./status.module.css";

export default async function NotFound() {
  // Unknown routes render this page. Dynamic rendering lets Next.js attach the CSP nonce.
  await connection();

  return (
    <main id="konten" className={cn("container", styles.wrap)}>
      <p className={styles.eyebrow}>404</p>
      <h1 className={styles.title}>Halaman tidak ditemukan.</h1>
      <p className={styles.text}>
        Halaman atau proyek yang kamu cari tidak tersedia. Periksa kembali tautannya atau
        kembali ke beranda.
      </p>
      <div className={styles.actions}>
        <Button href="/">Ke Beranda</Button>
        <Button href="/dashboard" variant="outline">
          Ke Dashboard
        </Button>
      </div>
    </main>
  );
}
