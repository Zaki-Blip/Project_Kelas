import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StudentProfileForm } from "@/components/admin/StudentProfileForm";
import { safeAdminReturnPath } from "@/lib/admin/paths";
import { requireAdmin } from "@/lib/auth/guards";
import { cn } from "@/lib/cn";
import { getAdminStudentProfile } from "@/lib/profiles/queries";
import { parseAdminId } from "@/lib/validation/admin";
import styles from "../../../../admin.module.css";

export const metadata: Metadata = {
  title: "Edit Profil Siswa",
};

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EditStudentProfilePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { id: rawId } = await params;
  const id = parseAdminId(rawId);

  if (!id) {
    notFound();
  }

  await requireAdmin(`/admin/profil-kelas/siswa/${id}/edit`);

  const student = await getAdminStudentProfile(id);

  if (!student) {
    notFound();
  }

  const search = await searchParams;
  const returnTo = safeAdminReturnPath(
    firstParam(search.returnTo),
    "/admin/profil-kelas",
  );

  return (
    <section className={cn("container", styles.page)}>
      <div className={styles.headerText}>
        <p className={styles.eyebrow}>Profil Kelas</p>
        <h1 className={styles.title}>Edit Profil Siswa</h1>
        <p className={styles.text}>
          Perbarui foto, identitas, atau tautan sosial {student.name}.
        </p>
      </div>

      <StudentProfileForm student={student} returnTo={returnTo} />
    </section>
  );
}
