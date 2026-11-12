"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormField } from "@/components/auth/FormField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { loginAction } from "@/server/actions/auth";
import styles from "./auth-form.module.css";

type LoginFormProps = {
  nextPath: string;
  notice?: string;
};

export function LoginForm({ nextPath, notice }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className={styles.form} noValidate>
      <input type="hidden" name="next" value={nextPath} />

      {notice && !state?.formError ? (
        <p className={styles.alertSuccess} role="status">
          {notice}
        </p>
      ) : null}

      {state?.formError ? (
        <p className={styles.alert} role="alert">
          {state.formError}
        </p>
      ) : null}

      <FormField
        id="login-identifier"
        name="identifier"
        label="Email atau username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        defaultValue={state?.values?.identifier}
        error={state?.fieldErrors?.identifier}
        required
        maxLength={254}
      />

      <FormField
        id="login-password"
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        error={state?.fieldErrors?.password}
        required
        maxLength={128}
      />

      <SubmitButton pendingLabel="Memeriksa…" fullWidth>
        Masuk
      </SubmitButton>

      <p className={styles.switchText}>
        Belum punya akun?{" "}
        <Link href={`/register?next=${encodeURIComponent(nextPath)}`}>Daftar</Link>
      </p>
    </form>
  );
}
