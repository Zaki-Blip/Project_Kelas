import type { Metadata } from "next";

import { TaxonomyManager } from "@/components/admin/TaxonomyManager";
import { getAdminCategories } from "@/lib/admin/queries";
import { getAdminNotice } from "@/lib/admin/notices";
import { requireAdmin } from "@/lib/auth/guards";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/server/actions/admin-taxonomies";

export const metadata: Metadata = {
  title: "Kategori",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin("/admin/categories");

  const params = await searchParams;
  const notice = getAdminNotice(firstParam(params.notice));
  const categories = await getAdminCategories();

  return (
    <TaxonomyManager
      title="Kategori"
      description="Atur kategori yang dipakai untuk mengelompokkan karya. Kategori yang masih dipakai project tidak bisa dihapus."
      nameLabel="Kategori"
      addAction={createCategoryAction}
      updateAction={updateCategoryAction}
      deleteAction={deleteCategoryAction}
      deleteFieldName="categoryId"
      returnTo="/admin/categories"
      rows={categories}
      notice={notice}
      inputPrefix="category"
      emptyText="Belum ada kategori."
    />
  );
}
