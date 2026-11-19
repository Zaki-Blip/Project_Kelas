"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Next.js 16 can leave a route-level `loading.tsx` fallback on screen after a
 * full page load: the resolved server content is streamed into a hidden
 * `div#S:*` but React's inline reveal never swaps it in. Soft navigations do
 * not hit the bug, so a single `router.refresh()` recovers the page.
 *
 * The recovery only runs when both signals are present:
 * - a visible loading fallback with the `Memuat…` screen-reader label, and
 * - a hidden streamed segment that already contains real content.
 */
function hasStuckLoadingBoundary(): boolean {
  const fallback = Array.from(
    document.querySelectorAll<HTMLElement>('[aria-busy="true"]'),
  ).find((element) =>
    element
      .querySelector(".visuallyHidden")
      ?.textContent?.trim()
      .startsWith("Memuat"),
  );

  if (!fallback) {
    return false;
  }

  return Array.from(
    document.querySelectorAll<HTMLElement>('[id^="S:"]'),
  ).some(
    (segment) =>
      segment.hidden && (segment.textContent?.trim().length ?? 0) > 0,
  );
}

function hasLoadingFallback(): boolean {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[aria-busy="true"]'),
  ).some((element) =>
    element
      .querySelector(".visuallyHidden")
      ?.textContent?.trim()
      .startsWith("Memuat"),
  );
}

function isRecoverablePath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/projects" ||
    pathname.startsWith("/projects/") ||
    pathname === "/laporan-pkl" ||
    pathname.startsWith("/laporan-pkl/") ||
    pathname === "/profil-kelas" ||
    pathname.startsWith("/profil-kelas/")
  );
}

/**
 * Removes the orphaned hidden streamed segments after a recovery refresh.
 * They are not part of the visible React tree anymore, and keeping them would
 * duplicate static IDs such as section anchors.
 */
function removeOrphanedSegments(): void {
  document.querySelectorAll<HTMLElement>('[id^="S:"]').forEach((segment) => {
    if (segment.hidden && !segment.closest("#konten")) {
      segment.remove();
    }
  });
}

const POLL_INTERVAL_MS = 250;
const MAX_POLL_ATTEMPTS = 40;
const MAX_CLEANUP_ATTEMPTS = 40;

export function StreamingBoundaryRecovery() {
  const router = useRouter();
  const pathname = usePathname();
  const recoveredPath = useRef<string | null>(null);

  useEffect(() => {
    if (recoveredPath.current === pathname || !isRecoverablePath(pathname)) {
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let refreshTimeout: ReturnType<typeof setTimeout> | undefined;
    let cleanupInterval: ReturnType<typeof setInterval> | undefined;

    const startCleanup = () => {
      let cleanupAttempts = 0;

      cleanupInterval = setInterval(() => {
        if (cancelled) {
          clearInterval(cleanupInterval);
          return;
        }

        cleanupAttempts += 1;

        if (!hasLoadingFallback()) {
          removeOrphanedSegments();
          clearInterval(cleanupInterval);
          return;
        }

        if (cleanupAttempts >= MAX_CLEANUP_ATTEMPTS) {
          clearInterval(cleanupInterval);
        }
      }, POLL_INTERVAL_MS);
    };

    const interval = setInterval(() => {
      if (cancelled || recoveredPath.current === pathname) {
        clearInterval(interval);
        return;
      }

      attempts += 1;

      if (hasStuckLoadingBoundary()) {
        clearInterval(interval);

        // Give React one more tick to reveal the streamed content before
        // forcing a soft navigation.
        refreshTimeout = setTimeout(() => {
          if (cancelled || recoveredPath.current === pathname) {
            return;
          }

          if (hasStuckLoadingBoundary()) {
            recoveredPath.current = pathname;
            router.refresh();
            startCleanup();
          }
        }, POLL_INTERVAL_MS);

        return;
      }

      if (!hasLoadingFallback()) {
        // The page resolved normally or never had a loading fallback.
        clearInterval(interval);
        return;
      }

      if (attempts >= MAX_POLL_ATTEMPTS) {
        clearInterval(interval);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);

      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }

      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }
    };
  }, [pathname, router]);

  return null;
}
