"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma } from "@/generated/prisma/client";
import { safeAdminReturnPath, withAdminNotice } from "@/lib/admin/paths";
import { getAdminSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { isAllowedImagePath } from "@/lib/security/images";
import { assertSameOrigin } from "@/lib/security/origin";
import { getGitHubUrl, getPreviewUrl } from "@/lib/security/urls";
import { deleteBlobsBestEffort } from "@/lib/storage/blob";
import { parseAdminId, projectFormSchema } from "@/lib/validation/admin";
import type { AdminActionState } from "@/types/action";

const INVALID_REQUEST_ERROR = "Permintaan tidak valid. Muat ulang halaman lalu coba lagi.";
const FORBIDDEN_ERROR = "Kamu tidak memiliki akses ke tindakan ini.";
const GENERIC_ERROR = "Terjadi kesalahan. Coba lagi nanti.";
const IMAGE_DATA_ERROR = "Data screenshot tidak valid. Muat ulang halaman lalu coba lagi.";

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getFormStrings(formData: FormData, key: string): string[] {
  return formData.getAll(key).filter((value): value is string => typeof value === "string");
}

function parseImagesField(formData: FormData): { images: unknown[] } | { error: string } {
  const raw = getFormString(formData, "images").trim();

  if (!raw) {
    return { images: [] };
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed) ? { images: parsed } : { error: IMAGE_DATA_ERROR };
  } catch {
    return { error: IMAGE_DATA_ERROR };
  }
}

function revalidateProjectPaths(slug: string, oldSlug?: string): void {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath(`/projects/${slug}`);
  revalidatePath(`/projects/${slug}/preview`);
  revalidatePath("/projects/[slug]", "page");

  if (oldSlug && oldSlug !== slug) {
    revalidatePath(`/projects/${oldSlug}`);
    revalidatePath(`/projects/${oldSlug}/preview`);
  }
}

