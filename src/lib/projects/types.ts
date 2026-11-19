export type ProjectCardData = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  thumbnailPath: string | null;
  category: {
    name: string;
    slug: string;
  };
  creator: {
    fullName: string;
    username: string;
  };
  technologies: Array<{
    name: string;
    slug: string;
  }>;
  technologyCount: number;
};

export type ProjectDetailData = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  thumbnailPath: string | null;
  status: "DRAFT" | "PUBLISHED";
  githubUrl: string | null;
  previewUrl: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  category: {
    name: string;
    slug: string;
  };
  creator: {
    fullName: string;
    username: string;
  };
  members: Array<{
    fullName: string;
    username: string;
  }>;
  images: Array<{
    id: string;
    imagePath: string;
    caption: string | null;
  }>;
  technologies: Array<{
    name: string;
    slug: string;
  }>;
};

export type ProjectTaxonomy = {
  categories: Array<{
    name: string;
    slug: string;
  }>;
  technologies: Array<{
    name: string;
    slug: string;
  }>;
};

export type GalleryFilters = {
  q: string;
  category?: string;
  tech?: string;
  page: number;
};
