import type { PklStatus } from "@/generated/prisma/client";

export type PklSubmissionFormData = {
  title: string;
  company: string;
  summary: string;
  reportUrl: string;
  status: PklStatus;
  reviewNote: string | null;
  reviewedAt: Date | null;
  updatedAt: Date;
};

export type PklSubmissionListItem = {
  id: string;
  title: string;
  company: string;
  reportUrl: string;
  status: PklStatus;
  reviewNote: string | null;
  updatedAt: Date;
  user: {
    fullName: string;
    username: string;
  };
};
