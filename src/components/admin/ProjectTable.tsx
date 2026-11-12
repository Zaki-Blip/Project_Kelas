import Link from "next/link";

import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import type { AdminProjectListItem } from "@/lib/admin/types";
import { cn } from "@/lib/cn";
import { deleteProjectAction } from "@/server/actions/admin-projects";
import styles from "./ProjectTable.module.css";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

type ProjectTableProps = {
  projects: AdminProjectListItem[];
  returnTo: string;
};

export function ProjectTable({ projects, returnTo }: ProjectTableProps) {
  return (
    <div
      className={styles.wrap}
      role="region"
      aria-label="Tabel project, geser ke samping untuk melihat semua kolom"
      tabIndex={0}
    >
      <table className={styles.table}>
        <caption className="visuallyHidden">Daftar project</caption>
        <thead>
          <tr>
            <th scope="col">Project</th>
            <th scope="col">Status</th>
            <th scope="col">Kategori</th>
            <th scope="col">Creator</th>
            <th scope="col">Diperbarui</th>
            <th scope="col">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const editHref =
              returnTo === "/admin"
                ? `/admin/projects/${project.id}/edit`
                : `/admin/projects/${project.id}/edit?returnTo=${encodeURIComponent(returnTo)}`;

            return (
              <tr key={project.id}>
                <td>
                  <Link href={editHref} className={styles.titleLink}>
                    {project.title}
                  </Link>
                  <span className={styles.slug}>{project.slug}</span>
                </td>
                <td>
                  <span
                    className={cn(
                      styles.badge,
                      project.status === "PUBLISHED" ? styles.published : styles.draft,
                    )}
                  >
                    {project.status === "PUBLISHED" ? "Terbit" : "Draf"}
                  </span>
                </td>
                <td>{project.categoryName}</td>
                <td>
                  <span className={styles.creatorName}>{project.creatorName}</span>
                  <span className={styles.username}>@{project.creatorUsername}</span>
                </td>
                <td>
                  <time dateTime={project.updatedAt.toISOString()}>
                    {dateFormatter.format(project.updatedAt)}
                  </time>
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link href={editHref} className={styles.actionLink}>
                      Edit
                    </Link>
                    <ConfirmDeleteButton
                      action={deleteProjectAction}
                      fields={{ projectId: project.id, returnTo }}
                      title={`Hapus ${project.title}?`}
                      description="Project, anggota, screenshot, dan tautannya akan dihapus. Tindakan ini tidak bisa dibatalkan."
                      confirmLabel="Hapus Project"
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
