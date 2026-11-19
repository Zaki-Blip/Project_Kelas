import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth/guards";
import { getSession } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import { getProjectDetail } from "@/lib/projects/queries";
import { getProjectPreviewHref } from "@/lib/projects/urls";
import { isAllowedImagePath } from "@/lib/security/images";
import { getGitHubUrl, getPreviewUrl } from "@/lib/security/urls";
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";
import { parseProjectSlug } from "@/lib/validation/projects";
import styles from "./project-detail.module.css";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

const publishedDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = parseProjectSlug(rawSlug);

  if (!slug) {
    return { title: "Proyek tidak ditemukan" };
  }

  const session = await getSession();

  if (!session) {
    return { title: "Detail Proyek" };
  }

  const project = await getProjectDetail(slug, session.user.role);

  if (!project) {
    return {
      title: "Proyek tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const canonical = `/projects/${project.slug}`;
  const thumbnailPath =
    project.thumbnailPath && isAllowedImagePath(project.thumbnailPath)
      ? project.thumbnailPath
      : null;
  const ogImages = thumbnailPath
    ? [
        {
          url: thumbnailPath,
          alt: `Tampilan ${project.title}`,
        },
      ]
    : [DEFAULT_OG_IMAGE];

  return {
    title: project.title,
    description: project.summary,
    alternates: {
      canonical,
    },
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      type: "article",
      url: canonical,
      title: project.title,
      description: project.summary,
      ...(project.publishedAt
        ? { publishedTime: project.publishedAt.toISOString() }
        : {}),
      modifiedTime: project.updatedAt.toISOString(),
      authors: [project.creator.fullName],
      section: project.category.name,
      tags: project.technologies.map((technology) => technology.name),
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
      images: ogImages,
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug: rawSlug } = await params;
  const session = await requireUser(`/projects/${encodeURIComponent(rawSlug)}`);
  const slug = parseProjectSlug(rawSlug);

  if (!slug) {
    notFound();
  }

  const project = await getProjectDetail(slug, session.user.role);

  if (!project) {
    notFound();
  }

  const isAdmin = session.user.role === "ADMIN";
  const previewUrl = getPreviewUrl(project.previewUrl);
  const githubUrl = getGitHubUrl(project.githubUrl);
  const previewHref = getProjectPreviewHref(project.slug);
  const paragraphs = project.description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
  const thumbnailPath =
    project.thumbnailPath && isAllowedImagePath(project.thumbnailPath)
      ? project.thumbnailPath
      : null;
  const screenshots = project.images.filter((image) =>
    isAllowedImagePath(image.imagePath),
  );
  const projectUrl = absoluteUrl(`/projects/${project.slug}`);
  const projectJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${projectUrl}#creativework`,
        name: project.title,
        description: project.summary,
        url: projectUrl,
        ...(thumbnailPath ? { image: absoluteUrl(thumbnailPath) } : {}),
        ...(project.publishedAt
          ? { datePublished: project.publishedAt.toISOString() }
          : {}),
        dateModified: project.updatedAt.toISOString(),
        author: {
          "@type": "Person",
          name: project.creator.fullName,
          alternateName: `@${project.creator.username}`,
        },
        contributor: project.members.map((member) => ({
          "@type": "Person",
          name: member.fullName,
          alternateName: `@${member.username}`,
        })),
        genre: project.category.name,
        keywords: project.technologies.map((technology) => technology.name).join(", "),
        about: project.technologies.map((technology) => ({
          "@type": "Thing",
          name: technology.name,
        })),
        publisher: {
          "@type": "EducationalOrganization",
          "@id": `${SITE_URL.toString()}#organization`,
          name: SITE_NAME,
          url: SITE_URL.toString(),
        },
        isPartOf: { "@id": `${SITE_URL.toString()}#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${projectUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Beranda",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Galeri",
            item: absoluteUrl("/dashboard"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: project.title,
            item: projectUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={projectJsonLd} />
      <section className={cn("container", styles.page)}>
      <nav className={styles.backNav} aria-label="Navigasi proyek">
        <Link href="/dashboard" className={styles.backLink}>
          <span aria-hidden="true">←</span>
          Kembali ke Galeri
        </Link>
      </nav>

      <article className={styles.article}>
        <div className={styles.hero}>
          <div className={styles.media}>
            {thumbnailPath ? (
              <Image
                src={thumbnailPath}
                alt={`Tampilan ${project.title}`}
                width={960}
                height={600}
                sizes="(max-width: 899px) 100vw, 55vw"
                loading="eager"
                fetchPriority="high"
                className={styles.image}
              />
            ) : (
              <span className={styles.placeholder}>Gambar belum tersedia</span>
            )}
          </div>

          <div className={styles.meta}>
            <div className={styles.badges}>
              <span className={styles.category}>{project.category.name}</span>
              {project.status === "DRAFT" ? <span className={styles.draft}>Draf</span> : null}
            </div>

            <h1 className={styles.title}>{project.title}</h1>
            <p className={styles.summary}>{project.summary}</p>

            <dl className={styles.metaList}>
              <div className={styles.metaRow}>
                <dt>Pembuat</dt>
                <dd>
                  {project.creator.fullName}{" "}
                  <span className={styles.metaMuted}>@{project.creator.username}</span>
                </dd>
              </div>

              <div className={styles.metaRow}>
                <dt>Teknologi</dt>
                <dd className={styles.technologyList}>
                  {project.technologies.map((technology) => (
                    <span key={technology.slug} className={styles.technology}>
                      {technology.name}
                    </span>
                  ))}
                </dd>
              </div>

              {project.publishedAt ? (
                <div className={styles.metaRow}>
                  <dt>Terbit</dt>
                  <dd>
                    <time dateTime={project.publishedAt.toISOString()}>
                      {publishedDateFormatter.format(project.publishedAt)}
                    </time>
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className={styles.actions}>
              {previewUrl ? (
                <Button href={previewHref}>Live Preview</Button>
              ) : (
                <Button type="button" disabled title="Preview belum tersedia untuk proyek ini.">
                  Preview Unavailable
                </Button>
              )}

              {githubUrl ? (
                <Button
                  href={githubUrl}
                  variant="outline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </Button>
              ) : null}

              {isAdmin ? (
                <Button href={`/admin/projects/${project.id}/edit`} variant="secondary">
                  Edit Project
                </Button>
              ) : null}
            </div>

            {!previewUrl ? (
              <p className={styles.hint}>
                Preview belum tersedia atau URL preview tidak lolos allowlist.
              </p>
            ) : null}
          </div>
        </div>

        <section className={styles.section} aria-labelledby="deskripsi-proyek">
          <h2 id="deskripsi-proyek" className={styles.sectionTitle}>
            Deskripsi
          </h2>
          {paragraphs.length > 0 ? (
            <div className={styles.description}>
              {paragraphs.map((paragraph, index) => (
                <p key={`${project.id}-paragraph-${index}`}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>Belum ada deskripsi untuk proyek ini.</p>
          )}
        </section>

        <section className={styles.section} aria-labelledby="anggota-tim">
          <h2 id="anggota-tim" className={styles.sectionTitle}>
            Anggota Tim
          </h2>
          {project.members.length > 0 ? (
            <ul className={styles.memberList}>
              {project.members.map((member) => (
                <li key={member.username} className={styles.member}>
                  <span className={styles.memberName}>{member.fullName}</span>
                  <span className={styles.memberUsername}>@{member.username}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyText}>Tidak ada anggota tim tambahan.</p>
          )}
        </section>

        <section className={styles.section} aria-labelledby="screenshot-proyek">
          <h2 id="screenshot-proyek" className={styles.sectionTitle}>
            Screenshot
          </h2>
          {screenshots.length > 0 ? (
            <div className={styles.screenshotGrid}>
              {screenshots.map((image, index) => (
                <figure key={image.id} className={styles.screenshot}>
                  <Image
                    src={image.imagePath}
                    alt={image.caption ?? `Screenshot ${index + 1} dari ${project.title}`}
                    width={960}
                    height={600}
                    sizes="(max-width: 767px) 100vw, (max-width: 1099px) 50vw, 33vw"
                    loading="lazy"
                    className={styles.screenshotImage}
                  />
                  {image.caption ? <figcaption>{image.caption}</figcaption> : null}
                </figure>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>Belum ada screenshot untuk proyek ini.</p>
          )}
        </section>
      </article>

      <div className={styles.footerNav}>
        <Button href="/dashboard" variant="outline">
          <span aria-hidden="true">←</span>
          Kembali ke Galeri
        </Button>
      </div>
      </section>
    </>
  );
}
