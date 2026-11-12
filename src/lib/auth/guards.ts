import "server-only";

import { redirect } from "next/navigation";

import type { AuthSession } from "@/lib/auth/session";
import { hasSessionCookie } from "@/lib/auth/cookies";
import { getSession } from "@/lib/auth/session";

function redirectToLogin(nextPath: string, expired: boolean): never {
  const params = new URLSearchParams({ next: nextPath });

  if (expired) {
    params.set("expired", "1");
  }

  redirect(`/login?${params.toString()}`);
}

export async function requireUser(nextPath = "/dashboard"): Promise<AuthSession> {
  const session = await getSession();

  if (!session) {
    redirectToLogin(nextPath, await hasSessionCookie());
  }

  return session;
}

export async function requireAdmin(nextPath = "/admin"): Promise<AuthSession> {
  const session = await requireUser(nextPath);

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard?notice=forbidden");
  }

  return session;
}

/**
 * Server Action variant of the admin guard. Actions must return a safe error
 * instead of redirecting so the caller cannot use them as a navigation oracle.
 */
export async function getAdminSession(): Promise<AuthSession | null> {
  const session = await getSession();

  return session?.user.role === "ADMIN" ? session : null;
}
