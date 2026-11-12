import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import styles from "./project-detail.module.css";

export default function ProjectDetailLoading() {
  return (
    <section className={cn("container", styles.loadingPage)} aria-busy="true">
      <span className="visuallyHidden">Memuat detail proyek…</span>

      <Skeleton className={styles.loadingBack} />

      <div className={styles.loadingHero}>
        <Skeleton className={styles.loadingMedia} />

        <div className={styles.loadingMeta}>
          <Skeleton className={styles.loadingBadge} />
          <Skeleton className={styles.loadingTitle} />
          <Skeleton className={styles.loadingText} />
          <Skeleton className={styles.loadingTextShort} />
          <Skeleton className={styles.loadingActions} />
        </div>
      </div>

      <div className={styles.loadingSection}>
        <Skeleton className={styles.loadingHeading} />
        <Skeleton className={styles.loadingParagraph} />
        <Skeleton className={styles.loadingParagraph} />
        <Skeleton className={styles.loadingParagraph} />
      </div>
    </section>
  );
}
