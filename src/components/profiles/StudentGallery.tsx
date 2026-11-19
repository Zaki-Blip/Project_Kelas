import Image from "next/image";

import { SocialLinks } from "@/components/profiles/SocialLinks";
import { StudentProfileDialog } from "@/components/profiles/StudentProfileDialog";
import { getInitials, hasSocialLinks } from "@/lib/profiles/display";
import type { StudentProfileCardData } from "@/lib/profiles/types";
import styles from "./StudentGallery.module.css";

type StudentGalleryProps = {
  students: StudentProfileCardData[];
};

export function StudentGallery({ students }: StudentGalleryProps) {
  return (
    <>
      <ul className={styles.grid}>
        {students.map((student) => (
          <li key={student.id}>
            <article className={styles.card}>
              <div className={styles.photoWrap}>
                <button
                  type="button"
                  className={styles.photoButton}
                  data-student-profile
                  data-student-id={student.id}
                  aria-haspopup="dialog"
                  aria-controls="student-profile-dialog"
                  aria-label={`Lihat profil ${student.name}`}
                >
                  {student.photoPath ? (
                    <Image
                      src={student.photoPath}
                      alt=""
                      fill
                      sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                      className={styles.photo}
                    />
                  ) : (
                    <span className={styles.initials} aria-hidden="true">
                      {getInitials(student.name)}
                    </span>
                  )}
                  <span className={styles.photoShade} aria-hidden="true" />
                  <span className={styles.viewHint} aria-hidden="true">
                    Lihat profil
                  </span>
                </button>

                {hasSocialLinks(student) ? (
                  <div className={styles.overlay}>
                    <SocialLinks
                      links={student.socialLinks}
                      compact
                      className={styles.overlayLinks}
                    />
                  </div>
                ) : null}
              </div>

              <div className={styles.body}>
                <h3 className={styles.name}>{student.name}</h3>
                {student.role ? <p className={styles.role}>{student.role}</p> : null}
              </div>
            </article>
          </li>
        ))}
      </ul>

      <StudentProfileDialog students={students} />
    </>
  );
}
