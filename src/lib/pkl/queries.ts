import "server-only";

import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { PKL_PAGE_SIZE } from "@/lib/pkl/constants";
import type { PklSubmissionSummary } from "@/lib/pkl/types";

const pklSubmissionSelect = {
  id: true,
  title: true,
  company: true,
  summary: true,
  reportUrl: true,
  status: true,
  reviewNote: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      fullName: true,
      username: true,
    },
  },
} satisfies Prisma.PklSubmissionSelect;

export const getPklSubmissionForUser = cache(
  async (userId: string): Promise<PklSubmissionSummary | null> => {
    return prisma.pklSubmission.findUnique({
      where: { userId },
      select: pklSubmissionSelect,
    });
  },
);

export async function getAdminPklSubmissions({
  page = 1,
  q = "",
}: {
  page?: number;
  q?: string;
}): Promise<{ items: PklSubmissionSummary[]; total: number }> {
  const where: Prisma.PklSubmissionWhereInput = q
    ? {
        OR: [
          { title: { contains: q } },
          { company: { contains: q } },
          { user: { fullName: { contains: q } } },
          { user: { username: { contains: q } } },
        ],
      }
    : {};

  const [total, items] = await prisma.$transaction([
    prisma.pklSubmission.count({ where }),
    prisma.pklSubmission.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PKL_PAGE_SIZE,
      take: PKL_PAGE_SIZE,
      select: pklSubmissionSelect,
    }),
  ]);

  return { items, total };
}

export function parsePklSearchParams(
  params: Record<string, string | string[] | undefined>,
): { q: string; page: number } {
  const qValue = firstParam(params.q)?.trim() ?? "";
  const pageValue = Number.parseInt(firstParam(params.page) ?? "", 10);

  return {
    q: qValue.slice(0, 100),
    page: Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1,
  };
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
