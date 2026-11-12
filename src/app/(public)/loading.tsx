import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import styles from "../status.module.css";

export default function PublicLoading() {
  return (
    <div className={cn("container", styles.loadingGrid)} aria-busy="true">
      <span className="visuallyHidden">Memuat halaman…</span>
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div key={item} className={styles.loadingCard}>
          <Skeleton className={styles.loadingImage} />
          <Skeleton className={styles.loadingLine} />
          <Skeleton className={styles.loadingLineShort} />
        </div>
      ))}
    </div>
  );
}
