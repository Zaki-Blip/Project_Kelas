# KaryaKelas

Katalog karya siswa untuk melihat, mencari, dan mencoba proyek kelas. Aplikasi ini juga menyediakan panel pengelola untuk CRUD project, kategori, teknologi, laporan PKL, serta profil kelas dan galeri foto siswa.

## Fitur

- Landing page publik dengan pratinjau project `PUBLISHED` terbaru.
- Halaman Tentang.
- Registrasi, login, dan logout dengan session opaq server-side.
- Galeri karya dengan pencarian, filter kategori/teknologi, dan paginasi.
- Detail project dengan akses berbasis peran.
- Live preview dalam iframe yang di-sandbox dan dibatasi host allowlist.
- Halaman `/profil-kelas` dengan identitas kelas, galeri foto siswa, overlay tautan sosial siswa, dan modal profil.
- Panel `/admin` untuk CRUD project, kategori, teknologi, laporan PKL, serta profil kelas dan siswa.
- Halaman `/laporan-pkl` dengan status **Coming Soon**; pengumpulan laporan dibuka 1 bulan sebelum masa PKL selesai.
- Halaman `/admin/laporan-pkl` untuk admin meninjau, memberi catatan, dan menghapus laporan.
- Kotak saran di beranda untuk pengguna yang sudah login, terhubung ke Formspree.
- PWA Web Manifest (`/manifest.webmanifest`), ikon any/maskable, service worker production, dan halaman offline.
- OpenGraph generator dinamis (`/opengraph-image`), Twitter Card, canonical, dan metadata artikel untuk detail proyek.
- Structured Data Schema.org JSON-LD (`WebSite`, `EducationalOrganization`, `CollectionPage`/`ItemList`, `AboutPage`, `ProfilePage`, `CreativeWork`, `BreadcrumbList`) dengan serializer yang aman.
- Optimasi gambar modern Next.js dengan format AVIF & WebP otomatis, `sizes` eksplisit, lazy loading, dan cache headers statis.
- Loading skeleton dengan `aria-busy` dan live-region `visuallyHidden`, tab order galeri yang konsisten, dialog profil/hapus dengan focus trap dan focus return, serta navigasi aktif `aria-current`.
- Soft Neobrutalism dengan CSS Modules dan CSS variables, tanpa Tailwind, dengan kontras teks/badge yang diuji WCAG AA dan mode cetak (`@media print`) untuk proyek, profil kelas, galeri siswa, dan laporan PKL.

## Stack

- Next.js `16.4.6` App Router, React Server Components, TypeScript strict.
- React `19.3.0`.
- Prisma `7.10.1` dengan MySQL dan `@prisma/adapter-mariadb`.
- Zod `4.6.7` untuk validasi input.
- `@node-rs/argon2` untuk hashing password.
- Vercel Blob untuk penyimpanan gambar.
- Vitest `5.1.0` untuk unit test.

## Persyaratan

- Node.js 20 atau lebih baru.
- npm.
- MySQL 8 (lokal atau hosted).
- Vercel Blob token untuk upload gambar.
- Endpoint Formspree untuk kotak saran beranda (opsional; form menampilkan pesan belum aktif jika kosong).

## Menjalankan secara lokal

1. Install dependency:

   ```bash
   npm install
   ```

2. Salin environment contoh:

   ```bash
   copy .env.example .env
   ```

   Di macOS/Linux gunakan `cp .env.example .env`.

3. Isi `.env` minimal:

   ```dotenv
   DATABASE_URL="mysql://root@localhost:3306/karyakelas"
   APP_URL="http://localhost:3000"
   AUTH_SECRET="isi-dengan-secret-acak-minimal-32-byte"
   BLOB_READ_WRITE_TOKEN=""
   FORMSPREE_ENDPOINT=""
   PREVIEW_ALLOWED_HOSTS="*.vercel.app"
   SEED_ADMIN_NAME="Admin KaryaKelas"
   SEED_ADMIN_USERNAME="admin"
   SEED_ADMIN_EMAIL="admin@karyakelas.local"
   SEED_ADMIN_PASSWORD="AdminKarya123!"
   SEED_DEMO_DATA="true"
   ```

4. Jalankan migrasi dan seed:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Jalankan development server:

   ```bash
   npm run dev
   ```

