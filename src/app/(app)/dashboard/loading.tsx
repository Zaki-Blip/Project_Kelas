import { ProjectGridSkeleton } from "@/components/projects/ProjectGridSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import styles from "./dashboard-loading.module.css";

export default function DashboardLoading() {
  return (
    <section className={cn("container", styles.page)} aria-busy="true">
      <span className="visuallyHidden">Memuat galeri karya…</span>

      <div className={styles.header}>
        <Skeleton className={styles.eyebrow} />
        <Skeleton className={styles.title} />
        <Skeleton className={styles.text} />
      </div>

      <div className={styles.filters}>
        <Skeleton className={styles.filterField} />
        <Skeleton className={styles.filterField} />
        <Skeleton className={styles.filterField} />
        <Skeleton className={styles.filterAction} />
      </div>

      <Skeleton className={styles.results} />
      <ProjectGridSkeleton count={9} />
    </section>
  );
}
