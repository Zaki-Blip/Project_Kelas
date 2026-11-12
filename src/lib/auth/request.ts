import "server-only";

import { createHash, createHmac } from "node:crypto";

import { env } from "@/lib/env";

type HeaderReader = {
  get(name: string): string | null;
};

const UNKNOWN_IP = "unknown";

export function getClientIp(headerStore: HeaderReader): string {
  const forwardedFor = headerStore.get("x-forwarded-for");

  if (forwardedFor) {
    const firstForwardedIp = forwardedFor.split(",")[0]?.trim();

    if (firstForwardedIp) {
      return firstForwardedIp.slice(0, 100);
    }
  }

  const realIp = headerStore.get("x-real-ip")?.trim();

  if (realIp) {
    return realIp.slice(0, 100);
  }

  return UNKNOWN_IP;
}

export function getUserAgent(headerStore: HeaderReader): string | null {
  const userAgent = headerStore.get("user-agent")?.trim();

  return userAgent ? userAgent.slice(0, 255) : null;
}

export function hmac(value: string): string {
  return createHmac("sha256", env.AUTH_SECRET).update(value).digest("hex");
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
