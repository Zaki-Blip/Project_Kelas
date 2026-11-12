import { Button } from "@/components/ui/Button";
import type { GalleryFilters as GalleryFiltersData, ProjectTaxonomy } from "@/lib/projects/types";
import styles from "./GalleryFilters.module.css";

type GalleryFiltersProps = {
  filters: GalleryFiltersData;
  taxonomies: ProjectTaxonomy;
};

export function GalleryFilters({ filters, taxonomies }: GalleryFiltersProps) {
  return (
    <form
      className={styles.form}
      method="get"
      action="/dashboard"
      role="search"
      aria-label="Filter galeri"
    >
      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="gallery-q">
            Cari karya
          </label>
          <input
            id="gallery-q"
            name="q"
            type="search"
            defaultValue={filters.q}
            maxLength={100}
            placeholder="Cari judul atau nama pembuat…"
            className={styles.control}
            aria-describedby="gallery-q-hint"
          />
          <p id="gallery-q-hint" className={styles.hint}>
            Gunakan judul karya atau nama pembuat.
          </p>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="gallery-category">
            Kategori
          </label>
          <select
            id="gallery-category"
            name="category"
            defaultValue={filters.category ?? ""}
            className={styles.control}
          >
            <option value="">Semua kategori</option>
            {taxonomies.categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="gallery-tech">
            Teknologi
          </label>
          <select
            id="gallery-tech"
            name="tech"
            defaultValue={filters.tech ?? ""}
            className={styles.control}
          >
            <option value="">Semua teknologi</option>
            {taxonomies.technologies.map((technology) => (
              <option key={technology.slug} value={technology.slug}>
                {technology.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="submit">Terapkan</Button>
        <Button href="/dashboard" variant="outline">
          Reset
        </Button>
      </div>
    </form>
  );
}
