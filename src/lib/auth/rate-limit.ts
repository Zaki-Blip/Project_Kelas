import "server-only";

import { prisma } from "@/lib/db";
import { hmac } from "@/lib/auth/request";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;
const ATTEMPT_RETENTION_MS = 24 * 60 * 60 * 1000;

const LOGIN_IDENTIFIER_LIMIT = 5;
const LOGIN_IP_LIMIT = 20;
const REGISTER_IP_LIMIT = 5;

function loginIdentifierKey(identifier: string, ip: string): string {
  return hmac(`login:identifier:${identifier}:ip:${ip}`);
}

function loginIpKey(ip: string): string {
  return hmac(`login:ip:${ip}`);
}

function registerIpKey(ip: string): string {
  return hmac(`register:ip:${ip}`);
}

async function cleanupOldAttempts(): Promise<void> {
  await prisma.authAttempt.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - ATTEMPT_RETENTION_MS) } },
  });
}

export async function isLoginRateLimited(identifier: string, ip: string): Promise<boolean> {
  await cleanupOldAttempts();

  const since = new Date(Date.now() - LOGIN_WINDOW_MS);
  const identifierKey = loginIdentifierKey(identifier, ip);
  const ipKey = loginIpKey(ip);

  const [identifierCount, ipCount] = await Promise.all([
    prisma.authAttempt.count({
      where: {
        action: "LOGIN",
        keyHash: identifierKey,
        createdAt: { gte: since },
      },
    }),
    prisma.authAttempt.count({
      where: {
        action: "LOGIN",
        keyHash: ipKey,
        createdAt: { gte: since },
      },
    }),
  ]);

  return identifierCount >= LOGIN_IDENTIFIER_LIMIT || ipCount >= LOGIN_IP_LIMIT;
}

export async function recordLoginFailure(identifier: string, ip: string): Promise<void> {
  await prisma.authAttempt.createMany({
    data: [
      { action: "LOGIN", keyHash: loginIdentifierKey(identifier, ip) },
      { action: "LOGIN", keyHash: loginIpKey(ip) },
    ],
  });
}

export async function clearLoginFailures(identifier: string, ip: string): Promise<void> {
  await prisma.authAttempt.deleteMany({
    where: {
      action: "LOGIN",
      keyHash: loginIdentifierKey(identifier, ip),
    },
  });
}

export async function isRegisterRateLimited(ip: string): Promise<boolean> {
  await cleanupOldAttempts();

  const count = await prisma.authAttempt.count({
    where: {
      action: "REGISTER",
      keyHash: registerIpKey(ip),
      createdAt: { gte: new Date(Date.now() - REGISTER_WINDOW_MS) },
    },
  });

  return count >= REGISTER_IP_LIMIT;
}

export async function recordRegisterAttempt(ip: string): Promise<void> {
  await prisma.authAttempt.create({
    data: {
      action: "REGISTER",
      keyHash: registerIpKey(ip),
    },
  });
}
