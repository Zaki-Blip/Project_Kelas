import { Skeleton } from "@/components/ui/Skeleton";
import styles from "./AdminTableSkeleton.module.css";

export function AdminTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <Skeleton className={styles.toolbar} />
      <div className={styles.table}>
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton key={index} className={styles.row} />
        ))}
      </div>
    </div>
  );
}
