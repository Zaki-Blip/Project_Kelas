export type AdminNoticeData = {
  kind: "success" | "error";
  message: string;
};

const notices: Record<string, AdminNoticeData> = {
  created: { kind: "success", message: "Project berhasil dibuat." },
  updated: { kind: "success", message: "Perubahan project berhasil disimpan." },
  deleted: { kind: "success", message: "Project berhasil dihapus." },
  "taxonomy-created": { kind: "success", message: "Data berhasil ditambahkan." },
  "taxonomy-updated": { kind: "success", message: "Perubahan berhasil disimpan." },
  "taxonomy-deleted": { kind: "success", message: "Data berhasil dihapus." },
  "taxonomy-in-use": {
    kind: "error",
    message: "Data masih digunakan oleh project dan tidak bisa dihapus.",
  },
  "taxonomy-conflict": {
    kind: "error",
    message: "Nama atau slug sudah digunakan.",
  },
  "taxonomy-invalid": {
    kind: "error",
    message: "Nama atau slug tidak valid.",
  },
  "taxonomy-not-found": { kind: "error", message: "Data tidak ditemukan." },
  "pkl-reviewed": { kind: "success", message: "Status laporan PKL berhasil diperbarui." },
  "pkl-deleted": { kind: "success", message: "Laporan PKL berhasil dihapus." },
  "pkl-invalid": { kind: "error", message: "Data laporan PKL tidak valid." },
  "pkl-not-found": { kind: "error", message: "Laporan PKL tidak ditemukan." },
  "profile-updated": {
    kind: "success",
    message: "Profil kelas berhasil disimpan.",
  },
  "student-created": {
    kind: "success",
    message: "Profil siswa berhasil ditambahkan.",
  },
  "student-updated": {
    kind: "success",
    message: "Perubahan profil siswa berhasil disimpan.",
  },
  "student-deleted": {
    kind: "success",
    message: "Profil siswa berhasil dihapus.",
  },
  "student-not-found": {
    kind: "error",
    message: "Profil siswa tidak ditemukan.",
  },
  "not-found": { kind: "error", message: "Project tidak ditemukan." },
  invalid: {
    kind: "error",
    message: "Permintaan tidak valid. Muat ulang halaman lalu coba lagi.",
  },
  forbidden: {
    kind: "error",
    message: "Kamu tidak memiliki akses ke tindakan ini.",
  },
  error: { kind: "error", message: "Terjadi kesalahan. Coba lagi nanti." },
};

export function getAdminNotice(
  value: string | string[] | undefined,
): AdminNoticeData | null {
  const key = Array.isArray(value) ? value[0] : value;

  return key ? (notices[key] ?? null) : null;
}
