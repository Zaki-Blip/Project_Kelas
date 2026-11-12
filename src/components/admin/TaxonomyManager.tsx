import { AdminNotice } from "@/components/admin/AdminNotice";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { AdminNoticeData } from "@/lib/admin/notices";
import { cn } from "@/lib/cn";
import styles from "./TaxonomyManager.module.css";

export type TaxonomyRow = {
  id: string;
  name: string;
  slug: string;
  projectCount: number;
};

type TaxonomyManagerProps = {
  title: string;
  description: string;
  nameLabel: string;
  addAction: (formData: FormData) => void | Promise<void>;
  updateAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
  deleteFieldName: "categoryId" | "technologyId";
  returnTo: string;
  rows: TaxonomyRow[];
  notice: AdminNoticeData | null;
  inputPrefix: string;
  emptyText: string;
};

export function TaxonomyManager({
  title,
  description,
  nameLabel,
  addAction,
  updateAction,
  deleteAction,
  deleteFieldName,
  returnTo,
  rows,
  notice,
  inputPrefix,
  emptyText,
}: TaxonomyManagerProps) {
  return (
    <section className={cn("container", styles.page)}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>Pengelola</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.text}>{description}</p>
        </div>
        <span className={styles.countBadge}>{rows.length} data</span>
      </div>

      <AdminNotice notice={notice} />

      <form action={addAction} className={styles.addForm}>
        <input type="hidden" name="returnTo" value={returnTo} />
        <div className={styles.addFields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${inputPrefix}-name`}>
              Nama {nameLabel.toLowerCase()}
            </label>
            <input
              id={`${inputPrefix}-name`}
              name="name"
              type="text"
              className={styles.control}
              required
              minLength={2}
              maxLength={60}
              placeholder={`Nama ${nameLabel.toLowerCase()}`}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${inputPrefix}-slug`}>
              Slug
            </label>
            <input
              id={`${inputPrefix}-slug`}
              name="slug"
              type="text"
              className={styles.control}
              maxLength={80}
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="otomatis-dari-nama"
            />
            <p className={styles.hint}>
              Kosongkan untuk membuat otomatis dari nama.
            </p>
          </div>
        </div>

        <SubmitButton pendingLabel="Menambahkan…">Tambah {nameLabel}</SubmitButton>
      </form>

      {rows.length === 0 ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>{emptyText}</h2>
          <p className={styles.emptyText}>
            Gunakan form di atas untuk menambahkan data pertama.
          </p>
        </div>
      ) : (
        <>
          <p className={styles.mobileHint}>
            Geser tabel ke samping untuk melihat semua kolom.
          </p>
          <div
            className={styles.tableWrap}
            role="region"
            aria-label={`Tabel ${title.toLowerCase()}`}
            tabIndex={0}
          >
            <table className={styles.table}>
              <caption className="visuallyHidden">Daftar {title.toLowerCase()}</caption>
              <thead>
                <tr>
                  <th scope="col">Nama</th>
                  <th scope="col">Dipakai</th>
                  <th scope="col">Edit</th>
                  <th scope="col">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className={styles.name}>{row.name}</span>
                      <span className={styles.slug}>{row.slug}</span>
                    </td>
                    <td>
                      <span className={styles.usage}>{row.projectCount} project</span>
                    </td>
                    <td>
                      <details className={styles.editDetails}>
                        <summary className={styles.editSummary}>Edit</summary>
                        <form action={updateAction} className={styles.editForm}>
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="returnTo" value={returnTo} />

                          <div className={styles.field}>
                            <label
                              className={styles.label}
                              htmlFor={`${inputPrefix}-edit-name-${row.id}`}
                            >
                              Nama
                            </label>
                            <input
                              id={`${inputPrefix}-edit-name-${row.id}`}
                              name="name"
                              type="text"
                              className={styles.control}
                              defaultValue={row.name}
                              required
                              minLength={2}
                              maxLength={60}
                            />
                          </div>

                          <div className={styles.field}>
                            <label
                              className={styles.label}
                              htmlFor={`${inputPrefix}-edit-slug-${row.id}`}
                            >
                              Slug
                            </label>
                            <input
                              id={`${inputPrefix}-edit-slug-${row.id}`}
                              name="slug"
                              type="text"
                              className={styles.control}
                              defaultValue={row.slug}
                              required
                              maxLength={80}
                              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                              autoCapitalize="none"
                              spellCheck={false}
                            />
                          </div>

                          <SubmitButton pendingLabel="Menyimpan…">Simpan</SubmitButton>
                        </form>
                      </details>
                    </td>
                    <td>
                      <ConfirmDeleteButton
                        action={deleteAction}
                        fields={{ [deleteFieldName]: row.id, returnTo }}
                        title={`Hapus ${row.name}?`}
                        description={
                          row.projectCount > 0
                            ? `${nameLabel} ini masih dipakai oleh ${row.projectCount} project dan tidak bisa dihapus.`
                            : `${nameLabel} ini akan dihapus permanen.`
                        }
                        confirmLabel={`Hapus ${nameLabel}`}
                        disabled={row.projectCount > 0}
                        disabledReason={
                          row.projectCount > 0
                            ? `Masih dipakai oleh ${row.projectCount} project.`
                            : undefined
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
