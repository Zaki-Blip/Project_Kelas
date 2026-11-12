import { createHmac } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { cookieStore, cookieGetMock, cookieHasMock, cookieSetMock } = vi.hoisted(
  () => {
    const get = vi.fn();
    const has = vi.fn();
    const set = vi.fn();

    return {
      cookieStore: { get, has, set },
      cookieGetMock: get,
      cookieHasMock: has,
      cookieSetMock: set,
    };
  },
);

vi.mock("next/headers", () => ({
  cookies: async () => cookieStore,
}));

import {
  SESSION_COOKIE_NAME_DEVELOPMENT,
  SESSION_COOKIE_NAME_PRODUCTION,
  SESSION_MAX_AGE_MS,
  SESSION_MAX_AGE_SECONDS,
  getSessionCookieName,
  isProduction,
} from "@/lib/auth/constants";
import {
  clearSessionCookie,
  getSessionCookie,
  hasSessionCookie,
  setSessionCookie,
} from "@/lib/auth/cookies";
import {
  DUMMY_PASSWORD_HASH,
  PASSWORD_HASH_OPTIONS,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";
import {
  getClientIp,
  getUserAgent,
  hmac,
  sha256,
} from "@/lib/auth/request";

function headerReader(values: Record<string, string>) {
  return {
    get: (name: string) => values[name.toLowerCase()] ?? null,
  };
}

beforeEach(() => {
  cookieGetMock.mockReset();
  cookieHasMock.mockReset();
  cookieSetMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("request helpers", () => {
  it("reads the first forwarded IP and trims it", () => {
    expect(
      getClientIp(
        headerReader({ "x-forwarded-for": " 203.0.113.5 , 10.0.0.1" }),
      ),
    ).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip and then to unknown", () => {
    expect(
      getClientIp(
        headerReader({
          "x-forwarded-for": "   ",
          "x-real-ip": " 198.51.100.7 ",
        }),
      ),
    ).toBe("198.51.100.7");
    expect(getClientIp(headerReader({}))).toBe("unknown");
  });

  it("caps the forwarded IP at 100 characters", () => {
    expect(
      getClientIp(headerReader({ "x-forwarded-for": "1".repeat(150) })),
    ).toHaveLength(100);
  });

  it("trims and caps the user agent at 255 characters", () => {
    expect(getUserAgent(headerReader({ "user-agent": " Mozilla/5.0 " }))).toBe(
      "Mozilla/5.0",
    );
    expect(getUserAgent(headerReader({ "user-agent": "   " }))).toBeNull();
    expect(getUserAgent(headerReader({}))).toBeNull();
    expect(
      getUserAgent(headerReader({ "user-agent": "a".repeat(300) })),
    ).toHaveLength(255);
  });

  it("hashes with SHA-256 and the configured HMAC secret", () => {
    expect(sha256("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );

    const expected = createHmac("sha256", process.env.AUTH_SECRET ?? "")
      .update("abc")
      .digest("hex");

    expect(hmac("abc")).toBe(expected);
    expect(hmac("abc")).toHaveLength(64);
    expect(hmac("abc")).not.toBe(hmac("def"));
  });
});

describe("password helpers", () => {
  it("hashes and verifies an Argon2id password", async () => {
    const hash = await hashPassword("Test12345");

    expect(hash.startsWith("$argon2id$")).toBe(true);
    await expect(verifyPassword(hash, "Test12345")).resolves.toBe(true);
    await expect(verifyPassword(hash, "Wrong12345")).resolves.toBe(false);
  });

  it("uses the documented Argon2id parameters", () => {
    expect(PASSWORD_HASH_OPTIONS).toEqual({
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1,
      outputLen: 32,
    });
  });

  it("keeps a valid dummy hash for timing-consistent login failures", async () => {
    await expect(verifyPassword(DUMMY_PASSWORD_HASH, "anything")).resolves.toBe(
      false,
    );
  });
});

describe("session constants", () => {
  it("uses the development cookie outside production", () => {
    expect(isProduction()).toBe(false);
    expect(getSessionCookieName()).toBe(SESSION_COOKIE_NAME_DEVELOPMENT);
    expect(SESSION_MAX_AGE_SECONDS).toBe(604_800);
    expect(SESSION_MAX_AGE_MS).toBe(604_800_000);
  });

  it("uses the __Host- cookie in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(isProduction()).toBe(true);
    expect(getSessionCookieName()).toBe(SESSION_COOKIE_NAME_PRODUCTION);
    expect(SESSION_COOKIE_NAME_PRODUCTION).toBe("__Host-kk_session");
  });
});

describe("session cookies", () => {
  it("reads the current session cookie", async () => {
    cookieGetMock.mockReturnValue({ value: "token-value" });

    await expect(getSessionCookie()).resolves.toBe("token-value");
    expect(cookieGetMock).toHaveBeenCalledWith(SESSION_COOKIE_NAME_DEVELOPMENT);
  });

  it("returns null when the session cookie is absent", async () => {
    cookieGetMock.mockReturnValue(undefined);

    await expect(getSessionCookie()).resolves.toBeNull();
  });

  it("checks whether the session cookie exists", async () => {
    cookieHasMock.mockReturnValue(true);

    await expect(hasSessionCookie()).resolves.toBe(true);
    expect(cookieHasMock).toHaveBeenCalledWith(SESSION_COOKIE_NAME_DEVELOPMENT);
  });

  it("sets a hardened development cookie", async () => {
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

    await setSessionCookie("token-value", expiresAt);

    expect(cookieSetMock).toHaveBeenCalledWith({
      name: SESSION_COOKIE_NAME_DEVELOPMENT,
      value: "token-value",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
      maxAge: SESSION_MAX_AGE_SECONDS,
      priority: "high",
    });
  });

  it("sets a Secure __Host- cookie in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await setSessionCookie("token-value", new Date(0));

    expect(cookieSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: SESSION_COOKIE_NAME_PRODUCTION,
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        priority: "high",
      }),
    );
  });

  it("clears the session cookie immediately", async () => {
    await clearSessionCookie();

    expect(cookieSetMock).toHaveBeenCalledWith({
      name: SESSION_COOKIE_NAME_DEVELOPMENT,
      value: "",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    });
  });
});
