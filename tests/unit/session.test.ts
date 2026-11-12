import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  headerStore,
  findUniqueMock,
  deleteManyMock,
  createMock,
  getSessionCookieMock,
  setSessionCookieMock,
  clearSessionCookieMock,
} = vi.hoisted(() => ({
  headerStore: new Map<string, string>(),
  findUniqueMock: vi.fn(),
  deleteManyMock: vi.fn(),
  createMock: vi.fn(),
  getSessionCookieMock: vi.fn(),
  setSessionCookieMock: vi.fn(),
  clearSessionCookieMock: vi.fn(),
}));

vi.mock("react", () => ({
  cache: (fn: unknown) => fn,
}));

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => headerStore.get(name.toLowerCase()) ?? null,
  }),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    session: {
      findUnique: findUniqueMock,
      deleteMany: deleteManyMock,
      create: createMock,
    },
  },
}));

vi.mock("@/lib/auth/cookies", () => ({
  getSessionCookie: getSessionCookieMock,
  setSessionCookie: setSessionCookieMock,
  clearSessionCookie: clearSessionCookieMock,
}));

import { SESSION_MAX_AGE_MS } from "@/lib/auth/constants";
import { hmac, sha256 } from "@/lib/auth/request";
import {
  createSession,
  destroySession,
  getCurrentUser,
  getSession,
} from "@/lib/auth/session";

const user = {
  id: "user-1",
  fullName: "Budi Santoso",
  username: "budi",
  email: "budi@example.com",
  role: "USER" as const,
};

function sessionRecord(expiresAt: Date) {
  return { id: "session-1", expiresAt, user };
}

function createdSessionData() {
  const createArgs = createMock.mock.calls[0]?.[0] as {
    data: {
      tokenHash: string;
      userId: string;
      expiresAt: Date;
      ipHash: string | null;
      userAgent: string | null;
    };
  };

  return createArgs.data;
}

beforeEach(() => {
  headerStore.clear();
  findUniqueMock.mockReset();
  deleteManyMock.mockReset();
  createMock.mockReset();
  getSessionCookieMock.mockReset();
  setSessionCookieMock.mockReset();
  clearSessionCookieMock.mockReset();

  deleteManyMock.mockResolvedValue({ count: 0 });
  createMock.mockResolvedValue({});
  setSessionCookieMock.mockResolvedValue(undefined);
  clearSessionCookieMock.mockResolvedValue(undefined);
});

describe("getSession", () => {
  it("returns null without a session cookie", async () => {
    getSessionCookieMock.mockResolvedValue(null);

    await expect(getSession()).resolves.toBeNull();
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("looks up the token hash and returns an unexpired session", async () => {
    const record = sessionRecord(new Date(Date.now() + 60_000));

    getSessionCookieMock.mockResolvedValue("token-value");
    findUniqueMock.mockResolvedValue(record);

    await expect(getSession()).resolves.toEqual(record);
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { tokenHash: sha256("token-value") },
      select: {
        id: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });
  });

  it("returns null for an expired session", async () => {
    getSessionCookieMock.mockResolvedValue("token-value");
    findUniqueMock.mockResolvedValue(sessionRecord(new Date(Date.now() - 1)));

    await expect(getSession()).resolves.toBeNull();
  });

  it("returns null and logs when the lookup fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    getSessionCookieMock.mockResolvedValue("token-value");
    findUniqueMock.mockRejectedValue(new Error("database unavailable"));

    await expect(getSession()).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });
});

describe("getCurrentUser", () => {
  it("returns the user from the current session", async () => {
    getSessionCookieMock.mockResolvedValue("token-value");
    findUniqueMock.mockResolvedValue(sessionRecord(new Date(Date.now() + 60_000)));

    await expect(getCurrentUser()).resolves.toEqual(user);
  });

  it("returns null without a session", async () => {
    getSessionCookieMock.mockResolvedValue(null);

    await expect(getCurrentUser()).resolves.toBeNull();
  });
});

describe("createSession", () => {
  it("creates a hashed 7-day session and sets the cookie", async () => {
    getSessionCookieMock.mockResolvedValue(null);
    headerStore.set("x-forwarded-for", "203.0.113.5");
    headerStore.set("user-agent", "Mozilla/5.0");

    const before = Date.now();

    await createSession("user-1");

    const after = Date.now();
    const data = createdSessionData();

    expect(data.userId).toBe("user-1");
    expect(data.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(data.expiresAt.getTime()).toBeGreaterThanOrEqual(
      before + SESSION_MAX_AGE_MS - 1_000,
    );
    expect(data.expiresAt.getTime()).toBeLessThanOrEqual(
      after + SESSION_MAX_AGE_MS + 1_000,
    );
    expect(data.ipHash).toBe(hmac("203.0.113.5"));
    expect(data.userAgent).toBe("Mozilla/5.0");

    expect(deleteManyMock).toHaveBeenCalledTimes(1);
    expect(deleteManyMock).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        expiresAt: { lt: expect.any(Date) },
      },
    });

    const [token, expiresAt] = setSessionCookieMock.mock.calls[0] as [
      string,
      Date,
    ];

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(sha256(token)).toBe(data.tokenHash);
    expect(expiresAt).toBe(data.expiresAt);
  });

  it("rotates an existing session and removes expired sessions", async () => {
    getSessionCookieMock.mockResolvedValue("previous-token");

    await createSession("user-1");

    expect(deleteManyMock).toHaveBeenNthCalledWith(1, {
      where: { tokenHash: sha256("previous-token") },
    });
    expect(deleteManyMock).toHaveBeenNthCalledWith(2, {
      where: {
        userId: "user-1",
        expiresAt: { lt: expect.any(Date) },
      },
    });
    expect(createMock).toHaveBeenCalledTimes(1);
    expect(setSessionCookieMock).toHaveBeenCalledTimes(1);
  });

  it("stores a null ipHash when the client IP is unknown", async () => {
    getSessionCookieMock.mockResolvedValue(null);

    await createSession("user-1");

    expect(createdSessionData().ipHash).toBeNull();
  });

  it("deletes the new session if setting the cookie fails", async () => {
    getSessionCookieMock.mockResolvedValue(null);
    setSessionCookieMock.mockRejectedValue(new Error("cookie failed"));

    await expect(createSession("user-1")).rejects.toThrow("cookie failed");

    const data = createdSessionData();

    expect(deleteManyMock).toHaveBeenLastCalledWith({
      where: { tokenHash: data.tokenHash },
    });
  });
});

describe("destroySession", () => {
  it("revokes the current session and clears the cookie", async () => {
    getSessionCookieMock.mockResolvedValue("token-value");

    await destroySession();

    expect(deleteManyMock).toHaveBeenCalledWith({
      where: { tokenHash: sha256("token-value") },
    });
    expect(clearSessionCookieMock).toHaveBeenCalledTimes(1);
  });

  it("clears the cookie even without a token", async () => {
    getSessionCookieMock.mockResolvedValue(null);

    await destroySession();

    expect(deleteManyMock).not.toHaveBeenCalled();
    expect(clearSessionCookieMock).toHaveBeenCalledTimes(1);
  });

  it("clears the cookie when the database delete fails", async () => {
    getSessionCookieMock.mockResolvedValue("token-value");
    deleteManyMock.mockRejectedValue(new Error("database unavailable"));

    await expect(destroySession()).rejects.toThrow("database unavailable");
    expect(clearSessionCookieMock).toHaveBeenCalledTimes(1);
  });
});
