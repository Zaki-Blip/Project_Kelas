import type { Metadata } from "next";

import { StudentProfileForm } from "@/components/admin/StudentProfileForm";
import { safeAdminReturnPath } from "@/lib/admin/paths";
import { requireAdmin } from "@/lib/auth/guards";
import { cn } from "@/lib/cn";
import styles from "../../../admin.module.css";

export const metadata: Metadata = {
  title: "Tambah Profil Siswa",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewStudentProfilePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin("/admin/profil-kelas/siswa/new");

  const params = await searchParams;
  const returnTo = safeAdminReturnPath(
    firstParam(params.returnTo),
    "/admin/profil-kelas",
  );

  return (
    <section className={cn("container", styles.page)}>
      <div className={styles.headerText}>
        <p className={styles.eyebrow}>Profil Kelas</p>
        <h1 className={styles.title}>Tambah Profil Siswa</h1>
        <p className={styles.text}>
          Unggah foto, isi nama dan peran, lalu tambahkan tautan sosial yang ingin
          ditampilkan.
        </p>
      </div>

      <StudentProfileForm returnTo={returnTo} />
    </section>
  );
}
