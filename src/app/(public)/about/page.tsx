import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "Tentang",
  description: "Tentang KaryaKelas, katalog proyek hasil karya siswa.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/about",
    siteName: SITE_NAME,
    title: "Tentang KaryaKelas",
    description: "Tentang KaryaKelas, katalog proyek hasil karya siswa.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tentang KaryaKelas",
    description: "Tentang KaryaKelas, katalog proyek hasil karya siswa.",
    images: [DEFAULT_OG_IMAGE],
  },
};

const principles = [
  {
    title: "Karya yang bisa dilihat",
    description:
      "Setiap proyek ditampilkan dengan gambar utama, ringkasan, pembuat, dan teknologi yang dipakai.",
  },
  {
    title: "Mudah ditemukan",
    description:
      "Pencarian dan filter membantu menemukan proyek berdasarkan judul, pembuat, kategori, atau teknologi.",
  },
  {
    title: "Bisa dicoba",
    description:
      "Halaman detail menyediakan tautan GitHub dan pratinjau langsung untuk melihat proyek secara langsung.",
  },
];

export default async function AboutPage() {
  const user = await getCurrentUser();
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Tentang KaryaKelas",
    url: absoluteUrl("/about"),
    isPartOf: { "@id": `${SITE_URL.toString()}#website` },
    mainEntity: {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL.toString()}#organization`,
      name: SITE_NAME,
      url: SITE_URL.toString(),
      description:
        "Katalog proyek siswa yang membuat hasil kerja kelas lebih mudah ditemukan, dipahami, dan dicoba.",
    },
  };

  return (
    <>
      <JsonLd data={aboutJsonLd} />
      <section className={cn("container", styles.hero)}>
        <p className={styles.eyebrow}>Tentang KaryaKelas</p>
        <h1 className={styles.title}>Ruang untuk karya yang dibuat di kelas.</h1>
        <p className={styles.lead}>
          KaryaKelas adalah katalog proyek siswa yang membuat hasil kerja kelas lebih mudah
          ditemukan, dipahami, dan dicoba. Fokusnya sederhana: tampilkan karya dengan jelas,
          sediakan pencarian yang cepat, dan beri jalan langsung ke versi langsungnya.
        </p>
        <div className={styles.actions}>
          {user ? (
            <>
              <Button href="/dashboard" size="lg">
                Buka Galeri
              </Button>
              <Button href="/" variant="outline" size="lg">
                Ke Beranda
              </Button>
            </>
          ) : (
            <>
              <Button href="/register" size="lg">
                Buat Akun
              </Button>
              <Button href="/login" variant="outline" size="lg">
                Masuk
              </Button>
            </>
          )}
        </div>
      </section>

      <section className={styles.principlesSection}>
        <div className="container">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Yang kami jaga</p>
            <h2 className={styles.sectionTitle}>Tiga hal yang membuat katalog ini berguna.</h2>
          </div>
          <div className={styles.principlesGrid}>
            {principles.map((principle, index) => (
              <article key={principle.title} className={styles.principle}>
                <span className={styles.number} aria-hidden="true">
                  0{index + 1}
                </span>
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={cn("container", styles.adminSection)}>
        <div className={styles.adminCard}>
          <div>
            <p className={styles.eyebrow}>Untuk pengelola</p>
            <h2 className={styles.adminTitle}>Satu tempat untuk merapikan katalog.</h2>
            <p className={styles.adminText}>
              Pengelola dapat menambah proyek, mengatur pembuat dan anggota, mengunggah gambar,
              serta memilih status draf atau terbit. Semua perubahan dilakukan dari halaman
              pengelola yang terpisah dari galeri pengguna.
            </p>
          </div>
          <div className={styles.adminList}>
            <span>Proyek dan status</span>
            <span>Kategori dan teknologi</span>
            <span>Gambar utama dan tangkapan layar</span>
            <span>Pembuat dan anggota tim</span>
          </div>
        </div>
      </section>
    </>
  );
}
