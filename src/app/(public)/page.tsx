import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { FeedbackSection } from "@/components/feedback/FeedbackSection";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { ProjectGridSkeleton } from "@/components/projects/ProjectGridSkeleton";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { LoadingStatus } from "@/components/ui/LoadingStatus";
import { getCurrentUser } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import { getLandingProjects } from "@/lib/projects/queries";
import { getLoginNextHref } from "@/lib/projects/urls";
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: { absolute: "KaryaKelas — Katalog Karya Kelas" },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: SITE_NAME,
    title: "KaryaKelas — Katalog Karya Kelas",
    description:
      "Katalog proyek hasil karya siswa XII RPL 1: temukan karya, lihat profil kelas, dan coba pratinjau langsung.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "KaryaKelas — Katalog Karya Kelas",
    description:
      "Katalog proyek hasil karya siswa XII RPL 1: temukan karya, lihat profil kelas, dan coba pratinjau langsung.",
    images: [DEFAULT_OG_IMAGE],
  },
};

type HomeSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const features = [
  {
    number: "01",
    title: "Karya terkurasi",
    description:
      "Proyek yang tampil sudah melewati kurasi pengelola, dari kelengkapan data sampai status terbit.",
  },
  {
    number: "02",
    title: "Pencarian cepat",
    description:
      "Temukan proyek berdasarkan judul atau pembuat, lalu persempit dengan kategori dan teknologi.",
  },
  {
    number: "03",
    title: "Pratinjau langsung",
    description:
      "Buka detail proyek dan coba versi langsungnya tanpa harus mencari tautan secara manual.",
  },
];

