# KaryaKelas — Fase 1: Arsitektur & Rancangan

Status: **disetujui**. Implementasi fondasi ada di [`../phase-2/README.md`](../phase-2/README.md).

Fase ini hanya menghasilkan dokumen. Belum ada kode aplikasi, instalasi dependency, atau perubahan database pada saat fase ini dibuat.

## Dokumen

| File | Isi |
|---|---|
| [`architecture.md`](./architecture.md) | Stack, struktur folder, sitemap, auth, storage, CSP, keamanan, query, dependency, env, deployment, risiko, asumsi |
| [`database.md`](./database.md) | ERD, definisi tabel, relasi `onDelete`, index, pola query, Prisma 7, migrasi, seed |
| [`design-system.md`](./design-system.md) | Token warna, tipografi, komponen, state, aksesibilitas, responsif |
| [`wireframes.md`](./wireframes.md) | Wireframe teks setiap halaman dan state |

## Keputusan utama

1. **Next.js 16 App Router + TypeScript strict + RSC.** Next.js `16.4.6` stable saat dokumen dibuat. CSS Modules, tanpa Tailwind.
2. **Prisma 7 + MySQL 8 hosted di Railway + `@prisma/adapter-mariadb`.** Prisma Client singleton, migrasi via Prisma Migrate, seed idempotent.
3. **Custom opaque session, bukan Auth.js.** Auth.js v5 masih beta dan v4 legacy. Session custom memberi kontrol penuh atas rate limit, pencabutan session, dan pesan error. Token 256-bit, hanya hash yang disimpan, cookie `__Host-` httpOnly/Secure/SameSite=Lax.
4. **Vercel Blob untuk upload.** Validasi MIME + magic bytes + ukuran 3 MB, nama file digenerate ulang, hanya JPEG/PNG/WebP.
5. **Live preview dengan allowlist.** URL wajib https dan host harus cocok dengan `PREVIEW_ALLOWED_HOSTS`. iframe memakai sandbox ketat tanpa `allow-same-origin`; CSP `frame-src` hanya origin allowlist.
6. **Pencarian/filter/pagination lewat URL + query database.** Page size galeri 9, admin 20, `select` terbatas, count + findMany dalam transaksi.
7. **Otorisasi server-side.** Setiap halaman dan action admin memanggil guard; role dibaca dari database; origin check pada semua mutasi.

## Cara memverifikasi fase ini

1. Baca keempat dokumen.
2. Pastikan ERD di `database.md` dapat dirender oleh preview Mermaid (GitHub/VS Code Markdown Preview Mermaid).
3. Cocokkan matriks akses di `architecture.md` dengan kebutuhan:
   - publik: landing, About, 6 preview;
   - USER: galeri, detail, preview;
   - ADMIN: seluruh admin.
4. Cocokkan wireframe dengan daftar halaman yang diminta.
5. Beri keputusan pada pertanyaan persetujuan di akhir ringkasan fase.

Tidak ada perintah build/test pada fase ini karena belum ada aplikasi.

## Asumsi yang perlu dikonfirmasi

- Registrasi terbuka dan selalu menghasilkan role `USER`.
- USER hanya melihat project `PUBLISHED`; ADMIN melihat draft.
- Landing menampilkan 6 project PUBLISHED; kartu mengarah ke login.
- Filter kategori/teknologi masing-masing satu pilihan.
- Galeri 9 project/halaman; admin 20 project/halaman.
- Maksimal 6 screenshot per project, 3 MB per gambar.
- Preview allowlist default `*.vercel.app`, domain lain lewat env.
- Seed demo hanya untuk development; produksi hanya admin + data nyata.
- Tidak ada email verification, password reset, user management, komentar, like, bookmark, leaderboard, atau statistik.

## Risiko utama

- Custom auth perlu implementasi dan test yang disiplin.
- Koneksi MySQL TCP dari Vercel perlu dimonitor; gunakan singleton dan batas koneksi.
- Deteksi iframe gagal tidak selalu tersedia cross-origin; gunakan timeout + tautan eksternal.
- CSP nonce perlu diuji di build produksi.
- Magic bytes bukan decode penuh; batas format/ukuran mengurangi risiko.
- Pencarian `contains` belum tentu memakai index B-tree; cukup untuk skala kelas.

## Pertanyaan persetujuan

Disetujui melalui instruksi untuk melanjutkan ke Fase 2.

1. Setujui custom session (bukan Auth.js) dengan tabel `sessions` dan `auth_attempts`?
2. Setujui Railway MySQL + Prisma 7 + `@prisma/adapter-mariadb` sebagai database utama?
3. Setujui Vercel Blob, batas 3 MB per gambar, dan maksimal 6 screenshot?
4. Setujui allowlist preview default `*.vercel.app` yang dapat ditambah lewat `PREVIEW_ALLOWED_HOSTS`?
5. Setujui asumsi akses: USER hanya PUBLISHED, landing 6 project, filter tunggal, registrasi terbuka?

Jika setuju, Fase 2 akan dimulai: setup project, Prisma schema + migrasi + seed, design tokens, dan layout.
