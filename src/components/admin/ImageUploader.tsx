"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { cn } from "@/lib/cn";
import { discardUploadAction, uploadImageAction } from "@/server/actions/uploads";
import styles from "./ImageUploader.module.css";

export type EditableImage = {
  id?: string;
  url: string;
  caption: string;
};

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_SCREENSHOTS = 6;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Gunakan gambar JPEG, PNG, atau WebP.";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "Ukuran gambar maksimal 3 MB.";
  }

  return null;
}

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.set("file", file);

  return uploadImageAction(formData);
}

function discardNewUpload(url: string) {
  void discardUploadAction(url);
}

function useUploadState(onBusyChange?: (busy: boolean) => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setUploading(value: boolean) {
    setBusy(value);
    onBusyChange?.(value);
  }

  return { busy, error, setError, setUploading };
}

type ThumbnailUploaderProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string[];
  onBusyChange?: (busy: boolean) => void;
};

export function ThumbnailUploader({
  value,
  onChange,
  error,
  onBusyChange,
}: ThumbnailUploaderProps) {
  const inputId = useId();
  const newUrlsRef = useRef(new Set<string>());
  const { busy, error: uploadError, setError, setUploading } = useUploadState(onBusyChange);
  const errorMessage = error?.[0] ?? uploadError;

  async function handleFile(file: File) {
    const validation = validateFile(file);

    if (validation) {
      setError(validation);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const previous = value;

      if (previous && newUrlsRef.current.has(previous)) {
        newUrlsRef.current.delete(previous);
        discardNewUpload(previous);
      }

      const result = await uploadFile(file);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      newUrlsRef.current.add(result.url);
      onChange(result.url);
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    if (value && newUrlsRef.current.has(value)) {
      newUrlsRef.current.delete(value);
      discardNewUpload(value);
    }

    setError(null);
    onChange("");
  }

  return (
    <div className={styles.uploader}>
      <div className={styles.thumbnailPreview}>
        {value ? (
          <Image
            src={value}
            alt="Pratinjau thumbnail project"
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className={styles.image}
          />
        ) : (
          <span className={styles.placeholder}>Belum ada thumbnail</span>
        )}
      </div>

      <div className={styles.controls}>
        <label className={cn(styles.fileButton, busy && styles.fileButtonDisabled)}>
          {busy ? "Mengunggah…" : value ? "Ganti thumbnail" : "Pilih thumbnail"}
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={styles.fileInput}
            disabled={busy}
            onChange={(event) => {
              const input = event.currentTarget;
              const file = input.files?.[0];
              input.value = "";

              if (file) {
                void handleFile(file);
              }
            }}
            aria-describedby={`${inputId}-hint`}
          />
        </label>

        {value ? (
          <button
            type="button"
            className={styles.removeButton}
            onClick={handleRemove}
            disabled={busy}
          >
            Hapus thumbnail
          </button>
        ) : null}
      </div>

      <p id={`${inputId}-hint`} className={styles.hint}>
        JPEG, PNG, atau WebP. Maksimal 3 MB. Thumbnail wajib diisi sebelum project
        diterbitkan.
      </p>

      {errorMessage ? (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}

      {busy ? (
        <p className={styles.status} role="status">
          Mengunggah thumbnail…
        </p>
      ) : null}
    </div>
  );
}

type ScreenshotUploaderProps = {
  images: EditableImage[];
  onChange: Dispatch<SetStateAction<EditableImage[]>>;
  error?: string[];
  onBusyChange?: (busy: boolean) => void;
};

export function ScreenshotUploader({
  images,
  onChange,
  error,
  onBusyChange,
}: ScreenshotUploaderProps) {
  const inputId = useId();
  const newUrlsRef = useRef(new Set<string>());
  const { busy, error: uploadError, setError, setUploading } = useUploadState(onBusyChange);
  const errorMessage = error?.[0] ?? uploadError;
  const atLimit = images.length >= MAX_SCREENSHOTS;

  async function handleFiles(fileList: FileList) {
    const remaining = MAX_SCREENSHOTS - images.length;
    const files = Array.from(fileList);

    if (remaining <= 0) {
      setError("Maksimal 6 screenshot sudah tercapai.");
      return;
    }

    if (files.length > remaining) {
      setError(`Maksimal 6 screenshot. Hanya ${remaining} file yang diunggah.`);
    } else {
      setError(null);
    }

    setUploading(true);

    try {
      for (const file of files.slice(0, remaining)) {
        const validation = validateFile(file);

        if (validation) {
          setError(validation);
          break;
        }

        const result = await uploadFile(file);

        if (!result.ok) {
          setError(result.error);
          break;
        }

        newUrlsRef.current.add(result.url);
        onChange((current) => [...current, { url: result.url, caption: "" }]);
      }
    } finally {
      setUploading(false);
    }
  }

  function updateImage(index: number, patch: Partial<EditableImage>) {
    onChange((current) =>
      current.map((image, currentIndex) =>
        currentIndex === index ? { ...image, ...patch } : image,
      ),
    );
  }

  function removeImage(index: number) {
    const image = images[index];

    if (image && newUrlsRef.current.has(image.url)) {
      newUrlsRef.current.delete(image.url);
      discardNewUpload(image.url);
    }

    onChange((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    onChange((current) => {
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [item] = next.splice(index, 1);

      if (!item) {
        return current;
      }

      next.splice(targetIndex, 0, item);

      return next;
    });
  }

  return (
    <div className={styles.uploader}>
      <div className={styles.controls}>
        <label
          className={cn(
            styles.fileButton,
            (busy || atLimit) && styles.fileButtonDisabled,
          )}
        >
          {busy ? "Mengunggah…" : "Tambah screenshot"}
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className={styles.fileInput}
            disabled={busy || atLimit}
            onChange={(event) => {
              const input = event.currentTarget;
              const files = input.files;
              input.value = "";

              if (files && files.length > 0) {
                void handleFiles(files);
              }
            }}
            aria-describedby={`${inputId}-hint`}
          />
        </label>

        <span className={styles.counter}>
          {images.length}/{MAX_SCREENSHOTS} screenshot
        </span>
      </div>

      <p id={`${inputId}-hint`} className={styles.hint}>
        Maksimal 6 screenshot, 3 MB per gambar. Format JPEG, PNG, atau WebP.
      </p>

      {errorMessage ? (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}

      {busy ? (
        <p className={styles.status} role="status">
          Mengunggah screenshot…
        </p>
      ) : null}

      {images.length > 0 ? (
        <ol className={styles.screenshotList}>
          {images.map((image, index) => (
            <li key={`${image.url}-${index}`} className={styles.screenshotItem}>
              <div className={styles.screenshotPreview}>
                <Image
                  src={image.url}
                  alt={`Screenshot ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 220px"
                  className={styles.image}
                />
              </div>

              <div className={styles.screenshotFields}>
                <label
                  className={styles.captionLabel}
                  htmlFor={`${inputId}-caption-${index}`}
                >
                  Caption screenshot {index + 1}
                </label>
                <input
                  id={`${inputId}-caption-${index}`}
                  type="text"
                  className={styles.captionInput}
                  value={image.caption}
                  maxLength={200}
                  onChange={(event) => updateImage(index, { caption: event.target.value })}
                  placeholder="Opsional"
                />

                <div className={styles.screenshotActions}>
                  <button
                    type="button"
                    className={styles.smallButton}
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    aria-label={`Naikkan screenshot ${index + 1}`}
                  >
                    Naik
                  </button>
                  <button
                    type="button"
                    className={styles.smallButton}
                    onClick={() => moveImage(index, 1)}
                    disabled={index === images.length - 1}
                    aria-label={`Turunkan screenshot ${index + 1}`}
                  >
                    Turun
                  </button>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeImage(index)}
                    disabled={busy}
                    aria-label={`Hapus screenshot ${index + 1}`}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>Belum ada screenshot. Tambahkan gambar pendukung project.</p>
      )}
    </div>
  );
}
