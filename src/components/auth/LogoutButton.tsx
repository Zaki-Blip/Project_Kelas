"use client";

import { useFormStatus } from "react-dom";

import { logoutAction } from "@/server/actions/auth";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import styles from "./LogoutButton.module.css";

type LogoutButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

function LogoutSubmit({ variant, size, fullWidth }: LogoutButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? "Keluar…" : "Keluar"}
    </Button>
  );
}

export function LogoutButton({ fullWidth = false, ...props }: LogoutButtonProps) {
  return (
    <form action={logoutAction} className={cn(styles.form, fullWidth && styles.fullWidth)}>
      <LogoutSubmit fullWidth={fullWidth} {...props} />
    </form>
  );
}
