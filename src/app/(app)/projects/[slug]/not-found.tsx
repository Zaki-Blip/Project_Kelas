import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import styles from "../../../status.module.css";

export default function ProjectNotFound() {
  return (
    <section className={cn("container", styles.wrap)}>
      <p className={styles.eyebrow}>404</p>
      <h1 className={styles.title}>Proyek tidak ditemukan.</h1>
      <p className={styles.text}>
        Proyek yang kamu cari tidak tersedia atau belum dipublikasikan. Kembali ke galeri
        untuk melihat karya lain.
      </p>
      <div className={styles.actions}>
        <Button href="/dashboard">Ke Galeri</Button>
        <Button href="/" variant="outline">
          Ke Beranda
        </Button>
      </div>
    </section>
  );
}
