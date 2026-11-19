"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { SocialLinks } from "@/components/profiles/SocialLinks";
import { getInitials, hasSocialLinks } from "@/lib/profiles/display";
import type { StudentProfileCardData } from "@/lib/profiles/types";
import styles from "./StudentGallery.module.css";

type StudentProfileDialogProps = {
  students: StudentProfileCardData[];
};

export function StudentProfileDialog({ students }: StudentProfileDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const selected = selectedId
    ? (students.find((student) => student.id === selectedId) ?? null)
    : null;

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) {
        return;
      }

      const trigger = event.target.closest("[data-student-profile]");

      if (!(trigger instanceof HTMLButtonElement)) {
        return;
      }

      const studentId = trigger.dataset.studentId;

      if (!studentId) {
        return;
      }

      triggerRef.current = trigger;
      setSelectedId(studentId);
    }

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (selected) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [selected]);

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleDialogClose() {
    setSelectedId(null);
    if (triggerRef.current?.isConnected) {
      triggerRef.current.focus();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      id="student-profile-dialog"
      className={styles.dialog}
      aria-modal="true"
      aria-labelledby={selected ? "student-dialog-title" : undefined}
      onClose={handleDialogClose}
      onCancel={(event) => {
        event.preventDefault();
        closeDialog();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeDialog();
        }
      }}
    >
      {selected ? (
        <div className={styles.dialogCard}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={closeDialog}
            aria-label="Tutup profil"
          >
            ×
          </button>

          <div className={styles.dialogPhoto}>
            {selected.photoPath ? (
              <Image
                src={selected.photoPath}
                alt={`Foto ${selected.name}`}
                fill
                sizes="(max-width: 639px) 100vw, 300px"
                className={styles.photo}
              />
            ) : (
              <span className={styles.dialogInitials} aria-hidden="true">
                {getInitials(selected.name)}
              </span>
            )}
          </div>

          <div className={styles.dialogBody}>
            <p className={styles.dialogEyebrow}>Profil Siswa</p>
            <h2 id="student-dialog-title" className={styles.dialogName}>
              {selected.name}
            </h2>
            {selected.role ? (
              <p className={styles.dialogRole}>{selected.role}</p>
            ) : null}
            {selected.bio ? <p className={styles.dialogBio}>{selected.bio}</p> : null}

            {hasSocialLinks(selected) ? (
              <SocialLinks links={selected.socialLinks} showLabels />
            ) : (
              <p className={styles.noSocial}>Belum ada tautan sosial.</p>
            )}
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
