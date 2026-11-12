import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import styles from "./preview.module.css";

export default function ProjectPreviewLoading() {
  return (
    <section className={cn("container", styles.loadingPage)} aria-busy="true">
      <span className="visuallyHidden">Memuat live preview…</span>

      <div className={styles.loadingTopbar}>
        <Skeleton className={styles.loadingBack} />
        <Skeleton className={styles.loadingEyebrow} />
        <Skeleton className={styles.loadingTitle} />
        <Skeleton className={styles.loadingActions} />
      </div>

      <Skeleton className={styles.loadingFrame} />
    </section>
  );
}
