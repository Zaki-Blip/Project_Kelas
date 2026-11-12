import "server-only";

import { cookies } from "next/headers";

import {
  SESSION_MAX_AGE_SECONDS,
  getSessionCookieName,
  isProduction,
} from "@/lib/auth/constants";

export async function getSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();

  return cookieStore.get(getSessionCookieName())?.value ?? null;
}

export async function hasSessionCookie(): Promise<boolean> {
  const cookieStore = await cookies();

  return cookieStore.has(getSessionCookieName());
}

export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set({
    name: getSessionCookieName(),
    value: token,
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    maxAge: SESSION_MAX_AGE_SECONDS,
    priority: "high",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set({
    name: getSessionCookieName(),
    value: "",
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });
}
