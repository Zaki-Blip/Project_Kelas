"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma } from "@/generated/prisma/client";
import { safeAdminReturnPath, withAdminNotice } from "@/lib/admin/paths";
import { getAdminSession } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { assertSameOrigin } from "@/lib/security/origin";
import {
  parseAdminId,
  taxonomyFormSchema,
  taxonomySlugValueSchema,
} from "@/lib/validation/admin";

function getFormString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

type ParsedTaxonomy = {
  id: string | null;
  name: string;
  slug: string;
};

function parseTaxonomyForm(formData: FormData): ParsedTaxonomy | null {
  const parsed = taxonomyFormSchema.safeParse({
    id: getFormString(formData, "id"),
    name: getFormString(formData, "name"),
    slug: getFormString(formData, "slug"),
  });

  if (!parsed.success) {
    return null;
  }

  const slug = parsed.data.slug || slugify(parsed.data.name, 80);
  const parsedSlug = taxonomySlugValueSchema.safeParse(slug);

  if (!parsedSlug.success) {
    return null;
  }

  return {
    id: parsed.data.id || null,
    name: parsed.data.name,
    slug: parsedSlug.data,
  };
}

function revalidateTaxonomyPaths(): void {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/technologies");
  revalidatePath("/projects/[slug]", "page");
}

function noticeForError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "taxonomy-conflict";
    }

    if (error.code === "P2025") {
      return "taxonomy-not-found";
    }

    if (error.code === "P2003") {
      return "taxonomy-in-use";
    }
  }

  console.error("Failed to mutate taxonomy.", error);

  return "error";
}

export async function createCategoryAction(formData: FormData): Promise<void> {
  const returnTo = safeAdminReturnPath(
    getFormString(formData, "returnTo"),
    "/admin/categories",
  );

  if (!(await getAdminSession())) {
    redirect("/dashboard?notice=forbidden");
  }

  try {
    await assertSameOrigin();
  } catch {
    redirect(withAdminNotice(returnTo, "invalid"));
  }

  const data = parseTaxonomyForm(formData);

  if (!data) {
    redirect(withAdminNotice(returnTo, "taxonomy-invalid"));
  }

  let notice = "taxonomy-created";

  try {
    const conflict = await prisma.category.findFirst({
      where: {
        OR: [{ name: data.name }, { slug: data.slug }],
      },
      select: { id: true },
    });

    if (conflict) {
      notice = "taxonomy-conflict";
    } else {
      await prisma.category.create({
        data: { name: data.name, slug: data.slug },
      });
    }
  } catch (error) {
    notice = noticeForError(error);
  }

  if (notice === "taxonomy-created") {
    revalidateTaxonomyPaths();
  }

  redirect(withAdminNotice(returnTo, notice));
}

export async function updateCategoryAction(formData: FormData): Promise<void> {
  const returnTo = safeAdminReturnPath(
    getFormString(formData, "returnTo"),
    "/admin/categories",
  );

  if (!(await getAdminSession())) {
    redirect("/dashboard?notice=forbidden");
  }

  try {
    await assertSameOrigin();
  } catch {
    redirect(withAdminNotice(returnTo, "invalid"));
  }

  const data = parseTaxonomyForm(formData);

  if (!data) {
    redirect(withAdminNotice(returnTo, "taxonomy-invalid"));
  }

  if (!data.id) {
    redirect(withAdminNotice(returnTo, "taxonomy-not-found"));
  }

  let notice = "taxonomy-updated";

  try {
    const conflict = await prisma.category.findFirst({
      where: {
        OR: [{ name: data.name }, { slug: data.slug }],
        NOT: { id: data.id },
      },
      select: { id: true },
    });

    if (conflict) {
      notice = "taxonomy-conflict";
    } else {
      await prisma.category.update({
        where: { id: data.id },
        data: { name: data.name, slug: data.slug },
      });
    }
  } catch (error) {
    notice = noticeForError(error);
  }

  if (notice === "taxonomy-updated") {
    revalidateTaxonomyPaths();
  }

  redirect(withAdminNotice(returnTo, notice));
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const returnTo = safeAdminReturnPath(
    getFormString(formData, "returnTo"),
    "/admin/categories",
  );

  if (!(await getAdminSession())) {
    redirect("/dashboard?notice=forbidden");
  }

  try {
    await assertSameOrigin();
  } catch {
    redirect(withAdminNotice(returnTo, "invalid"));
  }

  const categoryId = parseAdminId(getFormString(formData, "categoryId"));

  if (!categoryId) {
    redirect(withAdminNotice(returnTo, "taxonomy-not-found"));
  }

  let notice = "taxonomy-deleted";

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        _count: {
          select: { projects: true },
        },
      },
    });

    if (!category) {
      notice = "taxonomy-not-found";
    } else if (category._count.projects > 0) {
      notice = "taxonomy-in-use";
    } else {
      await prisma.category.delete({ where: { id: categoryId } });
    }
  } catch (error) {
    notice = noticeForError(error);
  }

  if (notice === "taxonomy-deleted") {
    revalidateTaxonomyPaths();
  }

  redirect(withAdminNotice(returnTo, notice));
}

