"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

import { ProfilePhotoUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { cn } from "@/lib/cn";
import type { StudentProfileData } from "@/lib/profiles/types";
import { saveStudentProfileAction } from "@/server/actions/admin-profiles";
import styles from "./ProfileForm.module.css";

type StudentProfileFormProps = {
  student?: StudentProfileData | null;
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

export function StudentProfileForm({
  student,
  returnTo,
}: StudentProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    saveStudentProfileAction,
    undefined,
  );
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorSummaryId = useId();

  const [name, setName] = useState(student?.name ?? "");
  const [role, setRole] = useState(student?.role ?? "");
  const [bio, setBio] = useState(student?.bio ?? "");
  const [photoPath, setPhotoPath] = useState(student?.photoPath ?? "");
  const [socialLinks, setSocialLinks] = useState(student?.socialLinks ?? "");
  const [sortOrder, setSortOrder] = useState(
    student ? String(student.sortOrder) : "0",
  );
  const [isVisible, setIsVisible] = useState(student?.isVisible ?? true);
  const [photoBusy, setPhotoBusy] = useState(false);

  const isEdit = Boolean(student);
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
      aria-label={isEdit ? "Form edit profil siswa" : "Form tambah profil siswa"}
    >
      {student ? <input type="hidden" name="studentId" value={student.id} /> : null}
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
        <legend className={styles.legend}>Identitas siswa</legend>

        <div className={styles.grid}>
          <Field
            id="student-name"
            label={
              <>
                Nama siswa <span className={styles.required}>*</span>
              </>
            }
            hint="2–80 karakter."
            error={errors?.name}
          >
            <input
              id="student-name"
              name="name"
              type="text"
              className={styles.control}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              maxLength={80}
              {...fieldA11y("student-name", true, errors?.name)}
            />
          </Field>

          <Field
            id="student-role"
            label="Peran"
            hint="Opsional. Contoh: Ketua Kelas, Sekretaris."
            error={errors?.role}
          >
            <input
              id="student-role"
              name="role"
              type="text"
              className={styles.control}
              value={role}
              onChange={(event) => setRole(event.target.value)}
              maxLength={80}
              {...fieldA11y("student-role", true, errors?.role)}
            />
          </Field>

          <Field
            id="student-bio"
            label="Bio singkat"
            hint={`Opsional. ${bio.length}/500 karakter.`}
            error={errors?.bio}
            className={styles.fullWidth}
          >
            <textarea
              id="student-bio"
              name="bio"
              className={cn(styles.control, styles.textareaSmall)}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={500}
              rows={4}
              {...fieldA11y("student-bio", true, errors?.bio)}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.legend}>Foto siswa</legend>

        <div className={styles.mediaBlock}>
          <h2 className={styles.subheading}>
            Foto profil <span className={styles.required}>*</span>
          </h2>
          <ProfilePhotoUploader
            value={photoPath}
            onChange={setPhotoPath}
            error={errors?.photoPath}
            onBusyChange={setPhotoBusy}
            previewAlt={`Pratinjau foto ${name || "siswa"}`}
          />
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.legend}>Tautan sosial</legend>

        <Field
          id="student-social-links"
          label="Tautan sosial"
          hint="Opsional. Satu URL per baris, maksimal 5. Platform terdeteksi otomatis dari domain."
          error={errors?.socialLinks}
          className={styles.fullWidth}
        >
          <textarea
            id="student-social-links"
            name="socialLinks"
            className={cn(styles.control, styles.textareaSmall)}
            value={socialLinks}
            onChange={(event) => setSocialLinks(event.target.value)}
            maxLength={12000}
            rows={5}
            spellCheck={false}
            placeholder={"https://www.instagram.com/username\nhttps://github.com/username"}
            {...fieldA11y("student-social-links", true, errors?.socialLinks)}
          />
        </Field>
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.legend}>Pengaturan tampilan</legend>

        <div className={styles.grid}>
          <Field
            id="student-sort-order"
            label="Urutan tampil"
            hint="Angka kecil tampil lebih dulu. 0–999."
            error={errors?.sortOrder}
          >
            <input
              id="student-sort-order"
              name="sortOrder"
              type="number"
              className={styles.control}
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              min={0}
              max={999}
              step={1}
              {...fieldA11y("student-sort-order", true, errors?.sortOrder)}
            />
          </Field>

          <fieldset
            className={styles.fieldset}
            aria-describedby={
              errors?.isVisible?.[0]
                ? "student-visible-hint student-visible-error"
                : "student-visible-hint"
            }
            aria-invalid={errors?.isVisible?.[0] ? true : undefined}
          >
            <legend className={styles.label}>Visibilitas</legend>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isVisible"
                checked={isVisible}
                onChange={(event) => setIsVisible(event.target.checked)}
                aria-describedby={
                  errors?.isVisible?.[0]
                    ? "student-visible-hint student-visible-error"
                    : "student-visible-hint"
                }
                aria-invalid={errors?.isVisible?.[0] ? true : undefined}
              />
              <span>
                <strong>Tampilkan di halaman profil kelas</strong>
                <small>
                  Jika dimatikan, profil tetap tersimpan tetapi tidak tampil untuk
                  pengunjung.
                </small>
              </span>
            </label>
            <p id="student-visible-hint" className={styles.hint}>
              Kamu bisa menyembunyikan profil tanpa menghapus datanya.
            </p>
            {errors?.isVisible?.[0] ? (
              <p id="student-visible-error" className={styles.error} role="alert">
                {errors.isVisible[0]}
              </p>
            ) : null}
          </fieldset>
        </div>
      </fieldset>

      <div className={styles.actionBar}>
        <p className={styles.actionHint}>
          Foto dan tautan sosial akan tampil di galeri serta modal profil siswa.
        </p>
        <div className={styles.actionButtons}>
          <Button href={returnTo} variant="outline">
            Batal
          </Button>
          <SubmitButton pendingLabel="Menyimpan…" disabled={photoBusy}>
            {isEdit ? "Simpan Perubahan" : "Tambah Siswa"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
