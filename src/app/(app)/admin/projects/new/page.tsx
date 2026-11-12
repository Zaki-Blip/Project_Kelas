import type { Metadata } from "next";

import { ProjectForm } from "@/components/admin/ProjectForm";
import { safeAdminReturnPath } from "@/lib/admin/paths";
import { getAdminTaxonomies, getAdminUsers } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/guards";
import { cn } from "@/lib/cn";
import styles from "../../admin.module.css";

export const metadata: Metadata = {
  title: "Tambah Project",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin("/admin/projects/new");

  const params = await searchParams;
  const returnTo = safeAdminReturnPath(firstParam(params.returnTo));
  const [taxonomies, users] = await Promise.all([
    getAdminTaxonomies(),
    getAdminUsers(),
  ]);

  return (
    <section className={cn("container", styles.page)}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>Pengelola</p>
          <h1 className={styles.title}>Tambah Project</h1>
          <p className={styles.text}>
            Lengkapi informasi project, unggah media, lalu simpan sebagai draf atau
            terbitkan ke galeri.
          </p>
        </div>
      </div>

      <ProjectForm
        mode="create"
        taxonomies={taxonomies}
        users={users}
        returnTo={returnTo}
      />
    </section>
  );
}
