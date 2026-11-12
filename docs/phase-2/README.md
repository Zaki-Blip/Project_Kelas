# Phase 2 — Foundation

Status: **complete**. Berhenti di sini dan menunggu approval sebelum Phase 3.

## Yang sudah dibuat

### Application foundation

- Next.js `16.4.6` App Router dengan React `19.3.0`, TypeScript strict, `src/`, dan CSS Modules.
- Tidak memakai Tailwind.
- Dependency aplikasi dipin ke versi exact. `npm audit` bersih (0 vulnerabilities).
- Root layout memakai font Space Grotesk dan DM Sans melalui `next/font`.
- Design tokens ada di `src/styles/tokens.css`; reset dan utilitas dasar ada di `src/app/globals.css`.
- Public shell: `SiteHeader`, `SiteFooter`, skip link, mobile menu berbasis `<details>`.
- Halaman fondasi: `/`, `/about`, `/login`, `/register`, 404, dan error boundary.
- Halaman `/login` dan `/register` masih placeholder; implementasi autentikasi masuk Phase 3.
- `next.config.ts` sudah memuat security headers dasar, konfigurasi gambar Vercel Blob, batas body Server Action, dan `serverExternalPackages`.

### Database dan seed

- Prisma `7.10.1` dengan `@prisma/adapter-mariadb`.
- Schema di `prisma/schema.prisma`, generated client di `src/generated/prisma`.
- Migration awal: `prisma/migrations/20261110135808_init/migration.sql`.
- Model: `User`, `Session`, `AuthAttempt`, `Category`, `Technology`, `Project`, `ProjectMember`, `ProjectImage`, `ProjectTechnology`.
- Enum: `Role`, `ProjectStatus`.
- Nama tabel dan kolom memakai `snake_case` melalui `@map` / `@@map`.
- Index dan `onDelete` sudah diterapkan sesuai rencana Phase 1.
- Seed idempotent di `prisma/seed.ts`.
- Seed development menghasilkan:
  - 1 admin dari env
  - 4 demo user
  - 5 kategori
  - 10 teknologi
  - 10 project (9 `PUBLISHED`, 1 `DRAFT`)
  - 13 project member, 18 project image, 29 project technology
- Gambar seed ada di `public/seed/` dan dapat dibuat ulang dengan `scripts/generate-seed-images.ps1`.
- Config Prisma 7.10 dibuat sebagai `prisma7.config.ts` (nama yang dihasilkan Prisma 7.10).

### Library dasar

- `src/lib/env.ts`: validasi environment dengan Zod dan `server-only`.
- `src/lib/db.ts`: Prisma client singleton dengan MariaDB adapter.
- `src/lib/prisma-adapter.ts`: membuat adapter dari `DATABASE_URL`, termasuk menerjemahkan `sslaccept`/`sslmode` ke opsi TLS driver MariaDB dan membatasi connection pool.
- `src/lib/cn.ts`: helper class name.
- `src/components/ui/Button.tsx`: tombol reusable dengan varian dan ukuran.
- `src/components/ui/Skeleton.tsx`: skeleton untuk loading state.

## Cara menjalankan lokal

Prasyarat: Node.js 24+, MySQL 8 yang kompatibel, dan database `karyakelas`.

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Environment lokal ada di `.env` (tidak di-commit). Template ada di `.env.example`.

Untuk development, `.env` memakai:

```env
DATABASE_URL="mysql://root@localhost:3306/karyakelas"
APP_URL="http://localhost:3000"
AUTH_SECRET="dev-only-change-me-0123456789abcdef0123456789abcdef"
BLOB_READ_WRITE_TOKEN=""
PREVIEW_ALLOWED_HOSTS="*.vercel.app"
SEED_DEMO_DATA="true"
```

## Verifikasi yang sudah dijalankan

| Pemeriksaan | Hasil |
| --- | --- |
| `npm run lint` | Lulus |
| `npm run typecheck` | Lulus setelah `.next` lama dibersihkan |
| `npm run build` | Lulus; route `/`, `/about`, `/login`, `/register`, `/_not-found` |
| `npm audit` | 0 vulnerabilities |
| Seed dijalankan dua kali | Idempotent; jumlah relasi tidak bertambah |
| Lighthouse `/` | Accessibility 100, Best Practices 100, SEO 100 |
| Lighthouse `/about` | Accessibility 100, Best Practices 100, SEO 100 |
| Lighthouse 404 | Accessibility 100, Best Practices 100, SEO 100 |
| Visual QA 360 / 768 / 1280 px | Tidak ada horizontal overflow; header, hero, grid, CTA, footer, auth card, dan about card tampil baik |

Catatan: `npm run typecheck` bisa gagal jika `.next/types` masih menyimpan route lama setelah file route dihapus. Hapus `.next` lalu jalankan ulang. Build normal akan meregenerasi tipe.

## Batasan Phase 2

- Belum ada autentikasi, session, rate limit, atau authorization.
- Belum ada galeri, detail proyek, pratinjau langsung, dashboard, atau admin CRUD.
- Landing dan About masih versi fondasi; galeri, pencarian, dan preview proyek masuk Phase 4.
- Halaman login/register masih placeholder.
- Upload Vercel Blob belum diimplementasikan; dependency sudah disiapkan.
- Database produksi belum diprovision. Development memakai MySQL lokal Laragon.
- `SEED_DEMO_DATA=true` hanya untuk development. Produksi harus `false` dan hanya membuat admin.
- `@vercel/blob` dipin ke `2.4.0`; versi `2.9.0` membawa transitive dependency dengan advisory tinggi.
- `npm run test` disiapkan untuk Phase 7; belum ada test suite.

## Phase berikutnya

Phase 3: autentikasi custom session, cookie `httpOnly`/`Secure`/`SameSite=Lax`, hashing Argon2id, rate limit login/register, dan authorization per request.
