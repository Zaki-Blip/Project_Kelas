import { ProjectGridSkeleton } from "@/components/projects/ProjectGridSkeleton";
import { LoadingStatus } from "@/components/ui/LoadingStatus";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import styles from "./dashboard-loading.module.css";

export default function DashboardLoading() {
  return (
    <>
      <LoadingStatus label="Memuat galeri karya…" />
      <section className={cn("container", styles.page)} aria-busy="true">
        <div className={styles.header} aria-hidden="true">
          <Skeleton className={styles.eyebrow} />
          <Skeleton className={styles.title} />
          <Skeleton className={styles.text} />
        </div>

        <div className={styles.filters} aria-hidden="true">
          <Skeleton className={styles.filterField} />
          <Skeleton className={styles.filterField} />
          <Skeleton className={styles.filterField} />
          <Skeleton className={styles.filterAction} />
        </div>

        <Skeleton className={styles.results} />
        <ProjectGridSkeleton count={9} />
      </section>
    </>
  );
}
