import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { ADMIN_PAGE_SIZE } from "@/lib/admin/constants";
import type {
  AdminCategoryRow,
  AdminProjectEditData,
  AdminProjectFilters,
  AdminProjectListItem,
  AdminTaxonomyOptions,
  AdminTechnologyRow,
  AdminUserOption,
} from "@/lib/admin/types";

function buildProjectSearchWhere(q: string): Prisma.ProjectWhereInput {
  if (!q) {
    return {};
  }

  return {
    OR: [
      { title: { contains: q } },
      { slug: { contains: q } },
      { creator: { fullName: { contains: q } } },
      { creator: { username: { contains: q } } },
    ],
  };
}

export async function getAdminProjects(filters: AdminProjectFilters): Promise<{
  items: AdminProjectListItem[];
  total: number;
}> {
  const where = buildProjectSearchWhere(filters.q);
  const skip = (filters.page - 1) * ADMIN_PAGE_SIZE;

  const [total, projects] = await prisma.$transaction([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      skip,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        category: {
          select: {
            name: true,
          },
        },
        creator: {
          select: {
            fullName: true,
            username: true,
          },
        },
      },
    }),
  ]);

  return {
    total,
    items: projects.map((project) => ({
      id: project.id,
      title: project.title,
      slug: project.slug,
      status: project.status,
      categoryName: project.category.name,
      creatorName: project.creator.fullName,
      creatorUsername: project.creator.username,
      updatedAt: project.updatedAt,
    })),
  };
}

export async function getAdminProjectForEdit(
  id: string,
): Promise<AdminProjectEditData | null> {
  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      description: true,
      categoryId: true,
      creatorId: true,
      githubUrl: true,
      previewUrl: true,
      status: true,
      thumbnailPath: true,
      members: {
        select: {
          userId: true,
        },
      },
      images: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: {
          id: true,
          imagePath: true,
          caption: true,
        },
      },
      projectTechnologies: {
        select: {
          technologyId: true,
        },
      },
    },
  });

  if (!project) {
    return null;
  }

  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    description: project.description,
    categoryId: project.categoryId,
    creatorId: project.creatorId,
    githubUrl: project.githubUrl ?? "",
    previewUrl: project.previewUrl ?? "",
    status: project.status,
    thumbnailPath: project.thumbnailPath ?? "",
    technologyIds: project.projectTechnologies.map((item) => item.technologyId),
    memberIds: project.members.map((member) => member.userId),
    images: project.images.map((image) => ({
      id: image.id,
      url: image.imagePath,
      caption: image.caption ?? "",
    })),
  };
}

export async function getAdminTaxonomies(): Promise<AdminTaxonomyOptions> {
  const [categories, technologies] = await prisma.$transaction([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.technology.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return { categories, technologies };
}

export async function getAdminUsers(): Promise<AdminUserOption[]> {
  return prisma.user.findMany({
    orderBy: [{ fullName: "asc" }, { username: "asc" }],
    select: {
      id: true,
      fullName: true,
      username: true,
    },
  });
}

export async function getAdminCategories(): Promise<AdminCategoryRow[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    projectCount: category._count.projects,
  }));
}

export async function getAdminTechnologies(): Promise<AdminTechnologyRow[]> {
  const technologies = await prisma.technology.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: {
          projectTechnologies: true,
        },
      },
    },
  });

  return technologies.map((technology) => ({
    id: technology.id,
    name: technology.name,
    slug: technology.slug,
    projectCount: technology._count.projectTechnologies,
  }));
}
