# Laporan Peningkatan KaryaKelas — Audit November 2026

Laporan ini merangkum perubahan yang sudah diterapkan, dampak yang diharapkan, dan bukti verifikasi. Semua perubahan masih belum di-commit.

## Ringkasan eksekutif

Audit menemukan bahwa fondasi aplikasi sudah kuat, tetapi masih ada kebocoran JavaScript klien, metadata sosial yang tidak konsisten, structured data yang belum lengkap/aman, PWA yang belum installable secara optimal, serta beberapa detail aksesibilitas dan cache. Setelah perbaikan:

- Semua halaman yang diaudit memperoleh **Lighthouse Accessibility 100, Best Practices 100, SEO 100** tanpa failure.
- Semua **183 unit test** lulus; typecheck, lint, dan production build lulus.
- Halaman publik dan detail proyek memiliki canonical, OpenGraph/Twitter image, dan JSON-LD yang aman.
- PWA production memiliki manifest, ikon any/maskable, service worker, dan offline fallback.
- Dialog profil siswa mengelola fokus dengan benar dan dapat ditutup lewat tombol, Escape, atau backdrop.
- CSP production memakai nonce tanpa `unsafe-eval`; tidak ada error CSP di console.

## Perbandingan sebelum dan sesudah

| Aspek | Sebelum audit | Setelah audit |
| --- | --- | --- |
| Navigasi admin | Client component untuk menghitung status aktif. | Server component; path aktif dari `x-pathname`; `aria-current` tetap tersedia. |
| Kartu siswa | Client gallery merender seluruh kartu. | Kartu dirender server; hanya dialog yang client component. |
| OpenGraph image | Halaman dengan `openGraph` sendiri kehilangan gambar otomatis. | `DEFAULT_OG_IMAGE` dipakai eksplisit; detail proyek memakai thumbnail/fallback. |
| Canonical/noindex | Belum konsisten di semua halaman. | Canonical untuk halaman publik/auth; `noindex` untuk area privat. |
| JSON-LD | Belum lengkap dan serializer belum meng-escape `<`/`>`. | `serializeJsonLd` aman; WebSite, EducationalOrganization, CollectionPage/ItemList, AboutPage, ProfilePage, CreativeWork, BreadcrumbList. |
| PWA | Manifest dasar. | Manifest lengkap, 5 ikon PNG (any + maskable + Apple), shortcut, service worker, offline shell. |
| Loading | Skeleton visual saja. | Live-region announcer di luar `aria-busy`; skeleton `aria-hidden`; status memakai `visuallyHidden`. |
| Dialog siswa | Fokus belum dikelola penuh. | Native `<dialog>`, focus trap, Escape/backdrop, focus return, label per siswa. |
| Dialog hapus | Escape/focus return bergantung pada perilaku bawaan. | Escape ditangani eksplisit, focus trap native, dan fokus kembali ke tombol pemicu. |
| Print | Belum ada aturan khusus. | Aturan global + proyek satu kolom, profil kelas, galeri siswa, laporan PKL; aksi/navigasi disembunyikan. |
| Kontras | Beberapa kombinasi belum diukur. | Muted diperkuat, inisial memakai tinta gelap, dan regression test kontras WCAG AA ditambahkan. |
| Cache aset | Default framework. | Cache immutable untuk seed/ikon, revalidate untuk SW/offline, cache OG image. |
| Query & indeks | Sebagian query read-only belum di-deduplikasi; beberapa select masih membawa kolom yang tidak dipakai; indeks belum selaras dengan pola urutan. | Semua query read-only memakai `cache()`; select dipisah per kebutuhan; indeks komposit ditambahkan untuk status+urutan, kategori, siswa, PKL, dan akun. |
| CSP/header | CORP global berpotensi memblokir gambar sosial. | CORP global dihapus; CSP nonce ketat, `unsafe-eval` hanya development. |
| Regression test | 8 file/164 test. | 12 file/183 test, termasuk SEO serializer, helper profil, kontras token, dan markup skeleton. |

## Dampak yang diharapkan

### Performa

- **Lebih sedikit JavaScript klien** karena kartu siswa, navigasi admin, dan header dirender di server. Dialog tetap kecil dan hanya aktif saat dibutuhkan.
- **Query lebih sedikit dan terprediksi** karena semua query read-only memakai `cache()`, `select` sempit per kebutuhan, transaksi galeri, dan pengambilan paralel.
- **Memori hasil query lebih kecil** karena kartu siswa tidak lagi membawa `sortOrder`/`isVisible`/`updatedAt`, daftar PKL admin tidak membawa `summary`/`createdAt`/`reviewedAt`, dan form PKL tidak membawa relasi `user`.
- **Gambar lebih ringan** karena AVIF/WebP, `sizes` eksplisit, lazy loading default, dan prioritas hanya untuk gambar utama.
- **Repeat visit lebih cepat** karena cache aset statis dan PWA cache untuk aset non-privat.
- **Navigasi terasa lebih responsif** karena skeleton + live announcer, tanpa menambah client JavaScript besar.

### SEO dan social sharing

- Pratinjau WhatsApp/Twitter/Facebook konsisten karena OG/Twitter image selalu ada.
- Canonical mengurangi risiko duplicate content.
- Area privat tidak diindeks.
- Structured data membantu mesin pencari memahami situs, organisasi pendidikan, profil kelas, dan karya proyek.
- JSON-LD tidak dapat dipakai untuk menutup tag `<script>` lewat judul/deskripsi pengguna.

