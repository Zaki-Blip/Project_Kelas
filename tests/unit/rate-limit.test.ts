import { beforeEach, describe, expect, it, vi } from "vitest";

const { countMock, createManyMock, createMock, deleteManyMock } = vi.hoisted(
  () => ({
    countMock: vi.fn(),
    createManyMock: vi.fn(),
    createMock: vi.fn(),
    deleteManyMock: vi.fn(),
  }),
);

vi.mock("@/lib/db", () => ({
  prisma: {
    authAttempt: {
      count: countMock,
      createMany: createManyMock,
      create: createMock,
      deleteMany: deleteManyMock,
    },
  },
}));

import { hmac } from "@/lib/auth/request";
import {
  clearLoginFailures,
  isLoginRateLimited,
  isRegisterRateLimited,
  recordLoginFailure,
  recordRegisterAttempt,
} from "@/lib/auth/rate-limit";

const IDENTIFIER = "budi";
const IP = "203.0.113.5";

beforeEach(() => {
  countMock.mockReset();
  createManyMock.mockReset();
  createMock.mockReset();
  deleteManyMock.mockReset();
  deleteManyMock.mockResolvedValue({ count: 0 });
});

describe("isLoginRateLimited", () => {
  it("allows attempts below both thresholds", async () => {
    countMock.mockResolvedValueOnce(4).mockResolvedValueOnce(19);

    await expect(isLoginRateLimited(IDENTIFIER, IP)).resolves.toBe(false);

    expect(deleteManyMock).toHaveBeenCalledWith({
      where: { createdAt: { lt: expect.any(Date) } },
    });
    expect(countMock).toHaveBeenNthCalledWith(1, {
      where: {
        action: "LOGIN",
        keyHash: hmac(`login:identifier:${IDENTIFIER}:ip:${IP}`),
        createdAt: { gte: expect.any(Date) },
      },
    });
    expect(countMock).toHaveBeenNthCalledWith(2, {
      where: {
        action: "LOGIN",
        keyHash: hmac(`login:ip:${IP}`),
        createdAt: { gte: expect.any(Date) },
      },
    });
  });

  it("blocks at five failures for the identifier and IP pair", async () => {
    countMock.mockResolvedValueOnce(5).mockResolvedValueOnce(0);

    await expect(isLoginRateLimited(IDENTIFIER, IP)).resolves.toBe(true);
  });

  it("blocks at twenty failures for the IP", async () => {
    countMock.mockResolvedValueOnce(0).mockResolvedValueOnce(20);

    await expect(isLoginRateLimited(IDENTIFIER, IP)).resolves.toBe(true);
  });

  it("cleans up attempts older than 24 hours", async () => {
    countMock.mockResolvedValueOnce(0).mockResolvedValueOnce(0);

    await isLoginRateLimited(IDENTIFIER, IP);

    const cleanup = deleteManyMock.mock.calls[0]?.[0] as {
      where: { createdAt: { lt: Date } };
    };
    const age = Date.now() - cleanup.where.createdAt.lt.getTime();

    expect(age).toBeGreaterThanOrEqual(24 * 60 * 60 * 1000 - 5_000);
    expect(age).toBeLessThanOrEqual(24 * 60 * 60 * 1000 + 5_000);
  });
});

describe("recordLoginFailure", () => {
  it("records both the identifier/IP key and the IP-only key", async () => {
    createManyMock.mockResolvedValue({ count: 2 });

    await recordLoginFailure(IDENTIFIER, IP);

    expect(createManyMock).toHaveBeenCalledWith({
      data: [
        {
          action: "LOGIN",
          keyHash: hmac(`login:identifier:${IDENTIFIER}:ip:${IP}`),
        },
        { action: "LOGIN", keyHash: hmac(`login:ip:${IP}`) },
      ],
    });
  });
});

describe("clearLoginFailures", () => {
  it("deletes only the identifier/IP key after a successful login", async () => {
    deleteManyMock.mockResolvedValue({ count: 1 });

    await clearLoginFailures(IDENTIFIER, IP);

    expect(deleteManyMock).toHaveBeenCalledWith({
      where: {
        action: "LOGIN",
        keyHash: hmac(`login:identifier:${IDENTIFIER}:ip:${IP}`),
      },
    });
  });
});

describe("register rate limiting", () => {
  it("allows four attempts per IP", async () => {
    countMock.mockResolvedValueOnce(4);

    await expect(isRegisterRateLimited(IP)).resolves.toBe(false);
    expect(countMock).toHaveBeenCalledWith({
      where: {
        action: "REGISTER",
        keyHash: hmac(`register:ip:${IP}`),
        createdAt: { gte: expect.any(Date) },
      },
    });
  });

  it("blocks at five attempts per IP", async () => {
    countMock.mockResolvedValueOnce(5);

    await expect(isRegisterRateLimited(IP)).resolves.toBe(true);
  });

  it("records a register attempt under the IP key", async () => {
    createMock.mockResolvedValue({});

    await recordRegisterAttempt(IP);

    expect(createMock).toHaveBeenCalledWith({
      data: {
        action: "REGISTER",
        keyHash: hmac(`register:ip:${IP}`),
      },
    });
  });
});
