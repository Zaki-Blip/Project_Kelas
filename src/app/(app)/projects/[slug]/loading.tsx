import { LoadingStatus } from "@/components/ui/LoadingStatus";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import styles from "./project-detail.module.css";

export default function ProjectDetailLoading() {
  return (
    <>
      <LoadingStatus label="Memuat detail proyek…" />
      <section className={cn("container", styles.loadingPage)} aria-busy="true">
        <Skeleton className={styles.loadingBack} />

        <div className={styles.loadingHero} aria-hidden="true">
          <Skeleton className={styles.loadingMedia} />

          <div className={styles.loadingMeta}>
            <Skeleton className={styles.loadingBadge} />
            <Skeleton className={styles.loadingTitle} />
            <Skeleton className={styles.loadingText} />
            <Skeleton className={styles.loadingTextShort} />
            <Skeleton className={styles.loadingActions} />
          </div>
        </div>

        <div className={styles.loadingSection} aria-hidden="true">
          <Skeleton className={styles.loadingHeading} />
          <Skeleton className={styles.loadingParagraph} />
          <Skeleton className={styles.loadingParagraph} />
          <Skeleton className={styles.loadingParagraph} />
        </div>
      </section>
    </>
  );
}
