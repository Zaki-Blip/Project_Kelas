# Audit Performa, SEO, Aksesibilitas, dan Keamanan — November 2026

Dokumen ini mencatat audit menyeluruh KaryaKelas dan optimasi yang diterapkan tanpa mengubah arsitektur utama:

- Next.js 16 App Router, React Server Components, React 19.
- TypeScript strict, Server Actions + Zod, MySQL/Prisma 7.
- CSS Modules/CSS variables, tanpa Tailwind.
- Vercel Blob dan deployment Vercel.

## Ruang lingkup

1. Performa dan Core Web Vitals: pembagian RSC/client, query database, gambar, cache, PWA.
2. SEO dan social discoverability: metadata dinamis, canonical, OpenGraph/Twitter, JSON-LD, robots, sitemap, manifest.
3. Aksesibilitas dan UX: kontras, label per item, fokus dialog, skip link, live region, reduced motion, mode cetak.
4. Keamanan Server Action dan CSP: origin, sesi, validasi, redirect aman, upload, path traversal, header.
5. Kualitas kode dan regresi: Vitest, TypeScript, ESLint, production build, smoke test, Lighthouse.

## Temuan utama

| Area | Temuan | Dampak |
| --- | --- | --- |
| Client bundle | Navigasi admin dan sebagian header memakai client component hanya untuk status aktif. | JavaScript klien lebih besar dari kebutuhan. |
| SEO | Halaman yang menetapkan `openGraph` sendiri kehilangan gambar OpenGraph otomatis dari `opengraph-image.tsx`. | Pratinjau sosial tidak konsisten. |
| Structured data | JSON-LD belum lengkap dan belum aman terhadap karakter penutup `<script>`. | Risiko XSS pada data pengguna dan visibilitas mesin pencari rendah. |
| PWA | Manifest belum memiliki ikon PNG/maskable, shortcut, dan offline shell. | Instalasi mobile/desktop tidak ideal. |
| Loading | Skeleton visual tidak diumumkan ke screen reader. | Pengguna assistive technology tidak tahu halaman sedang dimuat. |
| Dialog | Fokus dan penutupan dialog profil siswa belum dikelola penuh. | Fokus keyboard bisa hilang setelah dialog ditutup. |
| Cetak | Halaman laporan/profil/proyek belum memiliki aturan cetak khusus. | Hasil cetak memuat navigasi, bayangan, dan gambar yang terpotong. |
| Cache | Aset statis dan gambar belum memiliki kebijakan cache eksplisit. | Repeat visit kurang efisien. |
| CSP/header | `Cross-Origin-Resource-Policy: same-origin` global berpotensi menghambat gambar sosial. | Pratinjau sosial berisiko gagal. |
| Regression | Belum ada unit test untuk serializer JSON-LD dan helper tampilan profil. | Perubahan kecil bisa merusak SEO/aksesibilitas. |

## Optimasi yang diterapkan

### 1. Performa dan Core Web Vitals

- **RSC-first**: kartu galeri siswa dirender di server; dialog profil tetap client component kecil. Navigasi admin dan header situs memakai server component dengan `x-pathname` dari proxy.
- **Query efisien**:
  - `cache()` dari React untuk sesi, detail proyek, landing project, taksonomi, profil kelas, dan profil siswa.
  - Query relasi memakai `select` sempit; tidak ada N+1 pada kartu proyek/detail proyek.
  - Daftar + hitungan galeri dijalankan dalam satu `$transaction`.
  - Profil kelas dan siswa diambil paralel dengan `Promise.all`.
- **Gambar**:
  - `next/image` untuk semua gambar; AVIF dan WebP diaktifkan.
  - `sizes` eksplisit untuk kartu, hero, galeri siswa, dan dialog.
  - Hanya hero/detail dan kartu prioritas yang `loading="eager"` + `fetchPriority="high"`; sisanya lazy.
  - `minimumCacheTTL` 31 hari dan cache immutable untuk aset seed/ikon.
  - URL gambar tetap dibatasi ke aset seed allowlist atau Vercel Blob HTTPS.
- **PWA**:
  - Manifest lengkap dengan `id`, `scope`, `display_override`, ikon any/maskable, shortcut, dan warna tema.
  - Service worker production yang hanya menyimpan aset statis dan `/offline.html`; HTML privat tidak pernah di-cache.
  - Registrasi service worker hanya di production.
- **Navigasi**:
  - `LoadingStatus` mengumumkan status loading melalui `role="status"`/`aria-live="polite"`.
  - Skeleton visual tetap tersembunyi dari accessibility tree.
  - Smooth scroll menghormati `prefers-reduced-motion`.

### 2. SEO dan social discoverability

