"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";

import { SubmitButton } from "@/components/ui/SubmitButton";
import { submitFeedbackAction } from "@/server/actions/feedback";
import type { FeedbackActionState } from "@/types/action";
import styles from "./FeedbackForm.module.css";

type FeedbackFormProps = {
  user: {
    fullName: string;
  };
};

export function FeedbackForm({ user }: FeedbackFormProps) {
  const [state, formAction] = useActionState<
    FeedbackActionState | undefined,
    FormData
  >(submitFeedbackAction, undefined);
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorSummaryId = useId();
  const [message, setMessage] = useState("");

  const errors = state?.fieldErrors;
  const categoryError = errors?.category?.[0];
  const messageError = errors?.message?.[0];
  const errorMessages = Array.from(
    new Set(
      [state?.formError, ...Object.values(errors ?? {}).flat()].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  );

  useEffect(() => {
    if (state?.formError || state?.fieldErrors) {
      summaryRef.current?.focus();
    }
  }, [state]);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {errorMessages.length > 0 ? (
        <div
          id={errorSummaryId}
          ref={summaryRef}
          className={styles.alert}
          role="alert"
          tabIndex={-1}
        >
          <strong>Periksa kembali tanggapanmu.</strong>
          <ul>
            {errorMessages.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className={styles.identity}>
        Dikirim sebagai <strong>{user.fullName}</strong>. Email akunmu ikut
        terkirim agar pengelola bisa membalas.
      </p>

      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="feedback-gotcha">Jangan diisi</label>
        <input
          id="feedback-gotcha"
          name="_gotcha"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="feedback-category">
          Jenis tanggapan
        </label>
        <select
          id="feedback-category"
          name="category"
          className={styles.input}
          defaultValue="saran"
          aria-invalid={categoryError ? true : undefined}
          aria-describedby={
            categoryError ? "feedback-category-error" : undefined
          }
        >
          <option value="saran">Saran</option>
          <option value="masukan">Masukan tampilan</option>
          <option value="bug">Laporan bug</option>
          <option value="lainnya">Lainnya</option>
        </select>
        {categoryError ? (
          <p id="feedback-category-error" className={styles.error} role="alert">
            {categoryError}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="feedback-message">
          Tanggapan
        </label>
        <textarea
          id="feedback-message"
          name="message"
          className={styles.input}
          rows={5}
          minLength={10}
          maxLength={1000}
          required
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-invalid={messageError ? true : undefined}
          aria-describedby={
            [
              "feedback-message-hint",
              messageError ? "feedback-message-error" : null,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
        <div className={styles.metaRow}>
          <p id="feedback-message-hint" className={styles.hint}>
            Ceritakan saran, masukan, atau kendala yang kamu temui. Minimal 10
            karakter.
          </p>
          <span className={styles.counter}>{message.length}/1000</span>
        </div>
        {messageError ? (
          <p id="feedback-message-error" className={styles.error} role="alert">
            {messageError}
          </p>
        ) : null}
      </div>

      <div className={styles.actions}>
        <SubmitButton pendingLabel="Mengirim…">Kirim Tanggapan</SubmitButton>
        <p className={styles.privacy}>Dikirim melalui Formspree.</p>
      </div>
    </form>
  );
}