6. Buka [http://localhost:3000](http://localhost:3000).

### Akun seed lokal

- Admin: gunakan nilai `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` di `.env`. Pada environment lokal saat ini: `admin@karyakelas.local` / `AdminKarya123!`.
- User demo (`budi`, `sari`, `raka`, `nabila`, `dimas`) dibuat dengan password acak agar tidak bisa dipakai login. Untuk menguji alur siswa, daftar akun baru lewat `/register`.
- Profil kelas demo `XII RPL 1` dan enam profil siswa dibuat saat `SEED_DEMO_DATA="true"`. Foto placeholder tersedia di `public/seed/profiles/`.

Jangan gunakan kredensial seed di production. Ganti `SEED_ADMIN_*` dan set `SEED_DEMO_DATA="false"` untuk deployment nyata.

## Variabel environment

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | Ya | URL MySQL. Gunakan `sslaccept=strict` untuk database hosted. |
| `APP_URL` | Ya | Origin canonical aplikasi. Gunakan `https://...` di production. |
| `AUTH_SECRET` | Ya | Secret acak minimal 32 byte untuk HMAC rate-limit. |
| `BLOB_READ_WRITE_TOKEN` | Upload | Token Vercel Blob. Upload gagal dengan pesan yang jelas jika kosong. |
| `FORMSPREE_ENDPOINT` | Saran | Endpoint Formspree untuk kotak saran beranda, misalnya `https://formspree.io/f/xxxxxxxx`. Jika kosong, form menampilkan pesan belum aktif. |
| `PREVIEW_ALLOWED_HOSTS` | Tidak | Daftar host preview dipisah koma. Mendukung wildcard, misalnya `*.vercel.app,*.netlify.app`. |
| `SEED_ADMIN_NAME` | Seed | Nama admin pertama. |
| `SEED_ADMIN_USERNAME` | Seed | Username admin pertama. |
| `SEED_ADMIN_EMAIL` | Seed | Email admin pertama. |
| `SEED_ADMIN_PASSWORD` | Seed | Password admin pertama, minimal 8 karakter. |
| `SEED_DEMO_DATA` | Seed | Set `true` untuk membuat user, project, laporan PKL, dan profil kelas/siswa demo. |

## Kotak saran (Formspree)

Kotak saran ada di beranda, pada bagian `#kotak-saran`. Form hanya bisa dikirim oleh pengguna yang sudah login; pengunjung yang belum masuk akan melihat tombol login.

Untuk mengaktifkannya:

1. Buat form baru di [Formspree](https://formspree.io).
2. Salin endpoint form, misalnya `https://formspree.io/f/xxxxxxxx`.
3. Isi `.env`:

   ```dotenv
   FORMSPREE_ENDPOINT="https://formspree.io/f/xxxxxxxx"
   ```

4. Restart `npm run dev`. Untuk production, tambahkan variabel yang sama di Vercel lalu redeploy.

Server Action mengirim nama, email, username, jenis tanggapan, isi tanggapan, sumber halaman, dan waktu kirim ke Formspree. Endpoint divalidasi agar hanya menerima host resmi `formspree.io` dengan HTTPS. Jika `FORMSPREE_ENDPOINT` kosong atau tidak valid, form menampilkan pesan bahwa kotak saran belum aktif.

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Development server. |
| `npm run build` | Generate Prisma Client lalu build production. |
| `npm run start` | Jalankan hasil build. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | TypeScript tanpa emit. |
| `npm run test` | Vitest unit test. |
| `npm run db:generate` | Generate Prisma Client. |
| `npm run db:migrate` | Migrasi development. |
| `npm run db:deploy` | Migrasi production. |
| `npm run db:seed` | Seed idempotent. |
| `npm run db:studio` | Prisma Studio. |

## Alur laporan PKL

- `/laporan-pkl` saat ini menampilkan status **Coming Soon**. Pengumpulan laporan akan dibuka **1 bulan sebelum masa PKL selesai**.
- Setelah dibuka, siswa mengisi judul, tempat PKL, ringkasan, dan URL laporan HTTPS.
- Satu siswa hanya punya satu laporan (`userId` unik).
- Siswa dapat mengubah laporan selama status belum `REVIEWED`.
- Setiap perubahan mengembalikan status ke `SUBMITTED` dan menghapus catatan/tanggal tinjauan.
- Admin membuka `/admin/laporan-pkl` untuk mencari, membuka tautan laporan, menandai `REVIEWED` atau `REVISION`, memberi catatan, dan menghapus laporan.
- URL laporan wajib HTTPS, tanpa kredensial, tanpa port khusus, dan bukan host lokal.

## Alur profil kelas

- `/profil-kelas` hanya bisa dibuka setelah login. Halaman ini menampilkan identitas kelas, foto utama, dan galeri siswa.
- Profil kelas tidak memiliki tautan sosial. Tautan sosial hanya tersedia di profil siswa.
- Tautan sosial siswa diisi satu URL per baris, maksimal 5 tautan, dan wajib HTTPS tanpa kredensial, port khusus, atau host lokal.
- Platform siswa terdeteksi otomatis dari domain (misalnya TikTok, Instagram, GitHub, LinkedIn, YouTube, X, atau Facebook). Domain lain tetap diterima dan ditampilkan dengan label domainnya.
- Arahkan kursor atau fokuskan keyboard ke kartu siswa untuk melihat overlay tautan sosial siswa.
- Klik atau sentuh foto siswa untuk membuka modal profil berisi foto, nama, peran, bio, dan tautan sosial. Modal bisa ditutup lewat tombol, tombol Escape, atau klik backdrop; fokus kembali ke kartu asal.
- Admin mengatur profil kelas di `/admin/profil-kelas`, lalu menambah atau mengubah siswa di `/admin/profil-kelas/siswa/new` dan `/admin/profil-kelas/siswa/[id]/edit`.
- Profil siswa punya urutan tampil dan status visibilitas. Profil yang disembunyikan tetap tersimpan tetapi tidak muncul di halaman publik.
- Foto siswa wajib diunggah. Foto kelas opsional. Keduanya memakai pipeline upload yang sama dengan project dan disimpan di folder Blob `profiles/`.

## Keamanan

- Password di-hash dengan Argon2id.
- Session berupa token opaque 32 byte; yang disimpan di database hanya hash SHA-256.
- Cookie production `__Host-kk_session` (`Secure`, `HttpOnly`, `SameSite=Lax`); development memakai `kk_session`.
- Login dibatasi 5 kegagalan per identifier/IP dan 20 per IP; registrasi 5 per jam per IP.
- Semua Server Action memvalidasi input dengan Zod dan memeriksa origin.
- Setiap aksi admin memanggil `getAdminSession()` dan `assertSameOrigin()`.
- Upload memeriksa MIME, magic byte, ekstensi, dan ukuran.
- Foto profil hanya menerima aset seed di allowlist atau URL Vercel Blob HTTPS.
- Tautan sosial siswa menerima host HTTPS apa pun tanpa kredensial, port khusus, atau host lokal. Setiap baris URL divalidasi dan dinormalisasi sebelum disimpan.
- CSP per-request dengan nonce, `strict-dynamic`, `unsafe-eval` hanya di development, security headers, dan allowlist `next/image`.
- Service worker hanya menyimpan aset statis dan halaman offline; HTML privat dan request non-GET tidak di-cache.
- Preview iframe memakai `sandbox="allow-scripts allow-forms allow-modals"` tanpa `allow-same-origin`, top navigation, atau popup.
- Kode sumber yang diunggah tidak pernah dieksekusi di server.

## Catatan Next.js 16

Next.js `16.4.6` memiliki bug streaming: pada full page load, fallback `loading.tsx` bisa tertinggal di layar sementara konten asli masuk ke `div#S:*` yang tersembunyi. Soft navigation tidak terkena bug ini.

`src/components/layout/StreamingBoundaryRecovery.tsx` mendeteksi kondisi tersebut, memanggil `router.refresh()` sekali, lalu membersihkan segmen tersembunyi yang yatim agar ID statis tidak duplikat. Komponen ini dipasang di root layout. Jangan menghapusnya tanpa memeriksa apakah bug upstream sudah diperbaiki.

Jika membuka dev server dari perangkat lain di jaringan lokal dan muncul peringatan cross-origin HMR, tambahkan host/IP tersebut ke `allowedDevOrigins` di `next.config.ts`. Ini hanya memengaruhi mode development.

## Deployment

Target: Vercel untuk aplikasi, MySQL hosted (misalnya Railway) untuk database, dan Vercel Blob untuk gambar.

1. Buat database MySQL dan salin connection string ke `DATABASE_URL`. Untuk provider yang memerlukan TLS, tambahkan `sslaccept=strict`.
2. Set `APP_URL` ke domain production `https://...`.
3. Generate `AUTH_SECRET` acak minimal 32 byte.
4. Buat Vercel Blob store dan set `BLOB_READ_WRITE_TOKEN`.
5. Buat form Formspree dan set `FORMSPREE_ENDPOINT` ke endpoint form tersebut.
6. Set `PREVIEW_ALLOWED_HOSTS` sesuai domain preview yang diizinkan.
7. Jalankan migrasi production:

   ```bash
   npm run db:deploy
   ```

8. Jalankan seed admin:

   ```bash
   npm run db:seed
   ```

   Set `SEED_DEMO_DATA="false"` di production. Seed bersifat idempotent, tetapi tetap tinjau data yang dibuat.

9. Deploy ke Vercel. Pastikan environment variable di atas tersedia di environment production.

## Pengujian

Status terakhir:

| Perintah | Hasil |
| --- | --- |
| `npm run test` | 13 file, 193 test, semua lulus. |
| `npm run typecheck` | Lulus. |
| `npm run lint` | Lulus. |
| `npm run build` | Lulus; semua rute terkompilasi, termasuk static icon, robots, sitemap, manifest, dan opengraph-image. |

CI GitHub Actions tersedia di `.github/workflows/ci.yml`. Workflow menjalankan MySQL service, migrasi, typecheck, lint, unit test, dan production build. Workflow belum dijalankan di GitHub pada environment ini.

Smoke test production setelah perubahan Phase 9 juga lulus: route publik `200`, route terproteksi `307` ke login dengan `next` yang benar, `/does-not-exist` `404` dengan CSP nonce, dan security headers lengkap. `/profil-kelas`, `/admin/profil-kelas`, dan `/admin/profil-kelas/siswa/new` terverifikasi mengarah ke login dengan `next` yang sesuai.

QA manual yang sudah diverifikasi: login admin, CRUD project, dialog hapus, CRUD kategori/teknologi, submit laporan PKL, tinjauan admin, hapus laporan, simpan profil kelas, CRUD profil siswa, tautan sosial siswa dinamis (tambah/hapus URL), overlay sosial, modal profil, keyboard focus, dan redirect auth halaman profil.

Lighthouse untuk beranda, Tentang, galeri, profil kelas, detail proyek, dan admin profil kelas menghasilkan Accessibility `1`, Best Practices `1`, dan SEO `1` tanpa failure. Production smoke test juga memverifikasi service worker aktif, cache offline terisi, metadata OpenGraph/Twitter, CSP nonce, login admin lokal, dan service worker yang tidak menyimpan HTML privat.

Detail audit dan laporan peningkatan tersedia di:

- [`docs/audit-2026-11/README.md`](docs/audit-2026-11/README.md)
- [`docs/audit-2026-11/IMPROVEMENT_REPORT.md`](docs/audit-2026-11/IMPROVEMENT_REPORT.md)

Belum diverifikasi karena keterbatasan environment:

- Upload Vercel Blob nyata dengan token valid.
- Login production di domain HTTPS nyata; login production lokal di `http://localhost:3100` sudah berhasil, termasuk cookie `__Host-kk_session`.
- Host preview production di `PREVIEW_ALLOWED_HOSTS`.
- Navigasi offline nyata dengan network throttling; cache service worker dan `/offline.html` sudah terverifikasi.
- E2E browser test otomatis dan integration test MySQL.

## Struktur singkat

```text
src/
  app/                  # route App Router
  components/           # UI, layout, admin, pkl, profiles
  lib/                  # validasi, query, security, env
  server/actions/       # Server Actions
  generated/prisma/     # Prisma Client hasil generate
prisma/
  schema.prisma
  migrations/
  seed.ts
tests/
  unit/                 # Vitest unit test
docs/
  phase-1/ ... phase-9/
  audit-2026-11/       # audit performa, SEO, a11y, keamanan, dan laporan
```