export async function saveProjectAction(
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

  const returnTo = safeAdminReturnPath(getFormString(formData, "returnTo"));
  const imagesResult = parseImagesField(formData);

  if ("error" in imagesResult) {
    return { fieldErrors: { images: [imagesResult.error] } };
  }

  const parsed = projectFormSchema.safeParse({
    projectId: getFormString(formData, "projectId"),
    title: getFormString(formData, "title"),
    slug: getFormString(formData, "slug"),
    summary: getFormString(formData, "summary"),
    description: getFormString(formData, "description"),
    categoryId: getFormString(formData, "categoryId"),
    creatorId: getFormString(formData, "creatorId"),
    technologyIds: getFormStrings(formData, "technologyIds"),
    memberIds: getFormStrings(formData, "memberIds"),
    githubUrl: getFormString(formData, "githubUrl"),
    previewUrl: getFormString(formData, "previewUrl"),
    status: getFormString(formData, "status"),
    thumbnailPath: getFormString(formData, "thumbnailPath"),
    images: imagesResult.images,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const projectId = data.projectId || null;
  const fieldErrors: Record<string, string[] | undefined> = {};
  const thumbnailPath = data.thumbnailPath.trim();
  const githubUrl = data.githubUrl ? getGitHubUrl(data.githubUrl) : null;
  const previewUrl = data.previewUrl ? getPreviewUrl(data.previewUrl) : null;

  if (data.githubUrl && !githubUrl) {
    fieldErrors.githubUrl = ["Gunakan URL GitHub HTTPS yang valid."];
  }

  if (data.previewUrl && !previewUrl) {
    fieldErrors.previewUrl = [
      "Gunakan URL HTTPS dari domain preview yang diizinkan.",
    ];
  }

  if (thumbnailPath && !isAllowedImagePath(thumbnailPath)) {
    fieldErrors.thumbnailPath = ["Thumbnail tidak valid. Unggah ulang gambar."];
  }

  if (data.status === "PUBLISHED" && !thumbnailPath) {
    fieldErrors.thumbnailPath = ["Thumbnail wajib diisi untuk project yang diterbitkan."];
  }

  const images = data.images.map((image, index) => ({
    url: image.url.trim(),
    caption: image.caption.trim(),
    sortOrder: index + 1,
  }));

  for (const image of images) {
    if (!isAllowedImagePath(image.url)) {
      fieldErrors.images = ["Screenshot tidak valid. Unggah ulang gambar."];
      break;
    }
  }

  const technologyIds = Array.from(new Set(data.technologyIds));
  const memberIds = Array.from(new Set(data.memberIds)).filter(
    (userId) => userId !== data.creatorId,
  );

  try {
    const [category, creator, technologies, members] = await Promise.all([
      prisma.category.findUnique({
        where: { id: data.categoryId },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { id: data.creatorId },
        select: { id: true },
      }),
      prisma.technology.findMany({
        where: { id: { in: technologyIds } },
        select: { id: true },
      }),
      prisma.user.findMany({
        where: { id: { in: memberIds } },
        select: { id: true },
      }),
    ]);

    if (!category) {
      fieldErrors.categoryId = ["Kategori tidak ditemukan."];
    }

    if (!creator) {
      fieldErrors.creatorId = ["Creator tidak ditemukan."];
    }

    if (technologies.length !== technologyIds.length) {
      fieldErrors.technologyIds = ["Teknologi tidak valid."];
    }

    if (members.length !== memberIds.length) {
      fieldErrors.memberIds = ["Anggota tim tidak valid."];
    }
  } catch (error) {
    console.error("Failed to validate project relations.", error);

    return { formError: GENERIC_ERROR };
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  let existing: {
    slug: string;
    thumbnailPath: string | null;
    publishedAt: Date | null;
    images: Array<{ imagePath: string }>;
  } | null = null;

  try {
    const conflict = await prisma.project.findFirst({
      where: {
        slug: data.slug,
        ...(projectId ? { NOT: { id: projectId } } : {}),
      },
      select: { id: true },
    });

    if (conflict) {
      return { fieldErrors: { slug: ["Slug sudah digunakan."] } };
    }

    if (projectId) {
      existing = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          slug: true,
          thumbnailPath: true,
          publishedAt: true,
          images: {
            select: { imagePath: true },
          },
        },
      });

      if (!existing) {
        return { formError: "Project tidak ditemukan." };
      }
    }
  } catch (error) {
    console.error("Failed to prepare project save.", error);

    return { formError: GENERIC_ERROR };
  }

  const newBlobUrls = new Set<string>();

  if (thumbnailPath) {
    newBlobUrls.add(thumbnailPath);
  }

  for (const image of images) {
    newBlobUrls.add(image.url);
  }

  let savedSlug = data.slug;
  const oldSlug = existing?.slug;
  const oldBlobUrls: Array<string | null> = existing
    ? [existing.thumbnailPath, ...existing.images.map((image) => image.imagePath)]
    : [];

  try {
    if (projectId && existing) {
      const updated = await prisma.project.update({
        where: { id: projectId },
        data: {
          title: data.title,
          slug: data.slug,
          summary: data.summary,
          description: data.description,
          thumbnailPath: thumbnailPath || null,
          status: data.status,
          githubUrl,
          previewUrl,
          creatorId: data.creatorId,
          categoryId: data.categoryId,
          publishedAt:
            data.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : null,
          members: {
            deleteMany: {},
            create: memberIds.map((userId) => ({ userId })),
          },
          images: {
            deleteMany: {},
            create: images.map((image) => ({
              imagePath: image.url,
              caption: image.caption || null,
              sortOrder: image.sortOrder,
            })),
          },
          projectTechnologies: {
            deleteMany: {},
            create: technologyIds.map((technologyId) => ({ technologyId })),
          },
        },
        select: { slug: true },
      });

      savedSlug = updated.slug;
    } else {
      const created = await prisma.project.create({
        data: {
          title: data.title,
          slug: data.slug,
          summary: data.summary,
          description: data.description,
          thumbnailPath: thumbnailPath || null,
          status: data.status,
          githubUrl,
          previewUrl,
          creatorId: data.creatorId,
          categoryId: data.categoryId,
          publishedAt: data.status === "PUBLISHED" ? new Date() : null,
          members: {
            create: memberIds.map((userId) => ({ userId })),
          },
          images: {
            create: images.map((image) => ({
              imagePath: image.url,
              caption: image.caption || null,
              sortOrder: image.sortOrder,
            })),
          },
          projectTechnologies: {
            create: technologyIds.map((technologyId) => ({ technologyId })),
          },
        },
        select: { slug: true },
      });

      savedSlug = created.slug;
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { fieldErrors: { slug: ["Slug sudah digunakan."] } };
      }

      if (error.code === "P2025") {
        return { formError: "Project tidak ditemukan." };
      }

      if (error.code === "P2003") {
        return {
          formError: "Kategori, creator, teknologi, atau anggota tim tidak valid.",
        };
      }
    }

    console.error("Failed to save project.", error);

    return { formError: GENERIC_ERROR };
  }

  await deleteBlobsBestEffort(
    oldBlobUrls.filter((url) => !url || !newBlobUrls.has(url)),
  );

  revalidateProjectPaths(savedSlug, oldSlug);
  redirect(withAdminNotice(returnTo, projectId ? "updated" : "created"));
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const returnTo = safeAdminReturnPath(getFormString(formData, "returnTo"));

  if (!(await getAdminSession())) {
    redirect("/dashboard?notice=forbidden");
  }

  try {
    await assertSameOrigin();
  } catch {
    redirect(withAdminNotice(returnTo, "invalid"));
  }

  const projectId = parseAdminId(getFormString(formData, "projectId"));

  if (!projectId) {
    redirect(withAdminNotice(returnTo, "not-found"));
  }

  let notice = "deleted";
  let deletedSlug: string | null = null;
  let blobUrls: Array<string | null> = [];

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        slug: true,
        thumbnailPath: true,
        images: {
          select: { imagePath: true },
        },
      },
    });

    if (!project) {
      notice = "not-found";
    } else {
      deletedSlug = project.slug;
      blobUrls = [
        project.thumbnailPath,
        ...project.images.map((image) => image.imagePath),
      ];

      await prisma.project.delete({ where: { id: projectId } });
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      notice = "not-found";
    } else {
      console.error("Failed to delete project.", error);
      notice = "error";
    }
  }

  if (notice === "deleted" && deletedSlug) {
    await deleteBlobsBestEffort(blobUrls);
    revalidateProjectPaths(deletedSlug);
  }

  redirect(withAdminNotice(returnTo, notice));
}