### Aksesibilitas dan UX

- Pengguna keyboard dapat membuka/menutup dialog dan kembali ke kartu asal.
- Screen reader mendapat pengumuman loading dan label unik per siswa.
- Navigasi aktif dikenali lewat `aria-current`.
- Mode cetak menghasilkan laporan/profil yang lebih bersih.
- Animasi dihormati saat pengguna memilih reduced motion.

### Keamanan

- Server Action tetap terlindungi origin check, sesi, dan Zod.
- Redirect tidak bisa dipakai untuk open redirect.
- Upload tidak menerima file palsu berdasarkan MIME saja.
- Hapus gambar hanya untuk URL Blob HTTPS yang valid.
- CSP production lebih ketat dan tidak memakai `unsafe-eval`.
- Service worker tidak pernah menyimpan HTML privat atau request non-GET.

## Bukti verifikasi

### Perintah

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Hasil:

- `typecheck`: lulus.
- `lint`: lulus.
- `test`: 12 file, 183 test lulus.
- `build`: lulus; semua rute terkompilasi.

### Lighthouse

Diuji pada:

- `/`
- `/about`
- `/dashboard`
- `/profil-kelas`
- `/projects/kasirkita`
- `/admin/profil-kelas`
- Production `/` di port 3100

Semua menghasilkan:

```text
Accessibility   1
Best Practices  1
SEO             1
Failures        none
```

### Browser QA

- Login admin berhasil.
- Dialog profil siswa: buka, fokus awal ke tombol tutup, Escape menutup, fokus kembali ke tombol “Lihat profil …”.
- `aria-current="page"` muncul di navigasi desktop/mobile dan admin.
- Metadata OG/Twitter image terpasang di beranda, Tentang, dan detail proyek.
- Service worker production aktif dan cache berisi `/offline.html`, ikon, dan aset statis.
- Service worker production tidak menyimpan HTML privat (`/dashboard`, `/admin`, `/profil-kelas`, `/laporan-pkl`).
- Tidak ada error CSP di console. Browser kadang menampilkan warning preload font/CSS dari Next.js setelah navigasi; warning itu bukan pelanggaran CSP dan tidak muncul konsisten di semua load.

### Verifikasi query plan

`EXPLAIN` lokal menunjukkan indeks baru dipakai untuk pola utama:

| Query | Index/plan |
| --- | --- |
| Urutan admin project | `projects_updated_at_id_idx`, backward index scan |
| Urutan siswa terlihat | `student_profiles_is_visible_sort_order_name_idx`, covering index |
| Urutan siswa admin | `student_profiles_sort_order_name_idx`, covering index |
| Urutan admin PKL | `pkl_submissions_updated_at_id_idx`, backward index scan |
| Urutan akun admin | `users_full_name_username_idx`, covering index |
| Detail project | `projects_slug_key`, const |
| Kategori galeri | `projects_status_category_id_published_at_id_idx` |

Pada uji sintetis 500 project, query landing selesai sekitar **27,77 ms**. Optimizer memilih full scan + filesort karena seluruh 500 baris berstatus `PUBLISHED` (filter status tidak selektif); `FORCE INDEX` membuktikan indeks `projects_status_published_at_id_idx` valid dan dapat dipakai saat selektivitas meningkat. Pencarian judul memakai `LIKE '%q%'`, sehingga B-tree hanya bisa dipakai sebagai covering index scan, bukan range seek; pada skala ratusan baris hasilnya tetap cepat.

### Metrik lokal (indikatif)

Production lokal warm cache:

- TTFB: sekitar 168 ms.
- FCP: sekitar 416 ms.
- Load event: sekitar 565 ms.

Angka ini bukan benchmark perangkat nyata dan tidak menggantikan Lighthouse performance/Core Web Vitals production.

## Risiko dan pekerjaan lanjutan

1. **Blob upload nyata** belum diuji karena token kosong. Perlu uji upload/hapus di environment dengan `BLOB_READ_WRITE_TOKEN`.
2. **Login production di domain HTTPS nyata** belum diuji. Login production lokal di `http://localhost:3100` sudah berhasil, termasuk cookie `__Host-kk_session`, karena browser memperlakukan localhost sebagai secure context.
3. **Preview host allowlist** perlu diverifikasi dengan domain Vercel preview sebenarnya.
4. **Migrasi/seed production** dan GitHub Actions pertama belum dijalankan.
5. **Core Web Vitals lapangan** perlu RUM/analytics production; Lighthouse tool yang dipakai tidak menghitung skor performa.
6. **Cache ikon** memakai nama file statis. Jika ikon berubah, gunakan nama baru atau purge cache.
7. **Service worker** sengaja konservatif. Jika nanti ada halaman offline yang lebih kaya, pastikan tidak pernah menyimpan HTML privat.

## Kesimpulan

Audit ini tidak mengubah stack atau pola utama aplikasi. Perubahan berfokus pada pengurangan JavaScript klien, query yang lebih efisien, metadata/structured data yang lengkap dan aman, PWA yang layak install, aksesibilitas dialog/loading, aturan cetak, serta hardening Server Action dan CSP. Semua pemeriksaan lokal yang tersedia lulus; item yang bergantung pada production/Vercel tetap dicatat sebagai batasan.
