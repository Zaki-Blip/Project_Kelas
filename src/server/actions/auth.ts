"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Role } from "@/generated/prisma/client";
import { createSession, destroySession } from "@/lib/auth/session";
import { hashPassword, DUMMY_PASSWORD_HASH, verifyPassword } from "@/lib/auth/password";
import { getClientIp } from "@/lib/auth/request";
import {
  clearLoginFailures,
  isLoginRateLimited,
  isRegisterRateLimited,
  recordLoginFailure,
  recordRegisterAttempt,
} from "@/lib/auth/rate-limit";
import { prisma } from "@/lib/db";
import { assertSameOrigin, OriginError } from "@/lib/security/origin";
import { safeNextPath } from "@/lib/security/urls";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import type { AuthActionState, AuthFormValues } from "@/types/action";

const INVALID_REQUEST_ERROR = "Permintaan tidak valid. Muat ulang halaman lalu coba lagi.";
const INVALID_LOGIN_ERROR = "Email/username atau password salah.";
const RATE_LIMIT_ERROR = "Terlalu banyak percobaan. Coba lagi nanti.";
const REGISTER_CONFLICT_ERROR = "Email atau username tidak dapat digunakan.";
const GENERIC_ERROR = "Terjadi kesalahan. Coba lagi nanti.";

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getOptionalFormString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);

  return typeof value === "string" ? value : undefined;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

function registrationValues(
  fullName: string,
  username: string,
  email: string,
): AuthFormValues {
  return { fullName, username, email };
}

export async function loginAction(
  previousState: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    await assertSameOrigin();
  } catch (error) {
    if (!(error instanceof OriginError)) {
      console.error("Login origin check failed.", error);
    }

    return { formError: INVALID_REQUEST_ERROR, values: previousState?.values };
  }

  const rawIdentifier = getFormString(formData, "identifier");
  const parsed = loginSchema.safeParse({
    identifier: rawIdentifier,
    password: getFormString(formData, "password"),
    next: getOptionalFormString(formData, "next"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: { identifier: rawIdentifier },
    };
  }

  const { identifier, password, next } = parsed.data;
  const nextPath = safeNextPath(next);

  try {
    const headerStore = await headers();
    const ip = getClientIp(headerStore);

    if (await isLoginRateLimited(identifier, ip)) {
      return { formError: RATE_LIMIT_ERROR, values: { identifier } };
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    let passwordMatches = false;

    if (user) {
      passwordMatches = await verifyPassword(user.passwordHash, password);
    } else {
      await verifyPassword(DUMMY_PASSWORD_HASH, password);
    }

    if (!user || !passwordMatches) {
      await recordLoginFailure(identifier, ip);

      return { formError: INVALID_LOGIN_ERROR, values: { identifier } };
    }

    await clearLoginFailures(identifier, ip);
    await createSession(user.id);
  } catch (error) {
    console.error("Login failed.", error);

    return { formError: GENERIC_ERROR, values: { identifier } };
  }

  redirect(nextPath);
}

export async function registerAction(
  previousState: AuthActionState | undefined,
  formData: FormData,
): Promise<AuthActionState> {
  try {
    await assertSameOrigin();
  } catch (error) {
    if (!(error instanceof OriginError)) {
      console.error("Registration origin check failed.", error);
    }

    return { formError: INVALID_REQUEST_ERROR, values: previousState?.values };
  }

  const rawFullName = getFormString(formData, "fullName");
  const rawUsername = getFormString(formData, "username");
  const rawEmail = getFormString(formData, "email");
  const values = registrationValues(rawFullName, rawUsername, rawEmail);
  const parsed = registerSchema.safeParse({
    fullName: rawFullName,
    username: rawUsername,
    email: rawEmail,
    password: getFormString(formData, "password"),
    confirmPassword: getFormString(formData, "confirmPassword"),
    next: getOptionalFormString(formData, "next"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
    };
  }

  const { fullName, username, email, password, next } = parsed.data;
  const nextPath = safeNextPath(next);

  try {
    const headerStore = await headers();
    const ip = getClientIp(headerStore);

    if (await isRegisterRateLimited(ip)) {
      return { formError: RATE_LIMIT_ERROR, values };
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
      select: { id: true },
    });

    if (existingUser) {
      await recordRegisterAttempt(ip);

      return { formError: REGISTER_CONFLICT_ERROR, values };
    }

    const passwordHash = await hashPassword(password);

    await recordRegisterAttempt(ip);
    await prisma.user.create({
      data: {
        fullName,
        username,
        email,
        passwordHash,
        role: Role.USER,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { formError: REGISTER_CONFLICT_ERROR, values };
    }

    console.error("Registration failed.", error);

    return { formError: GENERIC_ERROR, values };
  }

  redirect(`/login?registered=1&next=${encodeURIComponent(nextPath)}`);
}

export async function logoutAction(): Promise<void> {
  try {
    await assertSameOrigin();
  } catch (error) {
    if (!(error instanceof OriginError)) {
      console.error("Logout origin check failed.", error);
    }

    redirect("/");
  }

  try {
    await destroySession();
  } catch (error) {
    console.error("Logout failed.", error);
  }

  redirect("/");
}
