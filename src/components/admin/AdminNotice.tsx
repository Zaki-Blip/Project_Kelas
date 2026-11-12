import type { AdminNoticeData } from "@/lib/admin/notices";
import { cn } from "@/lib/cn";
import styles from "./AdminNotice.module.css";

export function AdminNotice({ notice }: { notice: AdminNoticeData | null }) {
  if (!notice) {
    return null;
  }

  return (
    <p
      className={cn(styles.notice, notice.kind === "error" ? styles.error : styles.success)}
      role={notice.kind === "error" ? "alert" : "status"}
    >
      {notice.message}
    </p>
  );
}
