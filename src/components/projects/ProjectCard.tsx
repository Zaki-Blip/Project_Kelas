import Image from "next/image";
import Link from "next/link";

import type { ProjectCardData } from "@/lib/projects/types";
import styles from "./ProjectCard.module.css";

type ProjectCardProps = {
  project: ProjectCardData;
  href: string;
  actionLabel: string;
  priority?: boolean;
};

export function ProjectCard({ project, href, actionLabel, priority = false }: ProjectCardProps) {
  const visibleTechnologies = project.technologies.slice(0, 2);
  const extraTechnologyCount = Math.max(
    0,
    project.technologyCount - visibleTechnologies.length,
  );

  return (
    <article className={styles.card}>
      <Link href={href} className={styles.link}>
        <div className={styles.thumbnail}>
          {project.thumbnailPath ? (
            <Image
              src={project.thumbnailPath}
              alt=""
              width={640}
              height={400}
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              loading={priority ? "eager" : undefined}
              fetchPriority={priority ? "high" : undefined}
              className={styles.image}
            />
          ) : (
            <span className={styles.placeholder}>Gambar belum tersedia</span>
          )}
        </div>

        <div className={styles.body}>
          <span className={styles.category}>{project.category.name}</span>
          <h3 className={styles.title}>{project.title}</h3>
          <p className={styles.summary}>{project.summary}</p>

          <div className={styles.meta}>
            <span className={styles.creator}>{project.creator.fullName}</span>
            <span className={styles.technologies}>
              {visibleTechnologies.map((technology) => (
                <span key={technology.slug} className={styles.technology}>
                  {technology.name}
                </span>
              ))}
              {extraTechnologyCount > 0 ? (
                <span className={styles.technology}>+{extraTechnologyCount}</span>
              ) : null}
            </span>
          </div>

          <span className={styles.action}>
            {actionLabel}
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
