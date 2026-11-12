const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";
const SEED_IMAGE_PATH = /^\/seed\/(?:thumbnails|screenshots)\/[a-z0-9-]+\.(?:png|jpe?g|webp)$/i;

/**
 * Returns true only for HTTPS Vercel Blob public URLs. Credentials and custom
 * ports are rejected so a stored value can never point at a lookalike host.
 */
export function isBlobUrl(value: string): boolean {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.username.length === 0 &&
      url.password.length === 0 &&
      url.port.length === 0 &&
      url.hostname.endsWith(BLOB_HOST_SUFFIX) &&
      url.hostname.length > BLOB_HOST_SUFFIX.length
    );
  } catch {
    return false;
  }
}

/**
 * Image paths accepted from the admin form. Only bundled seed assets and
 * uploads from our Blob store are allowed.
 */
export function isAllowedImagePath(value: string): boolean {
  if (!value) {
    return false;
  }

  return SEED_IMAGE_PATH.test(value) || isBlobUrl(value);
}
