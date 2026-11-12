import { Skeleton } from "@/components/ui/Skeleton";
import styles from "./ProjectGrid.module.css";

type ProjectGridSkeletonProps = {
  count?: number;
};

export function ProjectGridSkeleton({ count = 6 }: ProjectGridSkeletonProps) {
  return (
    <div className={styles.grid} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <Skeleton className={styles.skeletonImage} />
          <Skeleton className={styles.skeletonLine} />
          <Skeleton className={styles.skeletonLineShort} />
        </div>
      ))}
    </div>
  );
}
