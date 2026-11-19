"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

import { ProfilePhotoUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { cn } from "@/lib/cn";
import type { ClassProfileData } from "@/lib/profiles/types";
import { saveClassProfileAction } from "@/server/actions/admin-profiles";
import styles from "./ProfileForm.module.css";

type ClassProfileFormProps = {
  profile: ClassProfileData | null;
  returnTo: string;
};

function fieldA11y(id: string, hasHint: boolean, error?: string[]) {
  const describedBy = [
    hasHint ? `${id}-hint` : null,
    error?.[0] ? `${id}-error` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    "aria-describedby": describedBy || undefined,
    "aria-invalid": error?.[0] ? true : undefined,
  } as const;
}

function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string[];
  children: ReactNode;
  className?: string;
}) {
  const errorMessage = error?.[0];

  return (
    <div className={cn(styles.field, className)}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {errorMessage ? (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export function ClassProfileForm({ profile, returnTo }: ClassProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    saveClassProfileAction,
    undefined,
  );
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorSummaryId = useId();

  const [className, setClassName] = useState(profile?.className ?? "");
  const [tagline, setTagline] = useState(profile?.tagline ?? "");
  const [description, setDescription] = useState(profile?.description ?? "");
  const [photoPath, setPhotoPath] = useState(profile?.photoPath ?? "");
  const [photoBusy, setPhotoBusy] = useState(false);

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

  return (
    <form
      action={formAction}
      className={styles.form}
      aria-busy={pending}
      aria-label="Form profil kelas"
    >
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="photoPath" value={photoPath} />

      {errorMessages.length > 0 ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          className={styles.errorSummary}
          role="alert"
          aria-labelledby={`${errorSummaryId}-title`}
        >
          <h2 id={`${errorSummaryId}-title`} className={styles.errorSummaryTitle}>
            Periksa kembali form
          </h2>
          <ul className={styles.errorList}>
            {errorMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <fieldset className={styles.section}>
        <legend className={styles.legend}>Identitas kelas</legend>

        <div className={styles.grid}>
          <Field
            id="class-name"
            label={
              <>
                Nama kelas <span className={styles.required}>*</span>
              </>
            }
            hint="2–80 karakter. Contoh: XII RPL 1."
            error={errors?.className}
            className={styles.fullWidth}
          >
            <input
              id="class-name"
              name="className"
              type="text"
              className={styles.control}
              value={className}
              onChange={(event) => setClassName(event.target.value)}
              required
              minLength={2}
              maxLength={80}
              {...fieldA11y("class-name", true, errors?.className)}
            />
          </Field>

          <Field
            id="class-tagline"
            label="Tagline"
            hint={`Opsional. ${tagline.length}/120 karakter.`}
            error={errors?.tagline}
            className={styles.fullWidth}
          >
            <input
              id="class-tagline"
              name="tagline"
              type="text"
              className={styles.control}
              value={tagline}
              onChange={(event) => setTagline(event.target.value)}
              maxLength={120}
              placeholder="Kelas yang bikin ide jadi karya."
              {...fieldA11y("class-tagline", true, errors?.tagline)}
            />
          </Field>

          <Field
            id="class-description"
            label="Deskripsi"
            hint={`Opsional. ${description.length}/1000 karakter.`}
            error={errors?.description}
            className={styles.fullWidth}
          >
            <textarea
              id="class-description"
              name="description"
              className={cn(styles.control, styles.textarea)}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={1000}
              rows={6}
              {...fieldA11y("class-description", true, errors?.description)}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.legend}>Foto kelas</legend>

        <div className={styles.mediaBlock}>
          <h2 className={styles.subheading}>Foto utama</h2>
          <ProfilePhotoUploader
            value={photoPath}
            onChange={setPhotoPath}
            error={errors?.photoPath}
            onBusyChange={setPhotoBusy}
            previewAlt="Pratinjau foto kelas"
            placeholder="Belum ada foto kelas"
          />
        </div>
      </fieldset>

      <div className={styles.actionBar}>
        <p className={styles.actionHint}>
          Perubahan akan langsung tampil di halaman Profil Kelas.
        </p>
        <div className={styles.actionButtons}>
          <Button href="/profil-kelas" variant="outline">
            Lihat Halaman
          </Button>
          <SubmitButton pendingLabel="Menyimpan…" disabled={photoBusy}>
            Simpan Profil
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
