"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { cn } from "@/lib/cn";
import type { PklSubmissionSummary } from "@/lib/pkl/types";
import { savePklSubmissionAction } from "@/server/actions/pkl";
import styles from "./PklReportForm.module.css";

const statusLabels = {
  SUBMITTED: "Menunggu tinjauan",
  REVIEWED: "Sudah ditinjau",
  REVISION: "Perlu revisi",
} as const;

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

type PklReportFormProps = {
  submission: PklSubmissionSummary | null;
  notice?: string | null;
};

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string[];
  children: ReactNode;
}) {
  const errorMessage = error?.[0];
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = errorMessage ? `${id}-error` : undefined;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {children}
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {errorMessage ? (
        <p id={errorId} className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export function PklReportForm({ submission, notice }: PklReportFormProps) {
  const [state, formAction] = useActionState(savePklSubmissionAction, undefined);
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorSummaryId = useId();

  const [title, setTitle] = useState(submission?.title ?? "");
  const [company, setCompany] = useState(submission?.company ?? "");
  const [summary, setSummary] = useState(submission?.summary ?? "");
  const [reportUrl, setReportUrl] = useState(submission?.reportUrl ?? "");

  const readOnly = submission?.status === "REVIEWED";
  const errors = state?.fieldErrors;
  const errorMessages = Array.from(
    new Set(
      [state?.formError, ...Object.values(errors ?? {}).flat()].filter(
        (message): message is string => Boolean(message),
      ),
    ),
  );

  useEffect(() => {
    if (state?.formError || state?.fieldErrors) {
      summaryRef.current?.focus();
    }
  }, [state]);

  const inputProps = {
    className: styles.input,
    readOnly,
    "aria-readonly": readOnly || undefined,
  } as const;

  return (
    <div className={styles.layout}>
      <section className={styles.card} aria-labelledby="pkl-form-title">
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.eyebrow}>Pengumpulan</p>
            <h2 id="pkl-form-title" className={styles.cardTitle}>
              {submission ? "Laporan Kamu" : "Kumpulkan Laporan PKL"}
            </h2>
          </div>
          {submission ? (
            <span className={cn(styles.badge, styles[submission.status.toLowerCase()])}>
              {statusLabels[submission.status]}
            </span>
          ) : null}
        </div>

        {notice ? (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        ) : null}

        {submission ? (
          <p className={styles.meta}>
            Terakhir diperbarui {dateFormatter.format(submission.updatedAt)}
            {submission.reviewedAt
              ? ` · Ditinjau ${dateFormatter.format(submission.reviewedAt)}`
              : null}
          </p>
        ) : (
          <p className={styles.text}>
            Kumpulkan judul, tempat PKL, ringkasan, dan tautan laporan kamu. Satu akun
            hanya dapat memiliki satu laporan dan dapat memperbaruinya selama belum
            ditinjau.
          </p>
        )}

        {submission?.reviewNote ? (
          <div className={styles.reviewNote} role="note">
            <strong>Catatan pengelola:</strong>
            <p>{submission.reviewNote}</p>
          </div>
        ) : null}

        {readOnly ? (
          <p className={styles.readOnly}>
            Laporan ini sudah ditinjau dan tidak dapat diubah. Hubungi pengelola jika
            kamu perlu melakukan revisi.
          </p>
        ) : null}

        <form action={formAction} className={styles.form} noValidate>
          {errorMessages.length > 0 ? (
            <div
              id={errorSummaryId}
              ref={summaryRef}
              className={styles.alert}
              role="alert"
              tabIndex={-1}
            >
              <strong>Periksa kembali data laporan.</strong>
              <ul>
                {errorMessages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <Field id="pkl-title" label="Judul laporan" error={errors?.title}>
            <input
              id="pkl-title"
              name="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={160}
              required
              autoComplete="off"
              aria-invalid={errors?.title?.[0] ? true : undefined}
              aria-describedby={errors?.title?.[0] ? "pkl-title-error" : undefined}
              {...inputProps}
            />
          </Field>

          <Field id="pkl-company" label="Tempat PKL" error={errors?.company}>
            <input
              id="pkl-company"
              name="company"
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              maxLength={120}
              required
              autoComplete="organization"
              aria-invalid={errors?.company?.[0] ? true : undefined}
              aria-describedby={errors?.company?.[0] ? "pkl-company-error" : undefined}
              {...inputProps}
            />
          </Field>

          <Field
            id="pkl-summary"
            label="Ringkasan laporan"
            hint="Ceritakan singkat kegiatan, hasil, dan pembelajaran selama PKL."
            error={errors?.summary}
          >
            <textarea
              id="pkl-summary"
              name="summary"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={6}
              maxLength={2000}
              required
              aria-invalid={errors?.summary?.[0] ? true : undefined}
              aria-describedby={
                [
                  "pkl-summary-hint",
                  errors?.summary?.[0] ? "pkl-summary-error" : null,
                ]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              {...inputProps}
            />
          </Field>

          <Field
            id="pkl-report-url"
            label="Tautan laporan"
            hint="Gunakan tautan HTTPS, misalnya Google Drive atau OneDrive. Pastikan aksesnya dapat dibuka pengelola."
            error={errors?.reportUrl}
          >
            <input
              id="pkl-report-url"
              name="reportUrl"
              type="url"
              inputMode="url"
              value={reportUrl}
              onChange={(event) => setReportUrl(event.target.value)}
              maxLength={2048}
              required
              autoComplete="url"
              spellCheck={false}
              aria-invalid={errors?.reportUrl?.[0] ? true : undefined}
              aria-describedby={
                [
                  "pkl-report-url-hint",
                  errors?.reportUrl?.[0] ? "pkl-report-url-error" : null,
                ]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              {...inputProps}
            />
          </Field>

          <div className={styles.actions}>
            {readOnly ? (
              <Button
                href={submission.reportUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Buka Laporan
              </Button>
            ) : (
              <>
                <SubmitButton pendingLabel="Mengirim…">
                  {submission ? "Simpan Perubahan" : "Kumpulkan Laporan"}
                </SubmitButton>
                {submission ? (
                  <Button
                    href={submission.reportUrl}
                    variant="outline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Buka Laporan
                  </Button>
                ) : null}
              </>
            )}
          </div>
        </form>
      </section>

      <aside className={styles.side} aria-labelledby="pkl-guide-title">
        <h2 id="pkl-guide-title" className={styles.sideTitle}>
          Panduan singkat
        </h2>
        <ol className={styles.guide}>
          <li>Siapkan laporan akhir PKL dalam format PDF atau dokumen daring.</li>
          <li>Unggah ke penyimpanan awan dan atur izin agar dapat dibaca pengelola.</li>
          <li>Tempel tautan HTTPS pada formulir, lalu kirim laporan.</li>
          <li>Pantau status di halaman ini. Jika perlu revisi, perbarui laporanmu.</li>
        </ol>
      </aside>
    </div>
  );
}
