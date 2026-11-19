import { LoadingStatus } from "@/components/ui/LoadingStatus";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import styles from "./profil-kelas.module.css";

export default function ClassProfileLoading() {
  return (
    <>
      <LoadingStatus label="Memuat profil kelas…" />
      <section className={cn("container", styles.page)} aria-busy="true">
        <nav className={styles.backNav} aria-hidden="true">
          <Skeleton style={{ width: 140, height: 24, borderRadius: "var(--radius-sm)" }} />
        </nav>

        <section className={styles.hero} aria-hidden="true">
          <div className={styles.heroMedia}>
            <Skeleton style={{ width: "100%", height: "100%", minHeight: 320 }} />
          </div>
          <div className={styles.heroBody}>
            <Skeleton style={{ width: 90, height: 16 }} />
            <Skeleton style={{ width: "70%", height: 40 }} />
            <Skeleton style={{ width: "50%", height: 24 }} />
            <div style={{ display: "grid", gap: 10, marginBlock: 8 }}>
              <Skeleton style={{ width: "100%", height: 16 }} />
              <Skeleton style={{ width: "95%", height: 16 }} />
              <Skeleton style={{ width: "80%", height: 16 }} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Skeleton style={{ width: 110, height: 36, borderRadius: "var(--radius)" }} />
              <Skeleton style={{ width: 110, height: 36, borderRadius: "var(--radius)" }} />
            </div>
          </div>
        </section>

        <section className={styles.section} aria-hidden="true">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeading}>
              <Skeleton style={{ width: 80, height: 14 }} />
              <Skeleton style={{ width: 200, height: 28, marginBlock: 6 }} />
              <Skeleton style={{ width: 280, height: 16 }} />
            </div>
            <Skeleton style={{ width: 80, height: 28, borderRadius: "var(--radius-sm)" }} />
          </div>

          <div
            style={{
              display: "grid",
              gap: "var(--space-4)",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            }}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                style={{
                  border: "var(--border)",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  background: "var(--color-surface)",
                  boxShadow: "var(--shadow)",
                }}
              >
                <Skeleton style={{ width: "100%", aspectRatio: "4 / 5" }} />
                <div style={{ padding: "var(--space-3) var(--space-4)", display: "grid", gap: 6 }}>
                  <Skeleton style={{ width: "80%", height: 20 }} />
                  <Skeleton style={{ width: "50%", height: 14 }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </>
  );
}
