export const DEFAULT_PREVIEW_ALLOWED_HOSTS = "*.vercel.app";

const MAX_HOST_LENGTH = 253;
const ALLOWED_HOST_PATTERN =
  /^(?:\*\.)?[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;

function normalizeAllowedHost(value: string): string | null {
  const host = value.trim().toLowerCase();

  if (host.length === 0 || host.length > MAX_HOST_LENGTH) {
    return null;
  }

  return ALLOWED_HOST_PATTERN.test(host) ? host : null;
}

export function parsePreviewAllowedHosts(value: string | undefined): string[] {
  const source = value ?? DEFAULT_PREVIEW_ALLOWED_HOSTS;
  const hosts = source
    .split(",")
    .map(normalizeAllowedHost)
    .filter((host): host is string => host !== null);

  return [...new Set(hosts)];
}

export function isPreviewHostAllowed(hostname: string, allowedHosts: string[]): boolean {
  const normalized = hostname.trim().toLowerCase();

  if (normalized.length === 0 || normalized.endsWith(".")) {
    return false;
  }

  return allowedHosts.some((allowedHost) => {
    if (allowedHost.startsWith("*.")) {
      const suffix = allowedHost.slice(1);

      return normalized.length > suffix.length && normalized.endsWith(suffix);
    }

    return normalized === allowedHost;
  });
}

export function getPreviewFrameSources(allowedHosts: string[]): string[] {
  return allowedHosts.map((host) => `https://${host}`);
}
