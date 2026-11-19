import type { SocialLinkItem } from "@/lib/social";

export type ClassProfileData = {
  id: number;
  className: string;
  tagline: string | null;
  description: string | null;
  photoPath: string | null;
  updatedAt: Date;
};

export type StudentProfileData = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  photoPath: string;
  socialLinks: string | null;
  sortOrder: number;
  isVisible: boolean;
  updatedAt: Date;
};

export type StudentProfileCardData = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  photoPath: string;
  socialLinks: SocialLinkItem[];
};
