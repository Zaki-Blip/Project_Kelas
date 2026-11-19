"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security/origin";
import { pklSubmissionSchema } from "@/lib/validation/pkl";
import type { AdminActionState } from "@/types/action";

const INVALID_REQUEST_ERROR =
  "Permintaan tidak valid. Muat ulang halaman lalu coba lagi.";
const GENERIC_ERROR = "Terjadi kesalahan. Coba lagi nanti.";

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function savePklSubmissionAction(
  _previousState: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await requireUser("/laporan-pkl");

  try {
    await assertSameOrigin();
  } catch {
    return { formError: INVALID_REQUEST_ERROR };
  }

  const parsed = pklSubmissionSchema.safeParse({
    title: getFormString(formData, "title"),
    company: getFormString(formData, "company"),
    summary: getFormString(formData, "summary"),
    reportUrl: getFormString(formData, "reportUrl"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let notice = "submitted";

  try {
    const existing = await prisma.pklSubmission.findUnique({
      where: { userId: session.user.id },
      select: { status: true },
    });

    if (existing?.status === "REVIEWED") {
      return {
        formError:
          "Laporan yang sudah ditinjau tidak dapat diubah. Hubungi pengelola jika perlu revisi.",
      };
    }

    if (existing) {
      notice = "updated";
    }

    await prisma.pklSubmission.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...parsed.data,
      },
      update: {
        ...parsed.data,
        status: "SUBMITTED",
        reviewNote: null,
        reviewedAt: null,
      },
      select: { id: true },
    });
  } catch (error) {
    console.error("Failed to save PKL submission.", error);
    return { formError: GENERIC_ERROR };
  }

  revalidatePath("/laporan-pkl");
  revalidatePath("/admin/laporan-pkl");
  redirect(`/laporan-pkl?notice=${notice}`);
}
