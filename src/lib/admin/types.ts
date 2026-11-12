export type AdminProjectFilters = {
  q: string;
  page: number;
};

export type AdminProjectListItem = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  categoryName: string;
  creatorName: string;
  creatorUsername: string;
  updatedAt: Date;
};

export type AdminProjectImage = {
  id: string;
  url: string;
  caption: string;
};

export type AdminProjectEditData = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  categoryId: string;
  creatorId: string;
  githubUrl: string;
  previewUrl: string;
  status: "DRAFT" | "PUBLISHED";
  thumbnailPath: string;
  technologyIds: string[];
  memberIds: string[];
  images: AdminProjectImage[];
};

export type AdminTaxonomyOption = {
  id: string;
  name: string;
  slug: string;
};

export type AdminTaxonomyOptions = {
  categories: AdminTaxonomyOption[];
  technologies: AdminTaxonomyOption[];
};

export type AdminUserOption = {
  id: string;
  fullName: string;
  username: string;
};

export type AdminCategoryRow = {
  id: string;
  name: string;
  slug: string;
  projectCount: number;
};

export type AdminTechnologyRow = {
  id: string;
  name: string;
  slug: string;
  projectCount: number;
};
