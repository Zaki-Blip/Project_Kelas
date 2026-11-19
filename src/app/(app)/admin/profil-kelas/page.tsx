import type { Metadata } from "next";

import { AdminNotice } from "@/components/admin/AdminNotice";
import { ClassProfileForm } from "@/components/admin/ClassProfileForm";
import { StudentProfileTable } from "@/components/admin/StudentProfileTable";
import { Button } from "@/components/ui/Button";
import { getAdminNotice } from "@/lib/admin/notices";
import { requireAdmin } from "@/lib/auth/guards";
import { cn } from "@/lib/cn";
import {
  getAdminStudentProfiles,
  getClassProfile,
} from "@/lib/profiles/queries";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: "Profil Kelas",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminClassProfilePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin("/admin/profil-kelas");

  const params = await searchParams;
  const notice = getAdminNotice(firstParam(params.notice));
  const [profile, students] = await Promise.all([
    getClassProfile(),
    getAdminStudentProfiles(),
  ]);
  const returnTo = "/admin/profil-kelas";

  return (
    <section className={cn("container", styles.page)}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>Pengelola</p>
          <h1 className={styles.title}>Profil Kelas</h1>
          <p className={styles.text}>
            Atur identitas kelas dan foto utama. Tambahkan profil siswa yang akan
            tampil di galeri foto kelas.
          </p>
        </div>
        <div className={styles.searchActions}>
          <Button href="/profil-kelas" variant="outline">
            Lihat Halaman
          </Button>
          <Button href="/admin/profil-kelas/siswa/new">Tambah Siswa</Button>
        </div>
      </div>

      <AdminNotice notice={notice} />

      <ClassProfileForm profile={profile} returnTo={returnTo} />

      <div className={styles.resultsRow}>
        <div className={styles.sectionHeading}>
          <h2 className={styles.sectionTitle}>Profil Siswa</h2>
          <p className={styles.text}>
            Kelola foto, nama, peran, dan tautan sosial siswa. Urutan kecil tampil
            lebih dulu di halaman profil kelas.
          </p>
        </div>
        <span className={styles.countBadge}>{students.length} siswa</span>
      </div>

      {students.length > 0 ? (
        <>
          <p className={styles.mobileHint}>
            Geser tabel ke samping untuk melihat semua kolom.
          </p>
          <StudentProfileTable students={students} returnTo={returnTo} />
        </>
      ) : (
        <div className={styles.empty}>
          <h3 className={styles.emptyTitle}>Belum ada profil siswa.</h3>
          <p className={styles.emptyText}>
            Tambahkan profil siswa pertama agar galeri foto kelas mulai terisi.
          </p>
          <Button href="/admin/profil-kelas/siswa/new">Tambah Profil Siswa</Button>
        </div>
      )}
    </section>
  );
}
