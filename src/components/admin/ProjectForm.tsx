"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
  ScreenshotUploader,
  ThumbnailUploader,
  type EditableImage,
} from "@/components/admin/ImageUploader";
import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type {
  AdminProjectEditData,
  AdminTaxonomyOptions,
  AdminUserOption,
} from "@/lib/admin/types";
import { cn } from "@/lib/cn";
import { slugify } from "@/lib/slug";
import { saveProjectAction } from "@/server/actions/admin-projects";
import styles from "./ProjectForm.module.css";

type ProjectFormProps = {
  mode: "create" | "edit";
  project?: AdminProjectEditData;
  taxonomies: AdminTaxonomyOptions;
  users: AdminUserOption[];
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
  label: string;
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

export function ProjectForm({
  mode,
  project,
  taxonomies,
  users,
  returnTo,
}: ProjectFormProps) {
  const [state, formAction, pending] = useActionState(saveProjectAction, undefined);
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorSummaryId = useId();

  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [summary, setSummary] = useState(project?.summary ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [categoryId, setCategoryId] = useState(project?.categoryId ?? "");
  const [creatorId, setCreatorId] = useState(project?.creatorId ?? "");
  const [memberIds, setMemberIds] = useState<string[]>(project?.memberIds ?? []);
  const [technologyIds, setTechnologyIds] = useState<string[]>(
    project?.technologyIds ?? [],
  );
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? "");
  const [previewUrl, setPreviewUrl] = useState(project?.previewUrl ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    project?.status ?? "DRAFT",
  );
  const [thumbnailPath, setThumbnailPath] = useState(project?.thumbnailPath ?? "");
  const [images, setImages] = useState<EditableImage[]>(project?.images ?? []);
  const [thumbnailBusy, setThumbnailBusy] = useState(false);
  const [screenshotBusy, setScreenshotBusy] = useState(false);
  const mediaBusy = thumbnailBusy || screenshotBusy;

  const errors = state?.fieldErrors;
  const errorMessages = Array.from(
    new Set(
      [
        state?.formError,
        ...Object.values(errors ?? {}).flat(),
      ].filter((message): message is string => Boolean(message)),
    ),
  );

  const memberOptions = users.filter((user) => user.id !== creatorId);

  useEffect(() => {
    if (state?.formError || state?.fieldErrors) {
      summaryRef.current?.focus();
    }
  }, [state]);

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slugEdited) {
      setSlug(slugify(value, 160));
    }
  }

  function handleCreatorChange(value: string) {
    setCreatorId(value);
    setMemberIds((current) => current.filter((id) => id !== value));
  }

  function toggleMember(userId: string) {
    setMemberIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  }

  function toggleTechnology(technologyId: string) {
    setTechnologyIds((current) =>
      current.includes(technologyId)
        ? current.filter((id) => id !== technologyId)
        : [...current, technologyId],
    );
  }

  return (
    <form
      action={formAction}
      className={styles.form}
      aria-busy={pending}
      aria-label={mode === "edit" ? "Form edit project" : "Form tambah project"}
    >
      {project ? <input type="hidden" name="projectId" value={project.id} /> : null}
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="thumbnailPath" value={thumbnailPath} />
      <input
        type="hidden"
        name="images"
        value={JSON.stringify(
          images.map((image, index) => ({
            url: image.url,
            caption: image.caption,
            sortOrder: index + 1,
          })),
        )}
      />

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
        <legend className={styles.legend}>Informasi project</legend>

        <div className={styles.grid}>
          <Field
            id="project-title"
            label="Judul project"
            hint="3–160 karakter."
            error={errors?.title}
            className={styles.fullWidth}
          >
            <input
              id="project-title"
              name="title"
              type="text"
              className={styles.control}
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              required
              minLength={3}
              maxLength={160}
              {...fieldA11y("project-title", true, errors?.title)}
            />
          </Field>

          <Field
            id="project-slug"
            label="Slug"
            hint="Huruf kecil, angka, dan tanda hubung. Dibuat otomatis dari judul."
            error={errors?.slug}
            className={styles.fullWidth}
          >
            <input
              id="project-slug"
              name="slug"
              type="text"
              className={styles.control}
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugEdited(true);
              }}
              required
              maxLength={160}
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              autoCapitalize="none"
              spellCheck={false}
              {...fieldA11y("project-slug", true, errors?.slug)}
            />
          </Field>

          <Field
            id="project-summary"
            label="Ringkasan"
            hint={`${summary.length}/280 karakter.`}
            error={errors?.summary}
            className={styles.fullWidth}
          >
            <textarea
              id="project-summary"
              name="summary"
              className={cn(styles.control, styles.textareaSmall)}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              required
              minLength={10}
              maxLength={280}
              rows={3}
              {...fieldA11y("project-summary", true, errors?.summary)}
            />
          </Field>

          <Field
            id="project-description"
            label="Deskripsi"
            hint="Minimal 20 karakter. Gunakan baris baru untuk memisahkan paragraf."
            error={errors?.description}
            className={styles.fullWidth}
          >
            <textarea
              id="project-description"
              name="description"
              className={cn(styles.control, styles.textarea)}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              minLength={20}
              maxLength={20_000}
              rows={10}
              {...fieldA11y("project-description", true, errors?.description)}
            />
          </Field>

          <Field
            id="project-category"
            label="Kategori"
            hint="Kategori yang dipakai untuk mengelompokkan project."
            error={errors?.categoryId}
          >
            <select
              id="project-category"
              name="categoryId"
              className={styles.control}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
              {...fieldA11y("project-category", true, errors?.categoryId)}
            >
              <option value="">Pilih kategori</option>
              {taxonomies.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <fieldset
            className={styles.fieldset}
            aria-describedby="project-status-hint"
            aria-invalid={errors?.status?.[0] ? true : undefined}
          >
            <legend className={styles.label}>Status</legend>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="status"
                  value="DRAFT"
                  checked={status === "DRAFT"}
                  onChange={() => setStatus("DRAFT")}
                />
                <span>
                  <strong>Draf</strong>
                  <small>Belum tampil di galeri.</small>
                </span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="status"
                  value="PUBLISHED"
                  checked={status === "PUBLISHED"}
                  onChange={() => setStatus("PUBLISHED")}
                />
                <span>
                  <strong>Terbit</strong>
                  <small>Tampil di galeri. Thumbnail wajib diisi.</small>
                </span>
              </label>
            </div>
            <p id="project-status-hint" className={styles.hint}>
              Kamu bisa menyimpan sebagai draf lalu menerbitkannya nanti.
            </p>
            {errors?.status?.[0] ? (
              <p className={styles.error} role="alert">
                {errors.status[0]}
              </p>
            ) : null}
          </fieldset>
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.legend}>Media</legend>

        <div className={styles.mediaGrid}>
          <div className={styles.mediaBlock}>
            <h2 className={styles.subheading}>Thumbnail</h2>
            <ThumbnailUploader
              value={thumbnailPath}
              onChange={setThumbnailPath}
              error={errors?.thumbnailPath}
              onBusyChange={setThumbnailBusy}
            />
          </div>

          <div className={styles.mediaBlock}>
            <h2 className={styles.subheading}>Screenshot</h2>
            <ScreenshotUploader
              images={images}
              onChange={setImages}
              error={errors?.images}
              onBusyChange={setScreenshotBusy}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.legend}>Tim</legend>

        <div className={styles.grid}>
          <Field
            id="project-creator"
            label="Creator"
            hint="User yang menjadi pembuat utama project."
            error={errors?.creatorId}
          >
            <select
              id="project-creator"
              name="creatorId"
              className={styles.control}
              value={creatorId}
              onChange={(event) => handleCreatorChange(event.target.value)}
              required
              {...fieldA11y("project-creator", true, errors?.creatorId)}
            >
              <option value="">Pilih creator</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName} (@{user.username})
                </option>
              ))}
            </select>
          </Field>

          <fieldset
            className={styles.fieldset}
            aria-describedby="project-members-hint"
            aria-invalid={errors?.memberIds?.[0] ? true : undefined}
          >
            <legend className={styles.label}>Anggota tim</legend>
            {memberOptions.length > 0 ? (
              <div className={styles.checkboxGrid}>
                {memberOptions.map((user) => (
                  <label key={user.id} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="memberIds"
                      value={user.id}
                      checked={memberIds.includes(user.id)}
                      onChange={() => toggleMember(user.id)}
                    />
                    <span>
                      <strong>{user.fullName}</strong>
                      <small>@{user.username}</small>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className={styles.hint}>Belum ada anggota lain yang bisa dipilih.</p>
            )}
            <p id="project-members-hint" className={styles.hint}>
              Creator tidak perlu dipilih lagi di sini.
            </p>
            {errors?.memberIds?.[0] ? (
              <p className={styles.error} role="alert">
                {errors.memberIds[0]}
              </p>
            ) : null}
          </fieldset>
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.legend}>Teknologi</legend>

        <fieldset
          className={styles.fieldset}
          aria-describedby="project-technologies-hint"
          aria-invalid={errors?.technologyIds?.[0] ? true : undefined}
        >
          <legend className={styles.label}>Teknologi yang dipakai</legend>
          <div className={styles.checkboxGrid}>
            {taxonomies.technologies.map((technology) => (
              <label key={technology.id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="technologyIds"
                  value={technology.id}
                  checked={technologyIds.includes(technology.id)}
                  onChange={() => toggleTechnology(technology.id)}
                />
                <span>
                  <strong>{technology.name}</strong>
                  <small>{technology.slug}</small>
                </span>
              </label>
            ))}
          </div>
          <p id="project-technologies-hint" className={styles.hint}>
            Pilih teknologi yang relevan agar project mudah ditemukan.
          </p>
          {errors?.technologyIds?.[0] ? (
            <p className={styles.error} role="alert">
              {errors.technologyIds[0]}
            </p>
          ) : null}
        </fieldset>
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.legend}>Tautan</legend>

        <div className={styles.grid}>
          <Field
            id="project-github"
            label="URL GitHub"
            hint="Opsional. Gunakan URL https://github.com/..."
            error={errors?.githubUrl}
          >
            <input
              id="project-github"
              name="githubUrl"
              type="url"
              className={styles.control}
              value={githubUrl}
              onChange={(event) => setGithubUrl(event.target.value)}
              maxLength={2048}
              placeholder="https://github.com/username/repository"
              {...fieldA11y("project-github", true, errors?.githubUrl)}
            />
          </Field>

          <Field
            id="project-preview"
            label="URL Live Preview"
            hint="Opsional. Wajib HTTPS dan domain harus ada di allowlist preview."
            error={errors?.previewUrl}
          >
            <input
              id="project-preview"
              name="previewUrl"
              type="url"
              className={styles.control}
              value={previewUrl}
              onChange={(event) => setPreviewUrl(event.target.value)}
              maxLength={2048}
              placeholder="https://project.vercel.app"
              {...fieldA11y("project-preview", true, errors?.previewUrl)}
            />
          </Field>
        </div>
      </fieldset>

      <div className={styles.actionBar}>
        <p className={styles.actionHint}>
          {status === "DRAFT"
            ? "Project disimpan sebagai draf dan belum tampil di galeri."
            : "Project akan tampil di galeri setelah disimpan."}
        </p>
        <div className={styles.actionButtons}>
          <Button href="/admin" variant="outline">
            Batal
          </Button>
          <SubmitButton pendingLabel="Menyimpan…" disabled={mediaBusy}>
            {status === "DRAFT" ? "Simpan Draft" : "Simpan & Terbitkan"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
