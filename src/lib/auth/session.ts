import "server-only";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { cache } from "react";

import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { SESSION_MAX_AGE_MS } from "@/lib/auth/constants";
import { clearSessionCookie, getSessionCookie, setSessionCookie } from "@/lib/auth/cookies";
import { getClientIp, getUserAgent, hmac, sha256 } from "@/lib/auth/request";

export type SessionUser = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: Role;
};

export type AuthSession = {
  id: string;
  expiresAt: Date;
  user: SessionUser;
};

const sessionUserSelect = {
  id: true,
  fullName: true,
  username: true,
  email: true,
  role: true,
} as const;

export const getSession = cache(async (): Promise<AuthSession | null> => {
  const token = await getSessionCookie();

  if (!token) {
    return null;
  }

  try {
    const record = await prisma.session.findUnique({
      where: { tokenHash: sha256(token) },
      select: {
        id: true,
        expiresAt: true,
        user: { select: sessionUserSelect },
      },
    });

    if (!record || record.expiresAt.getTime() <= Date.now()) {
      return null;
    }

    return {
      id: record.id,
      expiresAt: record.expiresAt,
      user: record.user,
    };
  } catch (error) {
    console.error("Failed to read the current session.", error);
    return null;
  }
});

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getSession();

  return session?.user ?? null;
});

export async function createSession(userId: string): Promise<void> {
  const previousToken = await getSessionCookie();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);
  const headerStore = await headers();
  const ip = getClientIp(headerStore);
  const userAgent = getUserAgent(headerStore);

  if (previousToken) {
    await prisma.session.deleteMany({ where: { tokenHash: sha256(previousToken) } });
  }

  await prisma.session.deleteMany({
    where: {
      userId,
      expiresAt: { lt: new Date() },
    },
  });

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
      ipHash: ip === "unknown" ? null : hmac(ip),
      userAgent,
    },
  });

  try {
    await setSessionCookie(token, expiresAt);
  } catch (error) {
    await prisma.session.deleteMany({ where: { tokenHash } });
    throw error;
  }
}

export async function destroySession(): Promise<void> {
  const token = await getSessionCookie();

  try {
    if (token) {
      await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
    }
  } finally {
    await clearSessionCookie();
  }
}
