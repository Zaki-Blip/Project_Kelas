import "server-only";

import { env } from "@/lib/env";
import {
  isPreviewHostAllowed,
  parsePreviewAllowedHosts,
} from "@/lib/preview/allowlist";

const FALLBACK_PATH = "/dashboard";
const AUTH_PATH_PREFIXES = ["/login", "/register"] as const;
const MAX_URL_LENGTH = 2048;
const GITHUB_HOSTS = new Set(["github.com", "www.github.com"]);

function isSafeHttpsUrl(value: string): URL | null {
  if (value.length === 0 || value.length > MAX_URL_LENGTH) {
    return null;
  }

  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" ||
      url.username.length > 0 ||
      url.password.length > 0 ||
      url.port.length > 0
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

export function getPreviewUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const url = isSafeHttpsUrl(value.trim());

  if (!url) {
    return null;
  }

  const allowedHosts = parsePreviewAllowedHosts(env.PREVIEW_ALLOWED_HOSTS);

  return isPreviewHostAllowed(url.hostname, allowedHosts) ? url.toString() : null;
}

export function getGitHubUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const url = isSafeHttpsUrl(value.trim());

  if (!url || !GITHUB_HOSTS.has(url.hostname.toLowerCase())) {
    return null;
  }

  return url.toString();
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function safeNextPath(value: string | null | undefined, fallback = FALLBACK_PATH): string {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();

  if (
    trimmed.length === 0 ||
    trimmed.length > 2048 ||
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(trimmed)
  ) {
    return fallback;
  }

  try {
    const baseUrl = new URL(env.APP_URL);
    const targetUrl = new URL(trimmed, baseUrl);

    if (targetUrl.origin !== baseUrl.origin || isAuthPath(targetUrl.pathname)) {
      return fallback;
    }

    return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
  } catch {
    return fallback;
  }
}
