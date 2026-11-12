import "server-only";

import { headers } from "next/headers";

import { env } from "@/lib/env";

export class OriginError extends Error {
  constructor(message = "Cross-origin request rejected.") {
    super(message);
    this.name = "OriginError";
  }
}

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

export async function assertSameOrigin(): Promise<void> {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (!origin) {
    throw new OriginError("Missing Origin header.");
  }

  const expectedOrigin = new URL(env.APP_URL).origin;
  let originUrl: URL;

  try {
    originUrl = new URL(origin);
  } catch {
    throw new OriginError("Invalid Origin header.");
  }

  if (originUrl.origin === expectedOrigin) {
    return;
  }

  if (originUrl.protocol !== "http:" && originUrl.protocol !== "https:") {
    throw new OriginError("Unsupported Origin protocol.");
  }

  const host =
    firstHeaderValue(headerStore.get("x-forwarded-host")) ?? firstHeaderValue(headerStore.get("host"));

  if (host && originUrl.host.toLowerCase() === host.toLowerCase()) {
    return;
  }

  throw new OriginError("Origin does not match the request host.");
}