export async function createTechnologyAction(formData: FormData): Promise<void> {
  const returnTo = safeAdminReturnPath(
    getFormString(formData, "returnTo"),
    "/admin/technologies",
  );

  if (!(await getAdminSession())) {
    redirect("/dashboard?notice=forbidden");
  }

  try {
    await assertSameOrigin();
  } catch {
    redirect(withAdminNotice(returnTo, "invalid"));
  }

  const data = parseTaxonomyForm(formData);

  if (!data) {
    redirect(withAdminNotice(returnTo, "taxonomy-invalid"));
  }

  let notice = "taxonomy-created";

  try {
    const conflict = await prisma.technology.findFirst({
      where: {
        OR: [{ name: data.name }, { slug: data.slug }],
      },
      select: { id: true },
    });

    if (conflict) {
      notice = "taxonomy-conflict";
    } else {
      await prisma.technology.create({
        data: { name: data.name, slug: data.slug },
      });
    }
  } catch (error) {
    notice = noticeForError(error);
  }

  if (notice === "taxonomy-created") {
    revalidateTaxonomyPaths();
  }

  redirect(withAdminNotice(returnTo, notice));
}

export async function updateTechnologyAction(formData: FormData): Promise<void> {
  const returnTo = safeAdminReturnPath(
    getFormString(formData, "returnTo"),
    "/admin/technologies",
  );

  if (!(await getAdminSession())) {
    redirect("/dashboard?notice=forbidden");
  }

  try {
    await assertSameOrigin();
  } catch {
    redirect(withAdminNotice(returnTo, "invalid"));
  }

  const data = parseTaxonomyForm(formData);

  if (!data) {
    redirect(withAdminNotice(returnTo, "taxonomy-invalid"));
  }

  if (!data.id) {
    redirect(withAdminNotice(returnTo, "taxonomy-not-found"));
  }

  let notice = "taxonomy-updated";

  try {
    const conflict = await prisma.technology.findFirst({
      where: {
        OR: [{ name: data.name }, { slug: data.slug }],
        NOT: { id: data.id },
      },
      select: { id: true },
    });

    if (conflict) {
      notice = "taxonomy-conflict";
    } else {
      await prisma.technology.update({
        where: { id: data.id },
        data: { name: data.name, slug: data.slug },
      });
    }
  } catch (error) {
    notice = noticeForError(error);
  }

  if (notice === "taxonomy-updated") {
    revalidateTaxonomyPaths();
  }

  redirect(withAdminNotice(returnTo, notice));
}

export async function deleteTechnologyAction(formData: FormData): Promise<void> {
  const returnTo = safeAdminReturnPath(
    getFormString(formData, "returnTo"),
    "/admin/technologies",
  );

  if (!(await getAdminSession())) {
    redirect("/dashboard?notice=forbidden");
  }

  try {
    await assertSameOrigin();
  } catch {
    redirect(withAdminNotice(returnTo, "invalid"));
  }

  const technologyId = parseAdminId(getFormString(formData, "technologyId"));

  if (!technologyId) {
    redirect(withAdminNotice(returnTo, "taxonomy-not-found"));
  }

  let notice = "taxonomy-deleted";

  try {
    const technology = await prisma.technology.findUnique({
      where: { id: technologyId },
      select: {
        _count: {
          select: { projectTechnologies: true },
        },
      },
    });

    if (!technology) {
      notice = "taxonomy-not-found";
    } else if (technology._count.projectTechnologies > 0) {
      notice = "taxonomy-in-use";
    } else {
      await prisma.technology.delete({ where: { id: technologyId } });
    }
  } catch (error) {
    notice = noticeForError(error);
  }

  if (notice === "taxonomy-deleted") {
    revalidateTaxonomyPaths();
  }

  redirect(withAdminNotice(returnTo, notice));
}
