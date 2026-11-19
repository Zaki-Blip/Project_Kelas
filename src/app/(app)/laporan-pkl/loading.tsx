import { LoadingStatus } from "@/components/ui/LoadingStatus";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import pageStyles from "../app-pages.module.css";

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
          style={{
            marginTop: "var(--space-6)",
            maxWidth: 760,
            border: "var(--border)",
            borderRadius: "var(--radius)",
            padding: "var(--space-6)",
            background: "var(--color-surface)",
            boxShadow: "var(--shadow)",
            display: "grid",
            gap: "var(--space-5)",
          }}
          aria-hidden="true"
        >
          <Skeleton style={{ width: 180, height: 26 }} />
          <div style={{ display: "grid", gap: "var(--space-4)" }}>
            <div>
              <Skeleton style={{ width: 120, height: 16, marginBottom: 8 }} />
              <Skeleton style={{ width: "100%", height: 44, borderRadius: "var(--radius)" }} />
            </div>
            <div>
              <Skeleton style={{ width: 120, height: 16, marginBottom: 8 }} />
              <Skeleton style={{ width: "100%", height: 44, borderRadius: "var(--radius)" }} />
            </div>
            <div>
              <Skeleton style={{ width: 140, height: 16, marginBottom: 8 }} />
              <Skeleton style={{ width: "100%", height: 110, borderRadius: "var(--radius)" }} />
            </div>
            <div>
              <Skeleton style={{ width: 140, height: 16, marginBottom: 8 }} />
              <Skeleton style={{ width: "100%", height: 44, borderRadius: "var(--radius)" }} />
            </div>
          </div>
          <Skeleton style={{ width: 150, height: 44, borderRadius: "var(--radius)" }} />
        </div>
      </section>
    </>
  );
}
