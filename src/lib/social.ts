export const MAX_SOCIAL_URL_LENGTH = 2048;
export const MAX_STUDENT_SOCIAL_LINKS = 5;

export type SocialLinkItem = {
  platform: string;
  label: string;
  href: string;
};

const SOCIAL_PLATFORM_META = [
  { platform: "tiktok", label: "TikTok", domains: ["tiktok.com"] },
  { platform: "instagram", label: "Instagram", domains: ["instagram.com"] },
  { platform: "github", label: "GitHub", domains: ["github.com"] },
  { platform: "linkedin", label: "LinkedIn", domains: ["linkedin.com"] },
  { platform: "youtube", label: "YouTube", domains: ["youtube.com", "youtu.be"] },
  { platform: "facebook", label: "Facebook", domains: ["facebook.com", "fb.com"] },
  { platform: "x", label: "X", domains: ["x.com", "twitter.com"] },
  { platform: "threads", label: "Threads", domains: ["threads.net"] },
  { platform: "telegram", label: "Telegram", domains: ["t.me", "telegram.me"] },
  { platform: "discord", label: "Discord", domains: ["discord.gg", "discord.com"] },
  { platform: "gitlab", label: "GitLab", domains: ["gitlab.com"] },
  { platform: "behance", label: "Behance", domains: ["behance.net"] },
  { platform: "dribbble", label: "Dribbble", domains: ["dribbble.com"] },
  { platform: "medium", label: "Medium", domains: ["medium.com"] },
] as const;

/**
 * Returns a normalized HTTPS URL for a social link. Credentials, custom ports,
 * local hosts, and hostnames without a dot are rejected.
 */
export function getExternalSocialUrl(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0 || trimmed.length > MAX_SOCIAL_URL_LENGTH) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    const hostname = url.hostname.toLowerCase();

    if (
      url.protocol !== "https:" ||
      url.username.length > 0 ||
      url.password.length > 0 ||
      url.port.length > 0 ||
      hostname.length === 0 ||
      !hostname.includes(".") ||
      hostname === "localhost" ||
      hostname.endsWith(".localhost")
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function isSafeExternalSocialUrl(value: string): boolean {
  return getExternalSocialUrl(value) !== null;
}

export function splitSocialUrlLines(
  value: string | null | undefined,
): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function normalizeSocialUrlLines(
  value: string | null | undefined,
): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const line of splitSocialUrlLines(value)) {
    const normalized = getExternalSocialUrl(line);

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    urls.push(normalized);
  }

  return urls;
}

function detectPlatform(hostname: string) {
  return SOCIAL_PLATFORM_META.find((entry) =>
    entry.domains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    ),
  );
}

export function getSocialLinkItems(
  urls: readonly string[],
): SocialLinkItem[] {
  const seen = new Set<string>();
  const items: SocialLinkItem[] = [];

  for (const value of urls) {
    const href = getExternalSocialUrl(value);

    if (!href || seen.has(href)) {
      continue;
    }

    seen.add(href);
    const hostname = new URL(href).hostname.toLowerCase();
    const meta = detectPlatform(hostname);

    items.push({
      platform: meta?.platform ?? "website",
      label: meta?.label ?? hostname.replace(/^www\./, ""),
      href,
    });
  }

  return items;
}

export function getSocialLinksFromText(
  value: string | null | undefined,
): SocialLinkItem[] {
  return getSocialLinkItems(normalizeSocialUrlLines(value));
}
