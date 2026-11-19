import "server-only";

import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type {
  ClassProfileData,
  StudentProfileCardData,
  StudentProfileData,
} from "@/lib/profiles/types";
import { getSocialLinksFromText } from "@/lib/social";

const classProfileSelect = {
  id: true,
  className: true,
  tagline: true,
  description: true,
  photoPath: true,
  updatedAt: true,
} satisfies Prisma.ClassProfileSelect;

const studentProfileSelect = {
  id: true,
  name: true,
  role: true,
  bio: true,
  photoPath: true,
  socialLinks: true,
  sortOrder: true,
  isVisible: true,
  updatedAt: true,
} satisfies Prisma.StudentProfileSelect;

const studentProfileCardSelect = {
  id: true,
  name: true,
  role: true,
  bio: true,
  photoPath: true,
  socialLinks: true,
} satisfies Prisma.StudentProfileSelect;

export const getClassProfile = cache(
  async (): Promise<ClassProfileData | null> => {
    return prisma.classProfile.findUnique({
      where: { id: 1 },
      select: classProfileSelect,
    });
  },
);

export const getVisibleStudentProfiles = cache(
  async (): Promise<StudentProfileCardData[]> => {
    const students = await prisma.studentProfile.findMany({
      where: { isVisible: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: studentProfileCardSelect,
    });

    return students.map((student) => ({
      ...student,
      socialLinks: getSocialLinksFromText(student.socialLinks),
    }));
  },
);

export const getAdminStudentProfiles = cache(
  async (): Promise<StudentProfileData[]> => {
    return prisma.studentProfile.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: studentProfileSelect,
    });
  },
);

export const getAdminStudentProfile = cache(
  async (id: string): Promise<StudentProfileData | null> => {
    return prisma.studentProfile.findUnique({
      where: { id },
      select: studentProfileSelect,
    });
  },
);
