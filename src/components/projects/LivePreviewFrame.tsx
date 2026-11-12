"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import styles from "./LivePreviewFrame.module.css";

const LOAD_TIMEOUT_MS = 8_000;

type PreviewStatus = "loading" | "ready" | "error";

type LivePreviewFrameProps = {
  src: string;
  title: string;
  externalUrl: string;
};

export function LivePreviewFrame({ src, title, externalUrl }: LivePreviewFrameProps) {
  const [status, setStatus] = useState<PreviewStatus>("loading");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLoadTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setStatus((current) => (current === "loading" ? "error" : current));
    }, LOAD_TIMEOUT_MS);

    return clearLoadTimeout;
  }, [clearLoadTimeout, src]);

  function handleLoad() {
    clearLoadTimeout();
    setStatus("ready");
  }

  function handleError() {
    clearLoadTimeout();
    setStatus("error");
  }

  return (
    <div id="preview-frame-wrapper" className={styles.wrapper} data-status={status}>
      {status !== "error" ? (
        <iframe
          src={src}
          title={`Live preview ${title}`}
          sandbox="allow-scripts allow-forms allow-modals"
          referrerPolicy="no-referrer"
          allowFullScreen
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={styles.frame}
        />
      ) : null}

      {status === "loading" ? (
        <div className={styles.loading} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          <p>Memuat preview…</p>
        </div>
      ) : null}

      {status === "error" ? (
        <div className={styles.fallback} role="alert">
          <p className={styles.fallbackEyebrow}>Live Preview</p>
          <h2 className={styles.fallbackTitle}>Preview Unavailable</h2>
          <p className={styles.fallbackText}>
            Project ini tidak dapat ditampilkan di dalam halaman. Coba buka preview di tab
            baru.
          </p>
          <Button
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
          >
            Buka di Tab Baru
          </Button>
        </div>
      ) : null}
    </div>
  );
}
