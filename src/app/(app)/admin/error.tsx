"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import styles from "../../status.module.css";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className={cn("container", styles.wrap)}>
      <p className={styles.eyebrow}>Terjadi kesalahan</p>
      <h1 className={styles.title}>Panel pengelola belum bisa dimuat.</h1>
      <p className={styles.text}>
        Coba muat ulang halaman. Jika masalah berlanjut, kembali ke halaman utama
        panel dan coba lagi nanti.
      </p>
      <div className={styles.actions}>
        <Button onClick={reset}>Coba Lagi</Button>
        <Button href="/admin" variant="outline">
          Ke Kelola Project
        </Button>
      </div>
    </section>
  );
}
