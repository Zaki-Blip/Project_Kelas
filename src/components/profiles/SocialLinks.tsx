import type { JSX } from "react";

import { cn } from "@/lib/cn";
import type { SocialLinkItem } from "@/lib/social";
import styles from "./SocialLinks.module.css";

type SocialLinksProps = {
  links: SocialLinkItem[];
  showLabels?: boolean;
  compact?: boolean;
  className?: string;
};

function TikTokIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M16.6 3c.3 2.2 1.7 3.8 3.9 4.1v2.8c-1.4.1-2.7-.3-3.9-1.1v6.1c0 3.2-2.6 5.7-5.8 5.7S5 18.1 5 14.9c0-3.1 2.5-5.6 5.6-5.6.3 0 .6 0 .9.1v2.9c-.3-.1-.6-.2-.9-.2-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.8-1.2 2.8-2.8V3h3.2z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.9-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.94c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.23 10.23 0 0 0 22 12.23C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7L11.6 6.7" />
      <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 0 0 5.7 5.7l1.2-1.2" />
    </svg>
  );
}

const ICONS: Record<string, () => JSX.Element> = {
  tiktok: TikTokIcon,
  instagram: InstagramIcon,
  github: GitHubIcon,
};

export function SocialLinks({
  links,
  showLabels = false,
  compact = false,
  className,
}: SocialLinksProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <ul className={cn(styles.list, compact && styles.compact, className)}>
      {links.map((item) => {
        const Icon = ICONS[item.platform.toLowerCase()] ?? LinkIcon;

        return (
          <li key={item.href}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(styles.link, showLabels && styles.withLabel)}
              aria-label={`${item.label} (buka di tab baru)`}
            >
              <Icon />
              {showLabels ? <span className={styles.label}>{item.label}</span> : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
