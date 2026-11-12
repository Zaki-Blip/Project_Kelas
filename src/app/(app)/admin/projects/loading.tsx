import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import styles from "../admin.module.css";

export default function ProjectFormLoading() {
  return (
    <section className={cn("container", styles.page)} aria-busy="true">
      <span className="visuallyHidden">Memuat form project…</span>

      <div className={styles.header}>
        <div className={styles.headerText}>
          <Skeleton style={{ width: 100, height: 14 }} />
          <Skeleton style={{ width: "min(100%, 360px)", height: 48 }} />
          <Skeleton style={{ width: "min(100%, 620px)", height: 20 }} />
        </div>
      </div>

      <div className={styles.loadingStack}>
        <Skeleton className={styles.loadingSectionTall} />
        <Skeleton className={styles.loadingSection} />
        <Skeleton className={styles.loadingSection} />
        <Skeleton className={styles.loadingSection} />
        <Skeleton className={styles.loadingAction} />
      </div>
    </section>
  );
}
