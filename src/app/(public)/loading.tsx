import { LoadingStatus } from "@/components/ui/LoadingStatus";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import styles from "../status.module.css";

export default function PublicLoading() {
  return (
    <>
      <LoadingStatus label="Memuat halaman…" />
      <div className={cn("container", styles.loadingGrid)} aria-busy="true">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className={styles.loadingCard} aria-hidden="true">
            <Skeleton className={styles.loadingImage} />
            <Skeleton className={styles.loadingLine} />
            <Skeleton className={styles.loadingLineShort} />
          </div>
        ))}
      </div>
    </>
  );
}
