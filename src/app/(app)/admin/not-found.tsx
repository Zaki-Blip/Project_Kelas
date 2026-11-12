import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import styles from "../../status.module.css";

export default function AdminNotFound() {
  return (
    <section className={cn("container", styles.wrap)}>
      <p className={styles.eyebrow}>404</p>
      <h1 className={styles.title}>Project tidak ditemukan.</h1>
      <p className={styles.text}>
        Project yang kamu cari tidak tersedia atau sudah dihapus. Kembali ke daftar
        project untuk memilih project lain.
      </p>
      <div className={styles.actions}>
        <Button href="/admin">Ke Kelola Project</Button>
        <Button href="/dashboard" variant="outline">
          Ke Galeri
        </Button>
      </div>
    </section>
  );
}
