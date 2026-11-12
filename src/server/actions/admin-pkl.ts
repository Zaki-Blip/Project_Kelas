"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma } from "@/generated/prisma/client";
import { safeAdminReturnPath, withAdminNotice } from "@/lib/admin/paths";
import { getAdminSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security/origin";
import {
  pklReviewSchema,
  pklSubmissionIdSchema,
} from "@/lib/validation/pkl";

const FALLBACK_PATH = "/admin/laporan-pkl";

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function revalidatePklPaths(): void {
  revalidatePath("/laporan-pkl");
  revalidatePath("/admin/laporan-pkl");
}

export async function reviewPklSubmissionAction(formData: FormData): Promise<void> {
  const returnTo = safeAdminReturnPath(
    getFormString(formData, "returnTo"),
    FALLBACK_PATH,
  );

  if (!(await getAdminSession())) {
    redirect("/dashboard?notice=forbidden");
  }

  try {
    await assertSameOrigin();
  } catch {
    redirect(withAdminNotice(returnTo, "pkl-invalid"));
  }

  const parsed = pklReviewSchema.safeParse({
    submissionId: getFormString(formData, "submissionId"),
    status: getFormString(formData, "status"),
    reviewNote: getFormString(formData, "reviewNote"),
  });

  if (!parsed.success) {
    redirect(withAdminNotice(returnTo, "pkl-invalid"));
  }

  let notice = "pkl-reviewed";

  try {
    await prisma.pklSubmission.update({
      where: { id: parsed.data.submissionId },
      data: {
        status: parsed.data.status,
        reviewNote:
          parsed.data.status === "SUBMITTED"
            ? null
            : parsed.data.reviewNote || null,
        reviewedAt: parsed.data.status === "SUBMITTED" ? null : new Date(),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      notice = "pkl-not-found";
    } else {
      console.error("Failed to review PKL submission.", error);
      notice = "error";
    }
  }

  if (notice === "pkl-reviewed") {
    revalidatePklPaths();
  }

  redirect(withAdminNotice(returnTo, notice));
}

export async function deletePklSubmissionAction(formData: FormData): Promise<void> {
  const returnTo = safeAdminReturnPath(
    getFormString(formData, "returnTo"),
    FALLBACK_PATH,
  );

  if (!(await getAdminSession())) {
    redirect("/dashboard?notice=forbidden");
  }

  try {
    await assertSameOrigin();
  } catch {
    redirect(withAdminNotice(returnTo, "pkl-invalid"));
  }

  const parsedId = pklSubmissionIdSchema.safeParse(
    getFormString(formData, "submissionId"),
  );

  if (!parsedId.success) {
    redirect(withAdminNotice(returnTo, "pkl-not-found"));
  }

  let notice = "pkl-deleted";

  try {
    await prisma.pklSubmission.delete({
      where: { id: parsedId.data },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      notice = "pkl-not-found";
    } else {
      console.error("Failed to delete PKL submission.", error);
      notice = "error";
    }
  }

  if (notice === "pkl-deleted") {
    revalidatePklPaths();
  }

  redirect(withAdminNotice(returnTo, notice));
}
