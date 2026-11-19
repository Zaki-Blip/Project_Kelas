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
  updatedAt: true,
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
    updatedAt: row.updatedAt,
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

export const getLandingProjects = cache(
  async (): Promise<ProjectCardData[]> => {
    const rows = await prisma.project.findMany({
      where: {
        status: ProjectStatus.PUBLISHED,
      },
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take: LANDING_PROJECT_LIMIT,
      select: projectCardSelect,
    });

    return rows.map(toProjectCard);
  },
);

// Primitive arguments keep the React cache key stable across equivalent filter objects.
const getGalleryProjectsCached = cache(
  async (
    q: string,
    category: string | undefined,
    tech: string | undefined,
    page: number,
  ): Promise<{ items: ProjectCardData[]; total: number }> => {
    const where: Prisma.ProjectWhereInput = {
      status: ProjectStatus.PUBLISHED,
    };

    if (category) {
      where.category = { slug: category };
    }

    if (tech) {
      where.projectTechnologies = {
        some: {
          technology: {
            slug: tech,
          },
        },
      };
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { creator: { fullName: { contains: q } } },
        { creator: { username: { contains: q } } },
      ];
    }

    const [total, rows] = await prisma.$transaction([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * GALLERY_PAGE_SIZE,
        take: GALLERY_PAGE_SIZE,
        select: projectCardSelect,
      }),
    ]);

    return {
      items: rows.map(toProjectCard),
      total,
    };
  },
);

export function getGalleryProjects(
  filters: GalleryFilters,
): Promise<{ items: ProjectCardData[]; total: number }> {
  return getGalleryProjectsCached(
    filters.q,
    filters.category,
    filters.tech,
    filters.page,
  );
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
