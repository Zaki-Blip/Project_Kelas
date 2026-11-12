import type { PklStatus } from "@/generated/prisma/client";

export type PklSubmissionSummary = {
  id: string;
  title: string;
  company: string;
  summary: string;
  reportUrl: string;
  status: PklStatus;
  reviewNote: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    fullName: string;
    username: string;
  };
};
