import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/admin/ProjectForm";
import { safeAdminReturnPath } from "@/lib/admin/paths";
import {
  getAdminProjectForEdit,
  getAdminTaxonomies,
  getAdminUsers,
} from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/guards";
import { cn } from "@/lib/cn";
import { parseAdminId } from "@/lib/validation/admin";
import styles from "../../../admin.module.css";

export const metadata: Metadata = {
  title: "Edit Project",
};

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  await requireAdmin("/admin");

  const { id } = await params;
  const projectId = parseAdminId(id);

  if (!projectId) {
    notFound();
  }

  const query = await searchParams;
  const returnTo = safeAdminReturnPath(firstParam(query.returnTo));
  const [project, taxonomies, users] = await Promise.all([
    getAdminProjectForEdit(projectId),
    getAdminTaxonomies(),
    getAdminUsers(),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <section className={cn("container", styles.page)}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>Pengelola</p>
          <h1 className={styles.title}>Edit Project</h1>
          <p className={styles.text}>
            Perbarui informasi, media, tim, dan tautan project. Perubahan langsung
            tersimpan setelah form dikirim.
          </p>
        </div>
      </div>

      <ProjectForm
        mode="edit"
        project={project}
        taxonomies={taxonomies}
        users={users}
        returnTo={returnTo}
      />
    </section>
  );
}