- `metadataBase` global, canonical per halaman, dan `noindex, nofollow` untuk area privat/auth.
- OpenGraph dan Twitter Card lengkap untuk beranda, Tentang, login/register (otomatis), galeri, profil kelas, dan detail proyek.
- `DEFAULT_OG_IMAGE` dipakai ulang agar halaman yang menetapkan metadata sendiri tidak kehilangan gambar sosial.
- Detail proyek memakai thumbnail sebagai OG image bila valid, dengan fallback gambar default.
- `opengraph-image.tsx` menghasilkan gambar 1200×630; cache header ditambahkan di `next.config.ts`.
- JSON-LD aman melalui `serializeJsonLd` yang meng-escape `<`, `>`, `&`, U+2028, dan U+2029.
- Structured data yang dipakai:
  - `WebSite` + `SearchAction`.
  - `EducationalOrganization`.
  - `CollectionPage` + `ItemList` untuk karya terbaru.
  - `AboutPage`.
  - `ProfilePage` untuk profil kelas.
  - `CreativeWork` + `BreadcrumbList` untuk detail proyek.
- `robots.ts` memblokir area privat/API/offline; `sitemap.ts` hanya memuat halaman publik.
- Metadata proyek memakai `article` OpenGraph, tanggal publikasi/modifikasi, tag teknologi, dan canonical.

### 3. Aksesibilitas dan UX

- Skip link “Lewati ke konten utama” dan fokus terlihat global.
- `aria-current="page"` pada navigasi desktop/mobile dan navigasi admin.
- Setiap tombol profil siswa memiliki `aria-label` yang menyebut nama siswa.
- Dialog profil memakai elemen native `<dialog>`:
  - `showModal()` dan focus trap bawaan browser.
  - Escape/backdrop menutup dialog.
  - Fokus kembali ke tombol pemicu setelah ditutup.
  - `aria-labelledby` terhubung ke judul dialog.
- Overlay sosial tetap dapat diakses keyboard dan tidak hanya mengandalkan hover.
- Loading announcer, `aria-busy` pada fallback, dan skeleton yang tidak dibacakan sebagai konten.
- `prefers-reduced-motion` menonaktifkan animasi/transisi dekoratif.
- Aturan `@media print` global dan khusus untuk:
  - Detail proyek.
  - Profil kelas.
  - Galeri siswa.
  - Form/laporan PKL.
- Warna dan fokus mengikuti token yang sudah ada; audit Lighthouse tidak menemukan kontras di bawah ambang.

### 4. Keamanan Server Action dan CSP

- Semua modul Server Action memanggil `assertSameOrigin()`.
- Aksi admin memakai `getAdminSession()`; aksi siswa memakai `requireUser()`/sesi pengguna.
- Semua input divalidasi Zod sebelum menyentuh database.
- Redirect pasca-mutasi dibatasi ke path admin yang aman (`safeAdminReturnPath`), menolak URL absolut, `//`, backslash, traversal, dan encoded control char.
- Upload gambar:
  - Hanya admin.
  - MIME, magic byte, ekstensi, dan ukuran diperiksa.
  - Nama file dibuat dari UUID; tidak memakai nama asli pengguna.
  - Hanya URL Vercel Blob HTTPS yang boleh dihapus/dipakai ulang.
- URL sosial dibatasi ke HTTPS dan host TikTok/Instagram/GitHub tanpa kredensial/port.
- CSP per-request dengan nonce:
  - `script-src` memakai nonce + `strict-dynamic`.
  - `unsafe-eval` hanya di development.
  - `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`.
  - `frame-src` hanya host preview yang diizinkan.
  - `upgrade-insecure-requests` di production.
- Header keamanan: `nosniff`, `Referrer-Policy`, `X-Frame-Options`, COOP, Permissions Policy, HSTS di production.
- `Cross-Origin-Resource-Policy: same-origin` global dihapus agar gambar OG/seed tidak terblokir saat diambil pihak lain; perlindungan framing tetap lewat CSP/`X-Frame-Options`.
- Service worker tidak menyentuh HTML privat, cookie, atau request non-GET.

### 5. Kualitas kode dan regresi

- Unit test baru:
  - `tests/unit/seo.test.ts`: `absoluteUrl`, URL Blob absolut, escaping JSON-LD, nilai `undefined`.
  - `tests/unit/profiles-display.test.ts`: `getInitials`, deteksi tautan sosial valid/tidak valid.
- Test yang ada tetap dipertahankan dan diperluas untuk validasi/keamanan.
- Verifikasi akhir mencakup typecheck, lint, unit test, production build, smoke test, dan Lighthouse.

## Verifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| `npm test` | 12 file, 183 test lulus. |
| `npm run typecheck` | Lulus. |
| `npm run lint` | Lulus. |
| `npm run build` | Lulus; semua rute terkompilasi, termasuk manifest, robots, sitemap, ikon, dan OpenGraph image. |
| Lighthouse beranda | Accessibility 1, Best Practices 1, SEO 1; tanpa failure. |
| Lighthouse Tentang | Accessibility 1, Best Practices 1, SEO 1; tanpa failure. |
| Lighthouse galeri | Accessibility 1, Best Practices 1, SEO 1; tanpa failure. |
| Lighthouse profil kelas | Accessibility 1, Best Practices 1, SEO 1; tanpa failure. |
| Lighthouse detail proyek | Accessibility 1, Best Practices 1, SEO 1; tanpa failure. |
| Lighthouse admin profil kelas | Accessibility 1, Best Practices 1, SEO 1; tanpa failure. |
| Lighthouse production beranda | Accessibility 1, Best Practices 1, SEO 1; tanpa failure. |
| Lighthouse production detail proyek | Accessibility 1, Best Practices 1, SEO 1; tanpa failure. |
| Service worker production | Terdaftar, aktif, scope `/`, cache statis + `/offline.html` terisi. |
| OpenGraph production | `/opengraph-image` mengembalikan PNG 1200×630 dan metadata OG/Twitter terpasang. |
| Keyboard galeri | Tab berurutan dari tombol foto ke tautan sosial tiap siswa; overlay muncul saat `:focus-within`. |
| Dialog profil | Buka/tutup, Escape, backdrop, focus trap, focus return, dan tautan sosial terverifikasi. |
| Dialog hapus | Escape menutup dialog, fokus kembali ke tombol pemicu, dan Tab terperangkap di dalam dialog. |
| Skeleton loading | Profil kelas, laporan PKL, galeri, dan admin memakai `aria-busy="true"`; status pembaca layar berada di luar region sibuk dan memakai `visuallyHidden`. |
| Print | Simulasi aturan `@media print` memverifikasi header, footer, navigasi, dan tombol aksi tersembunyi; detail proyek menjadi satu kolom. |
| Kontras | Teks muted, badge kuning/biru, danger, success, dan inisial besar memenuhi ambang WCAG 2.1 AA; regression test kontras ditambahkan. |
| Navigasi aktif | `aria-current="page"` terverifikasi pada desktop/mobile dan admin. |
| CSP production | Nonce aktif, tanpa `unsafe-eval`; tidak ada error CSP di console. |
| Login production lokal | Login admin di `http://localhost:3100` berhasil; sesi `__Host-kk_session` bekerja karena browser memperlakukan localhost sebagai secure context. |
| Cache privat | Service worker production tidak menyimpan `/dashboard`, `/admin`, `/profil-kelas`, atau `/laporan-pkl`. |

### Catatan performa lokal

Trace production lokal (warm cache, bukan benchmark perangkat nyata) menunjukkan:

- TTFB sekitar 168 ms.
- First Contentful Paint sekitar 416 ms.
- Load event sekitar 565 ms.
- Dua long task terdeteksi; trace tidak menghitung LCP/INP/CLS dan tidak boleh dianggap sebagai skor Lighthouse performance.

Angka ini hanya bukti smoke test lokal, bukan jaminan Web Vitals production.

## Batasan yang belum dapat diverifikasi di environment ini

- Upload Vercel Blob nyata karena `BLOB_READ_WRITE_TOKEN` kosong.
- Login production di domain HTTPS nyata; login production lokal di `http://localhost:3100` sudah berhasil, termasuk cookie `__Host-kk_session`.
- Host preview production sesuai `PREVIEW_ALLOWED_HOSTS`.
- Navigasi offline nyata dengan network throttling; cache service worker dan `/offline.html` sudah terverifikasi, tetapi fallback navigasi belum disimulasikan secara offline.
- Migrasi/seed production dan eksekusi pertama GitHub Actions.
- Lighthouse performance score dan Core Web Vitals lapangan (perlu data production/RUM).

## File utama

- `src/lib/seo.ts`, `src/components/seo/JsonLd.tsx`
- `src/app/layout.tsx`, `src/app/manifest.ts`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/opengraph-image.tsx`
- `src/app/(public)/page.tsx`, `src/app/(public)/about/page.tsx`
- `src/app/(app)/dashboard/page.tsx`, `src/app/(app)/profil-kelas/page.tsx`
- `src/app/(app)/projects/[slug]/page.tsx`
- `src/components/profiles/StudentGallery.tsx`, `src/components/profiles/StudentProfileDialog.tsx`
- `src/components/layout/SiteHeader.tsx`, `src/components/admin/AdminNav.tsx`
- `src/components/ui/LoadingStatus.tsx`
- `src/components/pwa/ServiceWorkerRegistration.tsx`, `public/sw.js`, `public/offline.html`
- `next.config.ts`, `src/proxy.ts`
- `src/app/globals.css` dan CSS module terkait print.
- `tests/unit/seo.test.ts`, `tests/unit/profiles-display.test.ts`
- `tests/unit/loading.test.ts`, `tests/unit/contrast.test.ts`