function LatestProjectsHeading({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className={styles.latestHead}>
      <div>
        <p className={styles.eyebrow}>Dari kelas</p>
        <h2 className={styles.latestTitle}>Karya terbaru</h2>
      </div>
      <Link
        href={isAuthenticated ? "/dashboard" : getLoginNextHref("/dashboard")}
        className={styles.latestLink}
      >
        Lihat semua <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

async function LatestProjects({ isAuthenticated }: { isAuthenticated: boolean }) {
  const projects = await getLandingProjects();
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Karya terbaru KaryaKelas",
    url: absoluteUrl("/#karya-terbaru"),
    isPartOf: { "@id": `${SITE_URL.toString()}#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.title,
        url: absoluteUrl(`/projects/${project.slug}`),
      })),
    },
  };

  return (
    <>
      <JsonLd data={collectionJsonLd} />
      <section id="karya-terbaru" className={styles.latest}>
        <div className="container">
          <LatestProjectsHeading isAuthenticated={isAuthenticated} />
          {projects.length > 0 ? (
            <ProjectGrid projects={projects} isAuthenticated={isAuthenticated} />
          ) : (
            <p className={styles.latestEmpty}>Belum ada karya yang dipublikasikan.</p>
          )}
        </div>
      </section>
    </>
  );
}

function LatestProjectsFallback({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <section className={styles.latest} aria-busy="true">
      <div className="container">
        <LatestProjectsHeading isAuthenticated={isAuthenticated} />
        <LoadingStatus label="Memuat karya terbaru…" />
        <ProjectGridSkeleton count={6} />
      </div>
    </section>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: HomeSearchParams;
}) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  const feedbackSuccess = firstParam(params.feedback) === "success";
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL.toString()}#website`,
        name: SITE_NAME,
        url: SITE_URL.toString(),
        description: SITE_DESCRIPTION,
        inLanguage: "id-ID",
        publisher: { "@id": `${SITE_URL.toString()}#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${absoluteUrl("/dashboard")}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL.toString()}#organization`,
        name: SITE_NAME,
        alternateName: "XII RPL 1",
        url: SITE_URL.toString(),
        logo: absoluteUrl("/icons/icon-512.png"),
        description:
          "Katalog proyek siswa XII RPL 1 untuk melihat, mencari, dan mencoba karya kelas.",
      },
    ],
  };

  return (
    <>
      <JsonLd data={siteJsonLd} />
      <section className={styles.hero}>
        <div className={cn("container", styles.heroGrid)}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowMark} aria-hidden="true" />
              Katalog karya kelas
            </p>
            <h1 className={styles.title}>
              Karya nyata,
              <br />
              <span className={styles.highlight}>dari kelas kami.</span>
            </h1>
            <p className={styles.lead}>
              Satu tempat untuk melihat, mencari, dan mencoba proyek hasil karya siswa.
              Setiap karya punya cerita, tim, dan teknologi yang bisa dijelajahi.
            </p>
            <div className={styles.actions}>
              <Button href={user ? "/dashboard" : "/login"} size="lg">
                {user ? "Buka Galeri" : "Masuk ke Galeri"}
              </Button>
              <Button href="/about" variant="secondary" size="lg">
                Tentang KaryaKelas
              </Button>
            </div>
            <p className={styles.note}>
              {user
                ? "Galeri lengkap, detail proyek, dan pratinjau langsung siap dijelajahi."
                : "Galeri lengkap, detail proyek, dan pratinjau langsung tersedia setelah masuk."}
            </p>
          </div>

          <div className={styles.visual} aria-hidden="true">
            <div className={styles.visualCard}>
              <div className={styles.visualTop}>
                <span className={styles.windowDots}>
                  <span />
                  <span />
                  <span />
                </span>
                <span className={styles.visualLabel}>katalog / pratinjau</span>
              </div>
              <div className={styles.visualBody}>
                <div className={styles.visualSidebar}>
                  <span className={styles.sidebarBrand}>K</span>
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className={styles.visualContent}>
                  <div className={styles.visualHero}>
                    <span className={styles.visualHeroTitle} />
                    <span className={styles.visualHeroText} />
                    <span className={styles.visualHeroTextShort} />
                    <span className={styles.visualHeroButton} />
                  </div>
                  <div className={styles.visualGrid}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.visualRows}>
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>
            <span className={styles.stickerBlue}>Cari</span>
            <span className={styles.stickerYellow}>Pratinjau</span>
          </div>
        </div>
      </section>

      <Suspense fallback={<LatestProjectsFallback isAuthenticated={Boolean(user)} />}>
        <LatestProjects isAuthenticated={Boolean(user)} />
      </Suspense>

      <section className={styles.purpose}>
        <div className="container">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Mengapa KaryaKelas?</p>
            <h2 className={styles.sectionTitle}>Dibuat untuk melihat karya dengan lebih mudah.</h2>
          </div>
          <div className={styles.featureGrid}>
            {features.map((feature) => (
              <article key={feature.number} className={styles.featureCard}>
                <span className={styles.featureNumber}>{feature.number}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FeedbackSection user={user} showSuccess={feedbackSuccess} />

      <section className={styles.ctaSection}>
        <div className={cn("container", styles.ctaCard)}>
          <div>
            <p className={styles.eyebrow}>{user ? "Lanjutkan menjelajah" : "Siap menjelajah?"}</p>
            <h2 className={styles.ctaTitle}>
              {user ? "Buka galeri dan lihat karya kelas." : "Masuk dan temukan karya kelas."}
            </h2>
            <p className={styles.ctaText}>
              {user
                ? "Lanjutkan dari galeri untuk melihat detail proyek dan mencoba pratinjau langsung."
                : "Buat akun untuk membuka galeri lengkap dan mencoba pratinjau langsung proyek."}
            </p>
          </div>
          <div className={styles.ctaActions}>
            {user ? (
              <>
                <Button href="/dashboard" size="lg">
                  Buka Galeri
                </Button>
                <Button href="/about" variant="outline" size="lg">
                  Tentang
                </Button>
              </>
            ) : (
              <>
                <Button href="/register" size="lg">
                  Daftar
                </Button>
                <Button href="/login" variant="outline" size="lg">
                  Masuk
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
