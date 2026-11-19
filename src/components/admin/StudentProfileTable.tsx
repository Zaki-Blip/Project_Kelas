import Image from "next/image";
import Link from "next/link";

import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { cn } from "@/lib/cn";
import type { StudentProfileData } from "@/lib/profiles/types";
import { isAllowedImagePath } from "@/lib/security/images";
import { normalizeSocialUrlLines } from "@/lib/social";
import { deleteStudentProfileAction } from "@/server/actions/admin-profiles";
import styles from "./StudentProfileTable.module.css";

type StudentProfileTableProps = {
  students: StudentProfileData[];
  returnTo: string;
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function StudentProfileTable({
  students,
  returnTo,
}: StudentProfileTableProps) {
  return (
    <div
      className={styles.wrap}
      role="region"
      aria-label="Tabel profil siswa, geser ke samping untuk melihat semua kolom"
      tabIndex={0}
    >
      <table className={styles.table}>
        <caption className="visuallyHidden">Daftar profil siswa</caption>
        <thead>
          <tr>
            <th scope="col">Siswa</th>
            <th scope="col">Peran</th>
            <th scope="col">Sosial</th>
            <th scope="col">Urutan</th>
            <th scope="col">Status</th>
            <th scope="col">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const socialCount = normalizeSocialUrlLines(
              student.socialLinks,
            ).length;
            const photoPath = isAllowedImagePath(student.photoPath)
              ? student.photoPath
              : null;

            return (
              <tr key={student.id}>
                <td>
                  <div className={styles.studentCell}>
                    <span className={styles.photoFrame}>
                      {photoPath ? (
                        <Image
                          src={photoPath}
                          alt=""
                          width={56}
                          height={56}
                          className={styles.photo}
                        />
                      ) : (
                        <span className={styles.initials} aria-hidden="true">
                          {getInitials(student.name)}
                        </span>
                      )}
                    </span>
                    <span className={styles.studentName}>{student.name}</span>
                  </div>
                </td>
                <td>
                  <span className={styles.role}>{student.role || "—"}</span>
                </td>
                <td>
                  <span className={styles.socialCount}>
                    {socialCount > 0 ? `${socialCount} tautan` : "Belum ada"}
                  </span>
                </td>
                <td>
                  <span className={styles.sortOrder}>{student.sortOrder}</span>
                </td>
                <td>
                  <span
                    className={cn(
                      styles.badge,
                      student.isVisible ? styles.visible : styles.hidden,
                    )}
                  >
                    {student.isVisible ? "Tampil" : "Disembunyikan"}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link
                      href={`/admin/profil-kelas/siswa/${student.id}/edit`}
                      className={styles.actionLink}
                    >
                      Edit
                    </Link>
                    <ConfirmDeleteButton
                      action={deleteStudentProfileAction}
                      fields={{ studentId: student.id, returnTo }}
                      title={`Hapus profil ${student.name}?`}
                      description="Profil siswa ini akan dihapus dari galeri. Tindakan ini tidak bisa dibatalkan."
                      confirmLabel="Hapus Profil"
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
