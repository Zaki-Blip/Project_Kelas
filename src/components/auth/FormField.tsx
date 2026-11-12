import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";
import styles from "./auth-form.module.css";

type FormFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  autoComplete?: string;
  autoCapitalize?: InputHTMLAttributes<HTMLInputElement>["autoCapitalize"];
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  spellCheck?: boolean;
  defaultValue?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  hint?: string;
  error?: string[];
};

export function FormField({
  id,
  name,
  label,
  type,
  autoComplete,
  autoCapitalize,
  inputMode,
  spellCheck,
  defaultValue,
  required,
  minLength,
  maxLength,
  hint,
  error,
}: FormFieldProps) {
  const errorMessage = error?.[0];
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = errorMessage ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        inputMode={inputMode}
        spellCheck={spellCheck}
        defaultValue={defaultValue}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        className={cn(styles.input, errorMessage && styles.inputError)}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={describedBy}
      />
      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {errorMessage ? (
        <p id={errorId} className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
