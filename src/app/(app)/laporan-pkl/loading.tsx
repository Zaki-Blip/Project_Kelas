import { LoadingStatus } from "@/components/ui/LoadingStatus";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import pageStyles from "../app-pages.module.css";
import styles from "./laporan-pkl.module.css";

export default function PklReportLoading() {
  return (
    <>
      <LoadingStatus label="Memuat laporan PKL…" />
      <section className={cn("container", pageStyles.page)} aria-busy="true">
        <header className={pageStyles.header} aria-hidden="true">
          <Skeleton style={{ width: 60, height: 16 }} />
          <Skeleton style={{ width: "60%", height: 42, marginBlock: 6 }} />
          <Skeleton style={{ width: "90%", height: 20 }} />
        </header>

        <div
          className={cn(pageStyles.panel, styles.panel)}
          aria-hidden="true"
        >
          <Skeleton style={{ width: 120, height: 26 }} />
          <Skeleton
            style={{ width: 64, height: 64, borderRadius: 18 }}
          />
          <Skeleton style={{ width: "70%", height: 32 }} />
          <Skeleton style={{ width: "100%", height: 20 }} />
          <Skeleton style={{ width: "92%", height: 20 }} />
          <Skeleton
            style={{ width: "100%", height: 120, borderRadius: "var(--radius)" }}
          />
          <Skeleton
            style={{ width: 150, height: 44, borderRadius: "var(--radius)" }}
          />
        </div>
      </section>
    </>
  );
}
