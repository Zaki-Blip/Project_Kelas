import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import styles from "./admin.module.css";

export default function AdminLoading() {
  return (
    <section className={cn("container", styles.page)} aria-busy="true">
      <span className="visuallyHidden">Memuat panel pengelola…</span>

      <div className={styles.header}>
        <div className={styles.headerText}>
          <Skeleton style={{ width: 100, height: 14 }} />
          <Skeleton style={{ width: "min(100%, 360px)", height: 48 }} />
          <Skeleton style={{ width: "min(100%, 560px)", height: 20 }} />
        </div>
        <Skeleton style={{ width: 160, height: 44 }} />
      </div>

      <AdminTableSkeleton rows={6} />
    </section>
  );
}
