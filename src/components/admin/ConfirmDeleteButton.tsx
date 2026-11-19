"use client";

import { useId, useRef } from "react";

import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import styles from "./ConfirmDeleteButton.module.css";

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleId = useId();
  const descriptionId = useId();

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

  function handleDialogClose() {
    if (triggerRef.current?.isConnected) {
      triggerRef.current.focus();
    }
  }

  function handleOpen() {
    const dialog = dialogRef.current;

    if (dialog && typeof dialog.showModal === "function") {
      try {
        dialog.showModal();
        return;
      } catch {
        // Fall back to a native confirmation when the dialog cannot open.
      }
    }

    if (window.confirm(`${title}\n\n${description}`)) {
      const submitButton = formRef.current?.querySelector<HTMLButtonElement>(
        'button[type="submit"]',
      );
      submitButton?.click();
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={handleOpen}
        aria-haspopup="dialog"
        aria-label={title.replace(/\?$/, "")}
      >
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={handleDialogClose}
        onCancel={(event) => {
          event.preventDefault();
          dialogRef.current?.close();
        }}
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

        <form ref={formRef} action={action} className={styles.form}>
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
    </>
  );
}
