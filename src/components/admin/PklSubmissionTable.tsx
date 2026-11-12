import Link from "next/link";

import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { cn } from "@/lib/cn";
import type { PklSubmissionSummary } from "@/lib/pkl/types";
import { isSafeReportUrl } from "@/lib/validation/pkl";
import {
  deletePklSubmissionAction,
  reviewPklSubmissionAction,
} from "@/server/actions/admin-pkl";
import styles from "./PklSubmissionTable.module.css";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const statusLabels = {
  SUBMITTED: "Menunggu",
  REVIEWED: "Ditinjau",
  REVISION: "Revisi",
} as const;

type PklSubmissionTableProps = {
  items: PklSubmissionSummary[];
  returnTo: string;
};

export function PklSubmissionTable({ items, returnTo }: PklSubmissionTableProps) {
  return (
    <div
      className={styles.wrap}
      role="region"
      aria-label="Tabel laporan PKL, geser ke samping untuk melihat semua kolom"
      tabIndex={0}
    >
      <table className={styles.table}>
        <caption className="visuallyHidden">Daftar laporan PKL</caption>
        <thead>
          <tr>
            <th scope="col">Siswa</th>
            <th scope="col">Laporan</th>
            <th scope="col">Status</th>
            <th scope="col">Diperbarui</th>
            <th scope="col">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const safeReportUrl = isSafeReportUrl(item.reportUrl)
              ? item.reportUrl
              : null;

            return (
              <tr key={item.id}>
                <td>
                  <span className={styles.name}>{item.user.fullName}</span>
                  <span className={styles.username}>@{item.user.username}</span>
                </td>
                <td>
                  <span className={styles.reportTitle}>{item.title}</span>
                  <span className={styles.company}>{item.company}</span>
                </td>
                <td>
                  <span
                    className={cn(
                      styles.badge,
                      styles[item.status.toLowerCase()],
                    )}
                  >
                    {statusLabels[item.status]}
                  </span>
                </td>
                <td>
                  <time dateTime={item.updatedAt.toISOString()}>
                    {dateFormatter.format(item.updatedAt)}
                  </time>
                </td>
                <td>
                  <div className={styles.actions}>
                    {safeReportUrl ? (
                      <Link
                        href={safeReportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.actionLink}
                      >
                        Buka
                      </Link>
                    ) : (
                      <span className={styles.invalidLink}>Tautan tidak valid</span>
                    )}

                    <details className={styles.review}>
                      <summary className={styles.reviewSummary}>Tinjau</summary>
                      <form action={reviewPklSubmissionAction} className={styles.reviewForm}>
                        <input type="hidden" name="submissionId" value={item.id} />
                        <input type="hidden" name="returnTo" value={returnTo} />

                        <label className={styles.reviewLabel}>
                          Status
                          <select
                            name="status"
                            defaultValue={item.status}
                            className={styles.select}
                          >
                            <option value="SUBMITTED">Menunggu tinjauan</option>
                            <option value="REVIEWED">Sudah ditinjau</option>
                            <option value="REVISION">Perlu revisi</option>
                          </select>
                        </label>

                        <label className={styles.reviewLabel}>
                          Catatan
                          <textarea
                            name="reviewNote"
                            defaultValue={item.reviewNote ?? ""}
                            rows={3}
                            maxLength={1000}
                            className={styles.textarea}
                          />
                        </label>

                        <SubmitButton pendingLabel="Menyimpan…">
                          Simpan Tinjauan
                        </SubmitButton>
                      </form>
                    </details>

                    <ConfirmDeleteButton
                      action={deletePklSubmissionAction}
                      fields={{ submissionId: item.id, returnTo }}
                      title={`Hapus laporan ${item.user.fullName}?`}
                      description="Laporan PKL ini akan dihapus dari daftar pengumpulan. Tindakan ini tidak bisa dibatalkan."
                      confirmLabel="Hapus Laporan"
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
