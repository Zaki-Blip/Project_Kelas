"use client";

import { useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import styles from "./ConfirmDeleteButton.module.css";

function subscribeToNothing(): () => void {
  return () => {};
}

function getClientSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

type ConfirmDeleteButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  title: string;
  description: string;
  confirmLabel: string;
  triggerLabel?: string;
  disabled?: boolean;
  disabledReason?: string;
};

export function ConfirmDeleteButton({
  action,
  fields,
  title,
  description,
  confirmLabel,
  triggerLabel = "Hapus",
  disabled = false,
  disabledReason,
}: ConfirmDeleteButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className={styles.triggerDisabled}
        aria-label={`${triggerLabel}. ${disabledReason ?? "Tidak tersedia."}`}
        title={disabledReason}
      >
        {triggerLabel}
      </button>
    );
  }

  const dialog = (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          dialogRef.current?.close();
        }
      }}
    >
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      <p id={descriptionId} className={styles.text}>
        {description}
      </p>

      <form action={action} className={styles.form}>
        {Object.entries(fields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}

        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            onClick={() => dialogRef.current?.close()}
          >
            Batal
          </Button>
          <SubmitButton pendingLabel="Menghapus…" variant="danger">
            {confirmLabel}
          </SubmitButton>
        </div>
      </form>
    </dialog>
  );

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        aria-label={title.replace(/\?$/, "")}
      >
        {triggerLabel}
      </button>

      {mounted ? createPortal(dialog, document.body) : null}
    </>
  );
}
