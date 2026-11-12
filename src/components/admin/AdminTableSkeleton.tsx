import { Skeleton } from "@/components/ui/Skeleton";
import styles from "./AdminTableSkeleton.module.css";

export function AdminTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className={styles.wrap} aria-busy="true">
      <span className="visuallyHidden">Memuat data…</span>
      <Skeleton className={styles.toolbar} />
      <div className={styles.table}>
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton key={index} className={styles.row} />
        ))}
      </div>
    </div>
  );
}
