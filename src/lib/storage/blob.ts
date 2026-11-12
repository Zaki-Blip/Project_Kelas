import "server-only";

import { del } from "@vercel/blob";

import { env } from "@/lib/env";
import { isBlobUrl } from "@/lib/security/images";

/**
 * Deletes Blob objects without failing the surrounding mutation. Seed assets
 * are skipped because they live in the repository, not object storage.
 */
export async function deleteBlobsBestEffort(
  urls: Array<string | null | undefined>,
): Promise<void> {
  const blobUrls = Array.from(
    new Set(urls.filter((url): url is string => Boolean(url && isBlobUrl(url)))),
  );

  if (blobUrls.length === 0) {
    return;
  }

  if (!env.BLOB_READ_WRITE_TOKEN) {
    console.warn("Skipping Blob cleanup because BLOB_READ_WRITE_TOKEN is not configured.");
    return;
  }

  try {
    await del(blobUrls, { token: env.BLOB_READ_WRITE_TOKEN });
  } catch (error) {
    console.error("Failed to delete Blob objects.", error);
  }
}
