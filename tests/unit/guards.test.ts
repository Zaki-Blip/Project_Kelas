import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirectMock, getSessionMock, hasSessionCookieMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  getSessionMock: vi.fn(),
  hasSessionCookieMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/auth/session", () => ({
  getSession: getSessionMock,
}));

vi.mock("@/lib/auth/cookies", () => ({
  hasSessionCookie: hasSessionCookieMock,
}));

import {
  getAdminSession,
  requireAdmin,
  requireUser,
} from "@/lib/auth/guards";
import type { AuthSession } from "@/lib/auth/session";

const userSession: AuthSession = {
  id: "session-user",
  expiresAt: new Date(Date.now() + 60_000),
  user: {
    id: "user-1",
    fullName: "Budi Santoso",
    username: "budi",
    email: "budi@example.com",
    role: "USER",
  },
};

const adminSession: AuthSession = {
  ...userSession,
  id: "session-admin",
  user: {
    ...userSession.user,
    id: "admin-1",
    fullName: "Admin KaryaKelas",
    username: "admin",
    email: "admin@karyakelas.local",
    role: "ADMIN",
  },
};

beforeEach(() => {
  redirectMock.mockClear();
  getSessionMock.mockReset();
  hasSessionCookieMock.mockReset();
});

describe("requireUser", () => {
  it("returns the current session when authenticated", async () => {
    getSessionMock.mockResolvedValue(userSession);

    await expect(requireUser()).resolves.toBe(userSession);
    expect(hasSessionCookieMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects to login when no session or cookie exists", async () => {
    getSessionMock.mockResolvedValue(null);
    hasSessionCookieMock.mockResolvedValue(false);

    await expect(requireUser("/projects/kasir-kita")).rejects.toThrow(
      "REDIRECT:/login?next=%2Fprojects%2Fkasir-kita",
    );
    expect(hasSessionCookieMock).toHaveBeenCalledTimes(1);
  });

  it("marks the redirect as expired when a stale cookie exists", async () => {
    getSessionMock.mockResolvedValue(null);
    hasSessionCookieMock.mockResolvedValue(true);

    await expect(requireUser()).rejects.toThrow(
      "REDIRECT:/login?next=%2Fdashboard&expired=1",
    );
  });
});

describe("requireAdmin", () => {
  it("returns the session for an ADMIN user", async () => {
    getSessionMock.mockResolvedValue(adminSession);

    await expect(requireAdmin()).resolves.toBe(adminSession);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects a USER to the dashboard with a forbidden notice", async () => {
    getSessionMock.mockResolvedValue(userSession);

    await expect(requireAdmin()).rejects.toThrow(
      "REDIRECT:/dashboard?notice=forbidden",
    );
  });

  it("redirects unauthenticated visitors to login with the admin next path", async () => {
    getSessionMock.mockResolvedValue(null);
    hasSessionCookieMock.mockResolvedValue(false);

    await expect(requireAdmin("/admin/categories")).rejects.toThrow(
      "REDIRECT:/login?next=%2Fadmin%2Fcategories",
    );
  });
});

describe("getAdminSession", () => {
  it("returns the session for an ADMIN user", async () => {
    getSessionMock.mockResolvedValue(adminSession);

    await expect(getAdminSession()).resolves.toBe(adminSession);
  });

  it("returns null for a USER or an anonymous visitor", async () => {
    getSessionMock.mockResolvedValue(userSession);

    await expect(getAdminSession()).resolves.toBeNull();

    getSessionMock.mockResolvedValue(null);

    await expect(getAdminSession()).resolves.toBeNull();
  });
});
