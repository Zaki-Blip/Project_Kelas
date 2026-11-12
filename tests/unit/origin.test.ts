import { beforeEach, describe, expect, it, vi } from "vitest";

const { headerStore } = vi.hoisted(() => ({
  headerStore: new Map<string, string>(),
}));

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => headerStore.get(name.toLowerCase()) ?? null,
  }),
}));

import { assertSameOrigin, OriginError } from "@/lib/security/origin";

beforeEach(() => {
  headerStore.clear();
});

describe("assertSameOrigin", () => {
  it("accepts the configured application origin", async () => {
    headerStore.set("origin", "http://localhost:3000");

    await expect(assertSameOrigin()).resolves.toBeUndefined();
  });

  it("rejects a missing Origin header", async () => {
    await expect(assertSameOrigin()).rejects.toBeInstanceOf(OriginError);
    await expect(assertSameOrigin()).rejects.toThrow("Missing Origin header.");
  });

  it("rejects an invalid Origin header", async () => {
    headerStore.set("origin", "not a url");

    await expect(assertSameOrigin()).rejects.toThrow("Invalid Origin header.");
  });

  it("rejects unsupported Origin protocols", async () => {
    headerStore.set("origin", "ftp://localhost:3000");

    await expect(assertSameOrigin()).rejects.toThrow(
      "Unsupported Origin protocol.",
    );
  });

  it("accepts a cross-origin request whose forwarded host matches", async () => {
    headerStore.set("origin", "https://preview-abc.vercel.app");
    headerStore.set("x-forwarded-host", "preview-abc.vercel.app, proxy.internal");

    await expect(assertSameOrigin()).resolves.toBeUndefined();
  });

  it("accepts a cross-origin request whose host matches", async () => {
    headerStore.set("origin", "http://localhost:3001");
    headerStore.set("host", "localhost:3001");

    await expect(assertSameOrigin()).resolves.toBeUndefined();
  });

  it("prefers the forwarded host over the host header", async () => {
    headerStore.set("origin", "https://a.example");
    headerStore.set("x-forwarded-host", "a.example");
    headerStore.set("host", "b.example");

    await expect(assertSameOrigin()).resolves.toBeUndefined();

    headerStore.set("x-forwarded-host", "b.example");

    await expect(assertSameOrigin()).rejects.toThrow(
      "Origin does not match the request host.",
    );
  });

  it("trims the first forwarded host value", async () => {
    headerStore.set("origin", "https://a.example");
    headerStore.set("x-forwarded-host", "  a.example , b.example ");

    await expect(assertSameOrigin()).resolves.toBeUndefined();
  });

  it("rejects a cross-origin request with a mismatched host", async () => {
    headerStore.set("origin", "https://evil.example");
    headerStore.set("host", "localhost:3000");

    await expect(assertSameOrigin()).rejects.toThrow(
      "Origin does not match the request host.",
    );
  });
});
