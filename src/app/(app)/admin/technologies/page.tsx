import type { Metadata } from "next";

import { TaxonomyManager } from "@/components/admin/TaxonomyManager";
import { getAdminTechnologies } from "@/lib/admin/queries";
import { getAdminNotice } from "@/lib/admin/notices";
import { requireAdmin } from "@/lib/auth/guards";
import {
  createTechnologyAction,
  deleteTechnologyAction,
  updateTechnologyAction,
} from "@/server/actions/admin-taxonomies";

export const metadata: Metadata = {
  title: "Teknologi",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminTechnologiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin("/admin/technologies");

  const params = await searchParams;
  const notice = getAdminNotice(firstParam(params.notice));
  const technologies = await getAdminTechnologies();

  return (
    <TaxonomyManager
      title="Teknologi"
      description="Kelola daftar teknologi yang ditautkan ke setiap project. Teknologi yang masih dipakai project tidak bisa dihapus."
      nameLabel="Teknologi"
      addAction={createTechnologyAction}
      updateAction={updateTechnologyAction}
      deleteAction={deleteTechnologyAction}
      deleteFieldName="technologyId"
      returnTo="/admin/technologies"
      rows={technologies}
      notice={notice}
      inputPrefix="technology"
      emptyText="Belum ada teknologi."
    />
  );
}
