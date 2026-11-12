import "server-only";

import { cache } from "react";

import { ProjectStatus, type Prisma, type Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { GALLERY_PAGE_SIZE, LANDING_PROJECT_LIMIT } from "@/lib/projects/constants";
import type { GalleryFilters, ProjectCardData, ProjectDetailData } from "@/lib/projects/types";

const projectCardSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  thumbnailPath: true,
  category: {
    select: {
      name: true,
      slug: true,
    },
  },
  creator: {
    select: {
      fullName: true,
      username: true,
    },
  },
  projectTechnologies: {
    take: 2,
    orderBy: {
      technology: {
        name: "asc",
      },
    },
    select: {
      technology: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  },
  _count: {
    select: {
      projectTechnologies: true,
    },
  },
} satisfies Prisma.ProjectSelect;

type ProjectCardRow = Prisma.ProjectGetPayload<{ select: typeof projectCardSelect }>;

function toProjectCard(row: ProjectCardRow): ProjectCardData {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    thumbnailPath: row.thumbnailPath,
    category: row.category,
    creator: row.creator,
    technologies: row.projectTechnologies.map((item) => item.technology),
    technologyCount: row._count.projectTechnologies,
  };
}

const projectDetailSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  description: true,
  thumbnailPath: true,
  status: true,
  githubUrl: true,
  previewUrl: true,
  publishedAt: true,
  category: {
    select: {
      name: true,
      slug: true,
    },
  },
  creator: {
    select: {
      fullName: true,
      username: true,
    },
  },
  members: {
    orderBy: {
      createdAt: "asc",
    },
    select: {
      user: {
        select: {
          fullName: true,
          username: true,
        },
      },
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
    orderBy: {
      technology: {
        name: "asc",
      },
    },
    select: {
      technology: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  },
} satisfies Prisma.ProjectSelect;

type ProjectDetailRow = Prisma.ProjectGetPayload<{ select: typeof projectDetailSelect }>;

function toProjectDetail(row: ProjectDetailRow): ProjectDetailData {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    thumbnailPath: row.thumbnailPath,
    status: row.status,
    githubUrl: row.githubUrl,
    previewUrl: row.previewUrl,
    publishedAt: row.publishedAt,
    category: row.category,
    creator: row.creator,
    members: row.members.map((member) => member.user),
    images: row.images,
    technologies: row.projectTechnologies.map((item) => item.technology),
  };
}

export const getProjectDetail = cache(
  async (slug: string, viewerRole: Role): Promise<ProjectDetailData | null> => {
    const row = await prisma.project.findFirst({
      where: {
        slug,
        ...(viewerRole === "ADMIN" ? {} : { status: ProjectStatus.PUBLISHED }),
      },
      select: projectDetailSelect,
    });

    return row ? toProjectDetail(row) : null;
  },
);

export async function getLandingProjects(): Promise<ProjectCardData[]> {
  const rows = await prisma.project.findMany({
    where: {
      status: ProjectStatus.PUBLISHED,
    },
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take: LANDING_PROJECT_LIMIT,
    select: projectCardSelect,
  });

  return rows.map(toProjectCard);
}

export async function getGalleryProjects(
  filters: GalleryFilters,
): Promise<{ items: ProjectCardData[]; total: number }> {
  const where: Prisma.ProjectWhereInput = {
    status: ProjectStatus.PUBLISHED,
  };

  if (filters.category) {
    where.category = { slug: filters.category };
  }

  if (filters.tech) {
    where.projectTechnologies = {
      some: {
        technology: {
          slug: filters.tech,
        },
      },
    };
  }

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q } },
      { creator: { fullName: { contains: filters.q } } },
      { creator: { username: { contains: filters.q } } },
    ];
  }

  const [total, rows] = await prisma.$transaction([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      skip: (filters.page - 1) * GALLERY_PAGE_SIZE,
      take: GALLERY_PAGE_SIZE,
      select: projectCardSelect,
    }),
  ]);

  return {
    items: rows.map(toProjectCard),
    total,
  };
}

export const getProjectTaxonomies = cache(async () => {
  const [categories, technologies] = await prisma.$transaction([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.technology.findMany({
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
  ]);

  return { categories, technologies };
});
