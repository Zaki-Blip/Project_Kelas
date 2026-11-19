"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma } from "@/generated/prisma/client";
import { safeAdminReturnPath, withAdminNotice } from "@/lib/admin/paths";
import { getAdminSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { assertSameOrigin } from "@/lib/security/origin";
import { deleteBlobsBestEffort } from "@/lib/storage/blob";
import { parseAdminId } from "@/lib/validation/admin";
import {
  classProfileFormSchema,
  studentProfileFormSchema,
} from "@/lib/validation/profiles";
import type { AdminActionState } from "@/types/action";

const FALLBACK_PATH = "/admin/profil-kelas";
const INVALID_REQUEST_ERROR =
  "Permintaan tidak valid. Muat ulang halaman lalu coba lagi.";
const FORBIDDEN_ERROR = "Kamu tidak memiliki akses ke tindakan ini.";
const GENERIC_ERROR = "Terjadi kesalahan. Coba lagi nanti.";

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function revalidateProfilePaths(): void {
  revalidatePath("/profil-kelas");
  revalidatePath("/admin/profil-kelas");
}

export async function saveClassProfileAction(
  _previousState: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await getAdminSession())) {
    return { formError: FORBIDDEN_ERROR };
  }

  try {
    await assertSameOrigin();
  } catch {
    return { formError: INVALID_REQUEST_ERROR };
  }

  const returnTo = safeAdminReturnPath(
    getFormString(formData, "returnTo"),
    FALLBACK_PATH,
  );
  const parsed = classProfileFormSchema.safeParse({
    className: getFormString(formData, "className"),
    tagline: getFormString(formData, "tagline"),
    description: getFormString(formData, "description"),
    photoPath: getFormString(formData, "photoPath"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  let oldPhotoPath: string | null = null;

  try {
    const existing = await prisma.classProfile.findUnique({
      where: { id: 1 },
      select: { photoPath: true },
    });

    oldPhotoPath = existing?.photoPath ?? null;

    await prisma.classProfile.upsert({
      where: { id: 1 },
      create: {
        className: data.className,
        tagline: data.tagline || null,
        description: data.description || null,
        photoPath: data.photoPath || null,
      },
      update: {
        className: data.className,
        tagline: data.tagline || null,
        description: data.description || null,
        photoPath: data.photoPath || null,
      },
      select: { id: true },
    });
  } catch (error) {
    console.error("Failed to save class profile.", error);

    return { formError: GENERIC_ERROR };
  }

  await deleteBlobsBestEffort(
    oldPhotoPath && oldPhotoPath !== data.photoPath ? [oldPhotoPath] : [],
  );
  revalidateProfilePaths();
  redirect(withAdminNotice(returnTo, "profile-updated"));
}

export async function saveStudentProfileAction(
  _previousState: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await getAdminSession())) {
    return { formError: FORBIDDEN_ERROR };
  }

  try {
    await assertSameOrigin();
  } catch {
    return { formError: INVALID_REQUEST_ERROR };
  }

  const returnTo = safeAdminReturnPath(
    getFormString(formData, "returnTo"),
    FALLBACK_PATH,
  );
  const isVisible =
    getFormString(formData, "isVisible") === "on" ||
    getFormString(formData, "isVisible") === "true";
  const parsed = studentProfileFormSchema.safeParse({
    studentId: getFormString(formData, "studentId"),
    name: getFormString(formData, "name"),
    role: getFormString(formData, "role"),
    bio: getFormString(formData, "bio"),
    photoPath: getFormString(formData, "photoPath"),
    socialLinks: getFormString(formData, "socialLinks"),
    sortOrder: getFormString(formData, "sortOrder"),
    isVisible,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const studentId = data.studentId ? parseAdminId(data.studentId) : null;

  if (data.studentId && !studentId) {
    return { formError: "Data siswa tidak valid. Muat ulang halaman lalu coba lagi." };
  }

  let existing: { photoPath: string } | null = null;

  if (studentId) {
    try {
      existing = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        select: { photoPath: true },
      });
    } catch (error) {
      console.error("Failed to prepare student profile save.", error);

      return { formError: GENERIC_ERROR };
    }

    if (!existing) {
      return { formError: "Profil siswa tidak ditemukan." };
    }
  }

  const values = {
    name: data.name,
    role: data.role || null,
    bio: data.bio || null,
    photoPath: data.photoPath,
    socialLinks: data.socialLinks || null,
    sortOrder: data.sortOrder,
    isVisible: data.isVisible,
  };

  try {
    if (studentId) {
      await prisma.studentProfile.update({
        where: { id: studentId },
        data: values,
        select: { id: true },
      });
    } else {
      await prisma.studentProfile.create({
        data: values,
        select: { id: true },
      });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { formError: "Profil siswa tidak ditemukan." };
      }
    }

    console.error("Failed to save student profile.", error);

    return { formError: GENERIC_ERROR };
  }

  await deleteBlobsBestEffort(
    existing && existing.photoPath !== data.photoPath ? [existing.photoPath] : [],
  );
  revalidateProfilePaths();
  redirect(withAdminNotice(returnTo, studentId ? "student-updated" : "student-created"));
}

export async function deleteStudentProfileAction(formData: FormData): Promise<void> {
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
    redirect(withAdminNotice(returnTo, "invalid"));
  }

  const studentId = parseAdminId(getFormString(formData, "studentId"));

  if (!studentId) {
    redirect(withAdminNotice(returnTo, "student-not-found"));
  }

  let notice = "student-deleted";
  let photoPath: string | null = null;

  try {
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { photoPath: true },
    });

    if (!student) {
      notice = "student-not-found";
    } else {
      photoPath = student.photoPath;
      await prisma.studentProfile.delete({
        where: { id: studentId },
        select: { id: true },
      });
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      notice = "student-not-found";
    } else {
      console.error("Failed to delete student profile.", error);
      notice = "error";
    }
  }

  if (notice === "student-deleted") {
    await deleteBlobsBestEffort([photoPath]);
    revalidateProfilePaths();
  }

  redirect(withAdminNotice(returnTo, notice));
}
