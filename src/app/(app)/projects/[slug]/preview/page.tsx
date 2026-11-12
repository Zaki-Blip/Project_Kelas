import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FullscreenButton } from "@/components/projects/FullscreenButton";
import { LivePreviewFrame } from "@/components/projects/LivePreviewFrame";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth/guards";
import { getSession } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import { getProjectDetail } from "@/lib/projects/queries";
import { getProjectHref } from "@/lib/projects/urls";
import { getPreviewUrl } from "@/lib/security/urls";
import { parseProjectSlug } from "@/lib/validation/projects";
import styles from "./preview.module.css";

type PreviewPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PreviewPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = parseProjectSlug(rawSlug);

  if (!slug) {
    return { title: "Preview tidak ditemukan" };
  }

  const session = await getSession();

  if (!session) {
    return { title: "Live Preview" };
  }

  const project = await getProjectDetail(slug, session.user.role);

  if (!project) {
    return { title: "Preview tidak ditemukan" };
  }

  return {
    title: `Live Preview — ${project.title}`,
    description: `Pratinjau langsung proyek ${project.title}.`,
  };
}

export default async function ProjectPreviewPage({ params }: PreviewPageProps) {
  const { slug: rawSlug } = await params;
  const session = await requireUser(
    `/projects/${encodeURIComponent(rawSlug)}/preview`,
  );
  const slug = parseProjectSlug(rawSlug);

  if (!slug) {
    notFound();
  }

  const project = await getProjectDetail(slug, session.user.role);

  if (!project) {
    notFound();
  }

  const previewUrl = getPreviewUrl(project.previewUrl);
  const detailHref = getProjectHref(project.slug);

  return (
    <section className={cn("container", styles.page)}>
      <div className={styles.topbar}>
        <div className={styles.heading}>
          <Link href={detailHref} className={styles.backLink}>
            <span aria-hidden="true">←</span>
            Detail
          </Link>
          <p className={styles.eyebrow}>Live Preview</p>
          <h1 className={styles.title}>{project.title}</h1>
        </div>

        {previewUrl ? (
          <div className={styles.actions}>
            <Button
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
            >
              Buka di Tab Baru
            </Button>
            <FullscreenButton targetId="preview-frame-wrapper" />
          </div>
        ) : null}
      </div>

      {previewUrl ? (
        <>
          <LivePreviewFrame
            key={previewUrl}
            src={previewUrl}
            title={project.title}
            externalUrl={previewUrl}
          />
          <p className={styles.hint}>
            Preview dijalankan di iframe dengan sandbox. Jika halaman tidak muncul, gunakan
            tombol Buka di Tab Baru.
          </p>
        </>
      ) : (
        <div className={styles.unavailable}>
          <p className={styles.eyebrow}>Live Preview</p>
          <h2 className={styles.unavailableTitle}>Preview Unavailable</h2>
          <p className={styles.unavailableText}>
            Project ini tidak dapat ditampilkan di dalam halaman karena preview belum
            tersedia atau URL-nya tidak lolos allowlist.
          </p>
          <div className={styles.actions}>
            <Button href={detailHref} variant="outline">
              Kembali ke Detail
            </Button>
            <Button href="/dashboard" variant="ghost">
              Ke Galeri
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
