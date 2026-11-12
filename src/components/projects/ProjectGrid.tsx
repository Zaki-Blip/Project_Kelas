import type { ProjectCardData } from "@/lib/projects/types";
import { getLoginNextHref, getProjectHref } from "@/lib/projects/urls";
import { ProjectCard } from "./ProjectCard";
import styles from "./ProjectGrid.module.css";

type ProjectGridProps = {
  projects: ProjectCardData[];
  isAuthenticated: boolean;
  priorityFirst?: boolean;
};

export function ProjectGrid({
  projects,
  isAuthenticated,
  priorityFirst = false,
}: ProjectGridProps) {
  return (
    <div className={styles.grid}>
      {projects.map((project, index) => {
        const projectHref = getProjectHref(project.slug);
        const href = isAuthenticated ? projectHref : getLoginNextHref(projectHref);

        return (
          <ProjectCard
            key={project.id}
            project={project}
            href={href}
            actionLabel={isAuthenticated ? "Lihat Detail" : "Masuk untuk melihat"}
            priority={priorityFirst && index === 0}
          />
        );
      })}
    </div>
  );
}
