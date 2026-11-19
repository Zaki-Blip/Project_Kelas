import { LoadingStatus } from "@/components/ui/LoadingStatus";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import styles from "./preview.module.css";

export default function ProjectPreviewLoading() {
  return (
    <>
      <LoadingStatus label="Memuat live preview…" />
      <section className={cn("container", styles.loadingPage)} aria-busy="true">
        <div className={styles.loadingTopbar} aria-hidden="true">
          <Skeleton className={styles.loadingBack} />
          <Skeleton className={styles.loadingEyebrow} />
          <Skeleton className={styles.loadingTitle} />
          <Skeleton className={styles.loadingActions} />
        </div>

        <Skeleton className={styles.loadingFrame} />
      </section>
    </>
  );
}
