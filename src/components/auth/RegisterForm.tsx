"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormField } from "@/components/auth/FormField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { registerAction } from "@/server/actions/auth";
import styles from "./auth-form.module.css";

type RegisterFormProps = {
  nextPath: string;
};

export function RegisterForm({ nextPath }: RegisterFormProps) {
  const [state, formAction] = useActionState(registerAction, undefined);

  return (
    <form action={formAction} className={styles.form} noValidate>
      <input type="hidden" name="next" value={nextPath} />

      {state?.formError ? (
        <p className={styles.alert} role="alert">
          {state.formError}
        </p>
      ) : null}

      <FormField
        id="register-full-name"
        name="fullName"
        label="Nama lengkap"
        autoComplete="name"
        defaultValue={state?.values?.fullName}
        error={state?.fieldErrors?.fullName}
        required
        maxLength={80}
      />

      <FormField
        id="register-username"
        name="username"
        label="Username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        defaultValue={state?.values?.username}
        error={state?.fieldErrors?.username}
        hint="3–30 karakter. Gunakan huruf, angka, atau garis bawah."
        required
        minLength={3}
        maxLength={30}
      />

      <FormField
        id="register-email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        autoCapitalize="none"
        inputMode="email"
        spellCheck={false}
        defaultValue={state?.values?.email}
        error={state?.fieldErrors?.email}
        required
        maxLength={254}
      />

      <FormField
        id="register-password"
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        error={state?.fieldErrors?.password}
        hint="Minimal 8 karakter, harus mengandung huruf dan angka."
        required
        minLength={8}
        maxLength={128}
      />

      <FormField
        id="register-confirm-password"
        name="confirmPassword"
        label="Ulangi password"
        type="password"
        autoComplete="new-password"
        error={state?.fieldErrors?.confirmPassword}
        required
        maxLength={128}
      />

      <SubmitButton pendingLabel="Membuat akun…" fullWidth>
        Buat akun
      </SubmitButton>

      <p className={styles.switchText}>
        Sudah punya akun?{" "}
        <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>Masuk</Link>
      </p>
    </form>
  );
}
