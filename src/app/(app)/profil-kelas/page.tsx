import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { StudentGallery } from "@/components/profiles/StudentGallery";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth/guards";
import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/profiles/display";
import {
  getClassProfile,
  getVisibleStudentProfiles,
} from "@/lib/profiles/queries";
import type { StudentProfileCardData } from "@/lib/profiles/types";
import { isAllowedImagePath } from "@/lib/security/images";
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";
import styles from "./profil-kelas.module.css";

export const metadata: Metadata = {
  title: "Profil Kelas",
  description:
    "Kenali kelas, lihat foto siswa, dan temukan tautan sosial mereka.",
  alternates: {
    canonical: "/profil-kelas",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Profil Kelas XII RPL 1 — KaryaKelas",
    description:
      "Kenali kelas, lihat foto siswa, dan temukan tautan sosial mereka.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Profil Kelas XII RPL 1 — KaryaKelas",
    description:
      "Kenali kelas, lihat foto siswa, dan temukan tautan sosial mereka.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function ClassProfilePage() {
  const session = await requireUser("/profil-kelas");
  const [classProfile, rawStudents] = await Promise.all([
    getClassProfile(),
    getVisibleStudentProfiles(),
  ]);

  const students: StudentProfileCardData[] = rawStudents.map((student) => ({
    ...student,
    photoPath: isAllowedImagePath(student.photoPath) ? student.photoPath : "",
  }));

  const className = classProfile?.className ?? "Profil Kelas";
  const classPhotoPath =
    classProfile?.photoPath && isAllowedImagePath(classProfile.photoPath)
      ? classProfile.photoPath
      : null;
  const paragraphs =
    classProfile?.description
      ?.split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0) ?? [];
  const isAdmin = session.user.role === "ADMIN";
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `Profil ${className}`,
    url: absoluteUrl("/profil-kelas"),
    isPartOf: { "@id": `${SITE_URL.toString()}#website` },
    ...(classProfile?.updatedAt
      ? { dateModified: classProfile.updatedAt.toISOString() }
      : {}),
    mainEntity: {
      "@type": "EducationalOrganization",
      name: className,
      url: absoluteUrl("/profil-kelas"),
      ...(classProfile?.tagline ? { slogan: classProfile.tagline } : {}),
      ...(classProfile?.description
        ? { description: classProfile.description }
        : {}),
      ...(classPhotoPath ? { image: absoluteUrl(classPhotoPath) } : {}),
      member: students.map((student) => ({
        "@type": "Person",
        name: student.name,
        ...(student.role ? { jobTitle: student.role } : {}),
        ...(student.bio ? { description: student.bio } : {}),
        ...(student.photoPath ? { image: absoluteUrl(student.photoPath) } : {}),
        ...(student.socialLinks.length > 0
          ? { sameAs: student.socialLinks.map((link) => link.href) }
          : {}),
      })),
    },
  };

  return (
    <>
      <JsonLd data={profileJsonLd} />
      <section className={cn("container", styles.page)}>
      <nav className={styles.backNav} aria-label="Navigasi profil kelas">
        <Link href="/dashboard" className={styles.backLink}>
          <span aria-hidden="true">←</span>
          Kembali ke Galeri
        </Link>
      </nav>

      <section className={styles.hero} aria-labelledby="judul-profil-kelas">
        <div className={styles.heroMedia}>
          {classPhotoPath ? (
            <Image
              src={classPhotoPath}
              alt={`Foto ${className}`}
              fill
              sizes="(max-width: 899px) 100vw, 45vw"
              loading="eager"
              fetchPriority="high"
              className={styles.heroImage}
            />
          ) : (
            <span className={styles.heroInitials} aria-hidden="true">
              {getInitials(className)}
            </span>
          )}
          <span className={styles.heroSticker} aria-hidden="true">
            KaryaKelas
          </span>
        </div>

        <div className={styles.heroBody}>
          <p className={styles.eyebrow}>Profil Kelas</p>
          <h1 id="judul-profil-kelas" className={styles.title}>
            {className}
          </h1>
          {classProfile?.tagline ? (
            <p className={styles.tagline}>{classProfile.tagline}</p>
          ) : null}

          {paragraphs.length > 0 ? (
            <div className={styles.description}>
              {paragraphs.map((paragraph, index) => (
                <p key={`${classProfile?.id ?? "class"}-paragraph-${index}`}>
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className={styles.descriptionMuted}>
              {classProfile
                ? "Belum ada deskripsi kelas."
                : "Profil kelas belum diatur oleh admin."}
            </p>
          )}

          <div className={styles.heroMeta}>
            <span className={styles.countBadge}>{students.length} siswa tampil</span>
            {classProfile ? (
              <span className={styles.metaNote}>Terhubung lewat karya dan cerita.</span>
            ) : null}
          </div>

          {isAdmin ? (
            <div className={styles.adminActions}>
              <Button href="/admin/profil-kelas" variant="secondary">
                Kelola Profil Kelas
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="anggota-kelas">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Galeri Siswa</p>
            <h2 id="anggota-kelas" className={styles.sectionTitle}>
              Wajah di balik karya
            </h2>
            <p className={styles.sectionText}>
              Arahkan kursor atau sentuh foto untuk melihat tautan sosial dan profil
              lengkap.
            </p>
          </div>
          <span className={styles.countBadge}>{students.length} profil</span>
        </div>

        {students.length > 0 ? (
          <StudentGallery students={students} />
        ) : (
          <div className={styles.empty}>
            <h3 className={styles.emptyTitle}>Belum ada profil siswa.</h3>
            <p className={styles.emptyText}>
              Profil siswa yang ditambahkan admin akan tampil di sini.
            </p>
            {isAdmin ? (
              <Button href="/admin/profil-kelas/siswa/new">
                Tambah Profil Siswa
              </Button>
            ) : null}
          </div>
        )}
      </section>
    </section>
    </>
  );
}
