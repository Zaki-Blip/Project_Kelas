"use server";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { getFormspreeEndpoint } from "@/lib/feedback/formspree";
import { assertSameOrigin } from "@/lib/security/origin";
import {
  feedbackCategoryLabels,
  feedbackSchema,
} from "@/lib/validation/feedback";
import type { FeedbackActionState } from "@/types/action";

const INVALID_REQUEST_ERROR =
  "Permintaan tidak valid. Muat ulang halaman lalu coba lagi.";
const NOT_CONFIGURED_ERROR =
  "Kotak saran belum aktif. Coba lagi nanti atau hubungi pengelola.";
const GENERIC_ERROR =
  "Tanggapan belum terkirim. Coba lagi beberapa saat lagi.";
const SUCCESS_PATH = "/?feedback=success#kotak-saran";

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function sanitizeSubjectPart(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, 120);
}

export async function submitFeedbackAction(
  _previousState: FeedbackActionState | undefined,
  formData: FormData,
): Promise<FeedbackActionState> {
  const user = await getCurrentUser();

  if (!user) {
    return { formError: "Kamu harus masuk untuk mengirim tanggapan." };
  }

  try {
    await assertSameOrigin();
  } catch {
    return { formError: INVALID_REQUEST_ERROR };
  }

  const honeypot = getFormString(formData, "_gotcha");

  if (honeypot) {
    redirect(SUCCESS_PATH);
  }

  const parsed = feedbackSchema.safeParse({
    category: getFormString(formData, "category"),
    message: getFormString(formData, "message"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const endpoint = getFormspreeEndpoint(env.FORMSPREE_ENDPOINT);

  if (!endpoint) {
    console.warn("FORMSPREE_ENDPOINT is not configured or invalid.");
    return { formError: NOT_CONFIGURED_ERROR };
  }

  const categoryLabel = feedbackCategoryLabels[parsed.data.category];
  const safeName = sanitizeSubjectPart(user.fullName);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: user.fullName,
        email: user.email,
        username: user.username,
        category: categoryLabel,
        message: parsed.data.message,
        source: "Beranda KaryaKelas",
        submittedAt: new Date().toISOString(),
        _subject: `[KaryaKelas] ${categoryLabel} dari ${safeName}`,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error("Formspree rejected feedback submission.", response.status);
      return { formError: GENERIC_ERROR };
    }
  } catch (error) {
    console.error("Failed to send feedback to Formspree.", error);
    return { formError: GENERIC_ERROR };
  }

  redirect(SUCCESS_PATH);
}
