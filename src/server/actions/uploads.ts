"use server";

import { randomUUID } from "node:crypto";

import { del, put } from "@vercel/blob";

import { getAdminSession } from "@/lib/auth/guards";
import { env } from "@/lib/env";
import { isBlobUrl } from "@/lib/security/images";
import {
  detectImageType,
  IMAGE_EXTENSION,
  IMAGE_MIME,
  type RasterImageType,
} from "@/lib/security/magic-bytes";
import { assertSameOrigin } from "@/lib/security/origin";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ALLOWED_MIME = new Set(Object.values(IMAGE_MIME));
const INVALID_REQUEST_ERROR = "Permintaan tidak valid. Muat ulang halaman lalu coba lagi.";
const FORBIDDEN_ERROR = "Kamu tidak memiliki akses ke tindakan ini.";
const INVALID_IMAGE_ERROR = "Gambar tidak valid. Gunakan JPEG, PNG, atau WebP maksimal 3 MB.";
const STORAGE_ERROR = "Penyimpanan gambar belum dikonfigurasi.";
const UPLOAD_ERROR = "Gagal mengunggah gambar. Coba lagi.";

export type UploadActionResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export type UploadScope = "projects" | "profiles";

function extensionFor(type: RasterImageType): string {
  return IMAGE_EXTENSION[type];
}

function parseScope(value: FormDataEntryValue | null): UploadScope {
  return value === "profiles" ? "profiles" : "projects";
}

export async function uploadImageAction(formData: FormData): Promise<UploadActionResult> {
  if (!(await getAdminSession())) {
    return { ok: false, error: FORBIDDEN_ERROR };
  }

  try {
    await assertSameOrigin();
  } catch {
    return { ok: false, error: INVALID_REQUEST_ERROR };
  }

  const token = env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return { ok: false, error: STORAGE_ERROR };
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { ok: false, error: INVALID_IMAGE_ERROR };
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES || !ALLOWED_MIME.has(file.type)) {
    return { ok: false, error: INVALID_IMAGE_ERROR };
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const detectedType = detectImageType(bytes);

    if (!detectedType || IMAGE_MIME[detectedType] !== file.type) {
      return { ok: false, error: INVALID_IMAGE_ERROR };
    }

    const pathname = `${parseScope(formData.get("scope"))}/${randomUUID()}/${randomUUID()}.${extensionFor(detectedType)}`;
    const blob = await put(pathname, Buffer.from(bytes), {
      access: "public",
      token,
      contentType: IMAGE_MIME[detectedType],
      addRandomSuffix: false,
    });

    return { ok: true, url: blob.url };
  } catch (error) {
    console.error("Failed to upload image to Blob.", error);

    return { ok: false, error: UPLOAD_ERROR };
  }
}

export async function discardUploadAction(url: string): Promise<{ ok: boolean }> {
  if (!(await getAdminSession())) {
    return { ok: false };
  }

  try {
    await assertSameOrigin();
  } catch {
    return { ok: false };
  }

  const token = env.BLOB_READ_WRITE_TOKEN;

  if (!token || !isBlobUrl(url)) {
    return { ok: false };
  }

  try {
    await del(url, { token });

    return { ok: true };
  } catch (error) {
    console.error("Failed to discard uploaded image.", error);

    return { ok: false };
  }
}
