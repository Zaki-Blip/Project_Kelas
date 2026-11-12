import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "md" | "lg";

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

type LinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children"> & {
    href: string;
  };

type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: never;
  };

type ButtonProps = LinkProps | NativeButtonProps;

export function Button(props: ButtonProps) {
  if ("href" in props && props.href) {
    const {
      href,
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      className,
      ...rest
    } = props;

    return (
      <Link
        href={href}
        className={cn(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className)}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  const {
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    className,
    ...rest
  } = props as NativeButtonProps;

  return (
    <button
      className={cn(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
