# KaryaKelas — Arsitektur Fase 1

Dokumen ini adalah keputusan arsitektur sebelum implementasi. Tidak ada kode aplikasi pada fase ini.

Referensi konsep: `https://dewakoding.com/showcases` berhasil diakses. Yang diambil hanya pola grid kartu, pencarian + filter, halaman detail, dan live preview. Tidak ada desain, warna, teks, atau aset yang disalin.

## 1. Prinsip

- Next.js App Router, React Server Components sebagai default.
- Semua mutasi lewat Server Actions; tidak ada endpoint mutasi publik tambahan.
- Validasi Zod dilakukan di server untuk setiap input, termasuk URL dan file.
- Otorisasi diperiksa di server pada setiap halaman dan setiap action admin. Proxy hanya membantu redirect awal.
- Query database terpilih kolomnya (`select`), terpaginasi, dan tidak mengambil seluruh katalog.
- UI berbahasa Indonesia; identifier, nama file, komentar kode, dan commit berbahasa Inggris.
- Dependency minimal. Setiap paket di luar Next/React/Prisma/Zod/hashing/session dijelaskan di bagian dependency.

## 2. Stack dan versi acuan

| Bagian | Keputusan | Versi acuan |
|---|---|---|
| Framework | Next.js App Router, TypeScript strict, RSC | Next.js `16.4.6` (stable saat dokumen dibuat) |
| UI runtime | React + React DOM | React `19.2.x` |
| Database | MySQL 8.x hosted | Railway MySQL |
| ORM | Prisma ORM + driver adapter MySQL | Prisma `7.10.1`, `@prisma/adapter-mariadb` |
| Validasi | Zod | `4.6.7` |
| Password hashing | Argon2id | `@node-rs/argon2` `2.2.2` |
| Session | Custom opaque session, bukan Auth.js | Tanpa dependency auth tambahan |
| Object storage | Vercel Blob | `@vercel/blob` `2.4.0` (versi 2.9.0 membawa transitive dependency dengan advisory tinggi) |
| Styling | CSS Modules + CSS variables | Built-in Next.js |
| Font | `next/font` Space Grotesk + DM Sans | Built-in Next.js |
| Testing | Vitest untuk unit test | Dev dependency |
| Deployment | Vercel Node.js runtime | — |

Catatan versi: versi di atas adalah versi stable saat Fase 1 ditulis. Fase 2 akan mengunci versi exact di `package.json` dan `package-lock.json`. Jangan memakai Auth.js v5 beta.

## 3. Struktur folder

```text
.
├─ prisma/
│  ├─ schema.prisma
│  ├─ seed.ts
│  └─ migrations/
├─ public/
│  └─ seed/                         # placeholder raster untuk data demo, bukan upload admin
├─ docs/
│  └─ phase-1/
│     ├─ README.md
│     ├─ architecture.md
│     ├─ database.md
│     ├─ design-system.md
│     └─ wireframes.md
├─ src/
│  ├─ app/
│  │  ├─ (public)/
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx                # landing
│  │  │  └─ about/page.tsx
│  │  ├─ (auth)/
│  │  │  ├─ layout.tsx
│  │  │  ├─ login/page.tsx
│  │  │  └─ register/page.tsx
│  │  ├─ (app)/
│  │  │  ├─ layout.tsx              # guard + app header
│  │  │  ├─ dashboard/page.tsx
│  │  │  └─ projects/
│  │  │     └─ [slug]/
│  │  │        ├─ page.tsx
│  │  │        └─ preview/page.tsx
│  │  ├─ admin/
│  │  │  ├─ layout.tsx              # requireAdmin
│  │  │  ├─ page.tsx                # daftar project
│  │  │  ├─ projects/
│  │  │  │  ├─ new/page.tsx
│  │  │  │  └─ [id]/edit/page.tsx
│  │  │  ├─ categories/page.tsx
│  │  │  └─ technologies/page.tsx
│  │  ├─ error.tsx
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ loading.tsx
│  │  ├─ not-found.tsx
│  │  ├─ robots.ts
│  │  └─ sitemap.ts
│  ├─ components/
│  │  ├─ layout/
│  │  │  ├─ SiteHeader.tsx
│  │  │  ├─ SiteFooter.tsx
│  │  │  ├─ AppHeader.tsx
│  │  │  ├─ AdminNav.tsx
│  │  │  ├─ UserMenu.tsx
│  │  │  └─ SkipLink.tsx
│  │  ├─ ui/
│  │  │  ├─ Alert.tsx
│  │  │  ├─ Badge.tsx
│  │  │  ├─ Button.tsx
│  │  │  ├─ ConfirmDialog.tsx
│  │  │  ├─ EmptyState.tsx
│  │  │  ├─ ErrorState.tsx
│  │  │  ├─ Field.tsx
│  │  │  ├─ Input.tsx
│  │  │  ├─ Pagination.tsx
│  │  │  ├─ Select.tsx
│  │  │  ├─ Skeleton.tsx
│  │  │  ├─ SubmitButton.tsx
│  │  │  └─ Textarea.tsx
│  │  ├─ auth/
│  │  │  ├─ LoginForm.tsx
│  │  │  ├─ RegisterForm.tsx
│  │  │  └─ LogoutButton.tsx
│  │  ├─ projects/
│  │  │  ├─ ProjectCard.tsx
│  │  │  ├─ ProjectFilters.tsx
│  │  │  ├─ ProjectGrid.tsx
│  │  │  ├─ ProjectMeta.tsx
│  │  │  ├─ ScreenshotGallery.tsx
│  │  │  ├─ TechnologyList.tsx
│  │  │  └─ LivePreviewFrame.tsx
│  │  └─ admin/
│  │     ├─ DeleteProjectDialog.tsx
│  │     ├─ ImageUploader.tsx
│  │     ├─ ProjectForm.tsx
│  │     ├─ ProjectTable.tsx
│  │     └─ TaxonomyManager.tsx
│  ├─ lib/
│  │  ├─ auth/
│  │  │  ├─ cookies.ts
│  │  │  ├─ guards.ts
│  │  │  ├─ password.ts
│  │  │  ├─ rate-limit.ts
│  │  │  └─ session.ts
│  │  ├─ security/
│  │  │  ├─ headers.ts
│  │  │  ├─ magic-bytes.ts
│  │  │  ├─ origin.ts
│  │  │  └─ urls.ts
│  │  ├─ storage/
│  │  │  └─ blob.ts
│  │  ├─ validation/
│  │  │  ├─ auth.ts
│  │  │  ├─ project.ts
│  │  │  ├─ search-params.ts
│  │  │  ├─ taxonomy.ts
│  │  │  └─ upload.ts
│  │  ├─ db.ts
│  │  ├─ env.ts
│  │  ├─ format.ts
│  │  ├─ slug.ts
│  │  └─ constants.ts
│  ├─ server/
│  │  ├─ actions/
│  │  │  ├─ auth.ts
│  │  │  ├─ categories.ts
│  │  │  ├─ projects.ts
│  │  │  ├─ technologies.ts
│  │  │  └─ uploads.ts
│  │  └─ queries/
│  │     ├─ admin-projects.ts
│  │     ├─ projects.ts
│  │     └─ taxonomies.ts
│  ├─ styles/
│  │  └─ tokens.css
│  ├─ types/
│  │  ├─ action.ts
│  │  └─ project.ts
│  └─ proxy.ts                      # Next 16: pengganti middleware.ts
├─ tests/
│  └─ unit/
├─ .env.example
├─ eslint.config.mjs
├─ next.config.ts
├─ package.json
├─ prisma7.config.ts
├─ tsconfig.json
└─ vitest.config.mts
```

Catatan:
- Next.js 16 memakai `src/proxy.ts`, bukan `middleware.ts`. Proxy dipakai untuk security headers, nonce CSP, dan redirect optimistis berdasarkan ada/tidaknya cookie session. Proxy bukan lapisan otorisasi.
- Tidak ada `app/api/auth`. Login, register, dan logout adalah Server Actions.
- Semua file yang menyentuh Prisma, env, session, dan storage diberi batas server. Jangan pernah mengimpor modul tersebut dari Client Component.

## 4. Sitemap dan matriks akses

| Route | Publik | USER | ADMIN | Catatan |
|---|---:|---:|---:|---|
| `/` | Ya | Ya | Ya | Landing + 6 project PUBLISHED |
| `/about` | Ya | Ya | Ya | Statis |
| `/login` | Ya | Redirect ke `/dashboard` | Redirect ke `/dashboard` | Login |
| `/register` | Ya | Redirect ke `/dashboard` | Redirect ke `/dashboard` | Register USER |
| `/dashboard` | Tidak | Ya | Ya | Galeri lengkap, hanya PUBLISHED untuk USER |
| `/projects/[slug]` | Tidak | Ya | Ya | USER hanya PUBLISHED; ADMIN boleh draft |
| `/projects/[slug]/preview` | Tidak | Ya | Ya | Hanya URL https yang lolos allowlist |
| `/admin` | Tidak | Tidak | Ya | Daftar project + search |
| `/admin/projects/new` | Tidak | Tidak | Ya | Form tambah |
| `/admin/projects/[id]/edit` | Tidak | Tidak | Ya | Form edit + upload |
| `/admin/categories` | Tidak | Tidak | Ya | CRUD kategori |
| `/admin/technologies` | Tidak | Tidak | Ya | CRUD teknologi |
| `/sitemap.xml`, `/robots.txt` | Ya | Ya | Ya | Hanya route publik |

Perilaku akses:
- Belum login membuka route terproteksi → redirect `/login?next=<path>`.
- USER membuka `/admin` atau action admin → ditolak di server. Halaman diarahkan ke `/dashboard?notice=forbidden`; action mengembalikan error generik tanpa data.
- Publik tidak dapat membuka detail. Kartu preview di landing mengarah ke login.
- Admin dapat memakai dashboard dan detail seperti USER, serta melihat draft.
- Semua halaman terproteksi memanggil guard server sendiri, meskipun layout juga sudah memanggil guard. Guard di-cache per request agar tidak query berulang.

## 5. Keputusan autentikasi: custom opaque session

### Keputusan

Memakai session custom berbasis token opaque, bukan Auth.js.

### Alasan

- Auth.js v5 masih beta (`5.0.0-beta.32` saat dokumen dibuat), sedangkan Auth.js v4 adalah jalur lama. Untuk aplikasi baru Next.js 16, memilih beta atau legacy sama-sama membawa risiko.
- Kebutuhan auth hanya credentials: register, login, logout, role. Tidak ada OAuth, email verification, atau adapter akun.
- Session opaque memberi kontrol penuh atas pesan rate limit, pencabutan session, rotasi token, dan pemeriksaan role terbaru dari database.
- Tidak menambah dependency auth. Implementasi tetap memakai primitif standar: `crypto.randomBytes`, `crypto.createHash`, cookie httpOnly, dan Argon2id.
- Otorisasi tetap query database pada setiap request, sehingga perubahan role langsung berlaku.

### Rancangan

- Tabel `sessions` (tabel operasional tambahan; lihat `database.md`).
- Token: 32 byte acak, dikirim sebagai base64url. Yang disimpan di database hanya SHA-256 hash dari token.
- Cookie produksi: `__Host-kk_session`; development: `kk_session`.
  - `httpOnly: true`
  - `secure: process.env.NODE_ENV === "production"`
  - `sameSite: "lax"`
  - `path: "/"`
  - `maxAge: 7 hari`
- Session memiliki `expiresAt` absolut 7 hari. Tidak ada sliding expiration pada versi pertama.
- Login berhasil:
  1. Hapus session lama bila cookie lama masih valid.
  2. Buat token baru, simpan hash + `userId` + `expiresAt`.
  3. Set cookie baru.
- Logout:
  1. Hapus baris session berdasarkan hash token.
  2. Hapus cookie.
- Setiap request:
  1. Baca cookie.
  2. Hash token.
  3. Query session + user dengan `select` terbatas.
  4. Tolak bila tidak ada, kedaluwarsa, atau user tidak ada.
  5. `cache()` untuk deduplikasi dalam satu render.
- Role tidak disimpan di cookie. Role dibaca dari database pada guard.

### Password

- Argon2id melalui `@node-rs/argon2`.
- Parameter awal: memory `19456` KiB, time cost `2`, parallelism `1`, output 32 byte.
- Validasi Zod: password 8–128 karakter, minimal satu huruf dan satu angka. Konfirmasi password dicocokkan di server.
- Login memakai email **atau** username. Identifier dinormalisasi ke lowercase.
- Bila akun tidak ditemukan, tetap lakukan verifikasi terhadap dummy hash untuk mengurangi timing enumeration.
- Pesan login selalu generik: "Email/username atau password salah." Pesan rate limit: "Terlalu banyak percobaan. Coba lagi nanti."
- Register yang bentrok email/username mengembalikan pesan generik, bukan "email sudah terdaftar".
- Register selalu membuat role `USER`. Admin hanya dari seed.

### CSRF

- Cookie session `SameSite=Lax`.
- Setiap Server Action mutasi (login, register, logout, admin CRUD, upload) memanggil `assertSameOrigin()`:
  - Baca header `Origin`.
  - Bandingkan dengan `APP_URL` dan/atau host request yang tepercaya.
  - Tolak bila `Origin` tidak ada atau berbeda.
- Tidak mengandalkan pengecekan origin bawaan Next.js saja.
- Login dan register juga dilindungi origin check untuk mencegah login CSRF.

### Rate limiting

- Tabel operasional `auth_attempts`, tanpa foreign key.
- Setiap percobaan gagal dicatat dengan `action`, `keyHash`, dan `createdAt`.
- `keyHash` = HMAC-SHA256 dari identifier + IP + action menggunakan `AUTH_SECRET`. IP diambil dari header proxy tepercaya (`x-forwarded-for` / `x-real-ip`) dengan fallback.
- Aturan awal:
  - Login: maksimal 5 kegagalan per identifier+IP dalam 15 menit, dan 20 kegagalan per IP dalam 15 menit.
  - Register: maksimal 5 percobaan per IP dalam 1 jam.
- Pembersihan baris lama dilakukan oportunistik saat pengecekan (hapus data > 24 jam), atau job terpisah di masa depan.
- Bila penyimpanan rate limit error, login/register gagal tertutup dengan pesan generik. Ini mencegah bypass saat database bermasalah, dengan konsekuensi ketersediaan.

## 6. Keputusan storage: Vercel Blob

### Keputusan

Vercel Blob, upload hanya dari server.

### Alasan

- Native untuk Vercel, tidak ada filesystem lokal yang hilang saat deploy.
- Tidak perlu menambah SDK storage lain.
- URL publik stabil, cocok untuk `next/image`.
- Token hanya di server (`BLOB_READ_WRITE_TOKEN`).

### Aturan upload

- Format yang diterima: JPEG, PNG, WebP.
- Validasi berlapis:
  1. `Content-Type` dari file.
  2. Magic bytes: `FF D8 FF` (JPEG), `89 50 4E 47 0D 0A 1A 0A` (PNG), `RIFF....WEBP` (WebP).
  3. Ukuran maksimal 3 MB per file.
  4. Nama file tidak dipakai. Path dibuat ulang: `projects/<uuid>/<uuid>.<ext>`.
- Maksimal 1 thumbnail dan 6 screenshot per project.
- SVG, GIF, HTML, dan file lain ditolak. Tidak ada eksekusi source code unggahan.
- Upload dilakukan satu file per Server Action karena batas body request Vercel. `serverActions.bodySizeLimit` disetel `4mb`.
- Thumbnail dan screenshot disimpan sebagai URL Vercel Blob di database.
- Saat mengganti/menghapus gambar, blob lama dihapus best-effort setelah operasi database berhasil. Kegagalan hapus dicatat dan tidak membatalkan operasi utama.
- `next.config.ts` memakai `images.remotePatterns` hanya untuk host Vercel Blob. Tidak memakai `images.domains`.
- Data seed memakai placeholder raster lokal di `public/seed/`. Itu bukan upload admin dan tidak menggantikan aturan object storage untuk upload produksi.

## 7. Live preview, sandbox, dan CSP

### Validasi URL

- Wajib `https:`.
- Tidak boleh mengandung username/password di URL.
- Port hanya kosong atau 443.
- Hostname harus cocok dengan allowlist `PREVIEW_ALLOWED_HOSTS`.
- Allowlist mendukung exact host dan wildcard suffix, misalnya:
  - `*.vercel.app`
  - `*.netlify.app`
  - `*.github.io`
  - `projects.sekolah.example`
- Default produksi: `*.vercel.app`. Domain lain ditambahkan lewat environment, bukan hardcode.
- URL yang tidak lolos disimpan sebagai error validasi. Jika URL kosong, halaman preview menampilkan "Preview Unavailable".

### iframe

```html
<iframe
  src="{validatedPreviewUrl}"
  title="Live preview {project title}"
  sandbox="allow-scripts allow-forms allow-modals"
  referrerpolicy="no-referrer"
  allowfullscreen
  loading="lazy"
/>
```

- Tidak memakai `allow-same-origin`, `allow-top-navigation`, atau `allow-popups`.
- Tombol "Open in New Tab" dan "Fullscreen" disediakan oleh aplikasi, bukan oleh iframe.
- Link eksternal memakai `rel="noopener noreferrer"`.
- Deteksi gagal embed: `onError` + timeout 8 detik + fallback. Cross-origin iframe yang diblokir `X-Frame-Options`/`frame-ancestors` tidak selalu bisa dideteksi browser; timeout dan tautan eksternal adalah fallback yang jujur.
- Tidak pernah menjalankan source code unggahan di server.

### CSP

CSP dibangun per request di `src/proxy.ts` dengan nonce untuk script. Header produksi:

```text
default-src 'self';
base-uri 'self';
object-src 'none';
frame-ancestors 'none';
form-action 'self';
script-src 'self' 'nonce-<random>' 'strict-dynamic';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://*.public.blob.vercel-storage.com;
font-src 'self';
connect-src 'self';
frame-src <origin allowlist dari PREVIEW_ALLOWED_HOSTS>;
upgrade-insecure-requests;
```

- `frame-src` hanya berisi origin yang lolos allowlist, bukan `https:`.
- `style-src 'unsafe-inline'` diperlukan karena Next.js/`next/image` dapat memakai style inline. Ini bukan izin script.
- Development menambahkan `'unsafe-eval'` dan WebSocket HMR hanya untuk `NODE_ENV !== "production"`.
- `frame-ancestors 'none'` mencegah aplikasi di-embed.
- CSP nonce membuat halaman yang memakai nonce dirender dinamis. Ini diterima karena halaman utama sudah bergantung pada session/cookie.

Header keamanan lain:

```text
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: DENY
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload   # produksi
```

## 8. Model keamanan

| Risiko | Kontrol |
|---|---|
| SQL injection | Prisma query terparameterisasi; tidak ada raw query dari input user |
| XSS | React escaping; tidak ada `dangerouslySetInnerHTML` untuk konten user; URL divalidasi |
| CSRF | SameSite=Lax + origin check pada semua Server Action mutasi |
| Session theft | Cookie httpOnly, Secure di produksi, `__Host-` prefix, token acak 256-bit, hash di database |
| Session fixation | Rotasi token setiap login |
| Brute force | Rate limit login/register berbasis database |
| Account enumeration | Pesan generik, dummy hash verify, register conflict generik |
| IDOR | Setiap query detail/admin memakai guard dan filter role/status |
| Privilege escalation | Role dari database, bukan cookie; action admin memanggil guard sendiri |
| Upload berbahaya | MIME + magic bytes + ukuran + nama digenerate + hanya raster + object storage publik tanpa eksekusi |
| Clickjacking | `frame-ancestors 'none'`, `X-Frame-Options: DENY` |
| Secret leakage | Semua secret hanya server; tidak ada `NEXT_PUBLIC_*` untuk secret; env divalidasi Zod |
| Open redirect | `next` hanya menerima path internal yang diawali `/`, bukan URL absolut |
| Error leakage | Action mengembalikan pesan aman; detail Prisma hanya di log server |
| Enumeration via upload | Tidak relevan; upload hanya admin |

Aturan otorisasi:
- `requireUser()`: session valid + user ada.
- `requireAdmin()`: `requireUser()` + role `ADMIN` dibaca dari database.
- `requireAdminAction()`: versi action yang mengembalikan `{ ok: false }` generik atau melempar error yang ditangani wrapper.
- Setiap page admin memanggil guard; layout admin juga memanggil guard.
- Setiap action admin memanggil guard; tidak ada action yang hanya mengandalkan UI.
- `assertSameOrigin()` dipanggil sebelum mutasi.

## 9. Query, pencarian, dan performa

### Galeri

URL state:

```text
/dashboard?q=<judul atau creator>&category=<slug>&tech=<slug>&page=2
```

- `q` maksimal 100 karakter.
- `category` dan `tech` berupa slug tervalidasi.
- `page` integer 1–10000.
- Page size 9 (grid 3×3 di desktop).
- Query:
  - `status = PUBLISHED` untuk USER.
  - `OR` pada `title contains q` dan creator (`fullName`/`username` contains q).
  - filter `category.slug`.
  - filter `projectTechnologies.some.technology.slug`.
  - `select` hanya field kartu: id, slug, title, summary, thumbnailPath, category, creator, 3 teknologi pertama, dan count teknologi.
  - `orderBy`: `publishedAt desc`, lalu `id desc`.
  - `count` + `findMany` dalam `$transaction`.
- Pagination mempertahankan `q`, `category`, dan `tech` di URL.
- Tidak ada fetch seluruh project ke client.

### Detail

- Query berdasarkan slug + status.
- USER hanya `PUBLISHED`; ADMIN boleh draft.
- `select` lengkap tetapi terbatas: deskripsi, creator, member, gambar, teknologi, link.
- 404 jika tidak ditemukan atau tidak boleh dilihat.

### Admin

- Daftar project: search `q` pada judul/slug/creator, page size 20, `select` kolom tabel.
- Form edit mengambil project + relasi yang dibutuhkan.
- Setelah mutasi: `revalidatePath` pada `/`, `/dashboard`, `/projects/[slug]`, `/admin`, dan halaman terkait.

### Index

Index detail ada di `database.md`. Catatan penting: pencarian memakai `contains` (leading wildcard), sehingga index B-tree pada `title`/`fullName`/`username` tidak selalu dipakai MySQL. Untuk skala katalog kelas (8–12+ project) ini cukup. Jika data tumbuh besar, migrasi ke MySQL FULLTEXT atau search service terpisah. Ini dicatat sebagai risiko, bukan diklaim sebagai index yang selalu efektif.

### Cache

- Halaman publik tetap dinamis karena header/nav membaca session.
- `cache()` dipakai untuk deduplikasi guard dan taxonomy dalam satu request.
- Tidak meng-cache halaman admin.
- Data taxonomy yang sering dipakai boleh di-cache jangka pendek pada fase implementasi, dengan invalidasi saat admin mengubahnya.

## 10. Dependency dan justifikasi

### Runtime

| Paket | Fungsi | Justifikasi |
|---|---|---|
| `next` | Framework | Wajib |
| `react`, `react-dom` | UI runtime | Wajib |
| `@prisma/client` | ORM client | Wajib |
| `@prisma/adapter-mariadb` | Driver adapter MySQL untuk Prisma 7 | Prisma 7 membutuhkan adapter; paket ini membawa driver `mariadb` |
| `zod` | Validasi server | Wajib sesuai spesifikasi |
| `@node-rs/argon2` | Argon2id | Hashing password kuat, prebuilt binary, lebih aman dari bcrypt untuk password baru |
| `@vercel/blob` | Object storage | Upload persisten di Vercel tanpa filesystem lokal |
| `server-only` | Guard import server | Mencegah modul rahasia masuk bundle client; paket kecil dari Vercel |

### Development

| Paket | Fungsi | Justifikasi |
|---|---|---|
| `prisma` | CLI migrasi/generate/seed | Wajib |
| `typescript` | Type checking | Wajib |
| `@types/node`, `@types/react`, `@types/react-dom` | Tipe | Wajib |
| `eslint`, `eslint-config-next` | Lint | Wajib |
| `vitest` | Unit test | Ringan, cepat, cukup untuk validasi/otorisasi |
| `tsx` | Menjalankan seed TypeScript | Seed Prisma |
| `dotenv` | Memuat env untuk Prisma config/seed | Prisma 7 config dan seed di luar runtime Next |

Tidak dipakai:
- Tailwind CSS (spesifikasi meminta CSS Modules).
- Auth.js (dipilih custom session).
- Library rate limit/Redis (memakai MySQL yang sudah ada).
- `file-type` (magic bytes untuk 3 format raster cukup diimplementasikan sendiri).
- `clsx`, date library, UI kit, state manager, form library.
- `sharp` (optimasi gambar ditangani `next/image`; re-encode upload dapat ditambahkan jika risiko gambar meningkat).

## 11. Environment variables

| Nama | Rahasia | Dipakai | Keterangan |
|---|---:|---|---|
| `DATABASE_URL` | Ya | Server | Koneksi MySQL dengan TLS |
| `APP_URL` | Tidak | Server | Origin kanonik, mis. `https://karyakelas.vercel.app` |
| `AUTH_SECRET` | Ya | Server | HMAC rate limit/IP hash; minimal 32 byte acak |
| `BLOB_READ_WRITE_TOKEN` | Ya | Server | Token Vercel Blob |
| `PREVIEW_ALLOWED_HOSTS` | Tidak | Server | Comma-separated host/wildcard untuk CSP dan validasi URL |
| `SEED_ADMIN_NAME` | Ya | Seed | Nama admin pertama |
| `SEED_ADMIN_USERNAME` | Ya | Seed | Username admin |
| `SEED_ADMIN_EMAIL` | Ya | Seed | Email admin |
| `SEED_ADMIN_PASSWORD` | Ya | Seed | Password admin awal |
| `SEED_DEMO_DATA` | Tidak | Seed | `true` untuk 8–12 project demo |

Aturan:
- Tidak ada secret dengan prefix `NEXT_PUBLIC_`.
- `APP_URL` divalidasi harus URL https di produksi.
- `env.ts` memvalidasi env dengan Zod saat server start.
- `.env.example` hanya berisi placeholder, bukan nilai asli.

## 12. Deployment

- Vercel Node.js runtime, bukan Edge, untuk Prisma/Argon2.
- Region function didekatkan dengan region database.
- Build: `prisma generate && next build`.
- `postinstall`: `prisma generate`.
- Migrasi produksi dijalankan terpisah sebelum deploy: `prisma migrate deploy` dengan koneksi langsung.
- Seed admin dijalankan sekali setelah migrasi.
- Vercel Blob store dihubungkan ke project Vercel.
- `PREVIEW_ALLOWED_HOSTS` diisi domain preview yang benar-benar dipakai.
- Jangan menjalankan `prisma db push` di produksi.

## 13. Risiko

1. **Custom auth**: lebih banyak kode keamanan sendiri. Mitigasi: token opaque 256-bit, hash di database, rotasi, cookie ketat, origin check, rate limit, dan unit test otorisasi.
2. **Koneksi MySQL serverless**: Railway MySQL memakai TCP. Mitigasi: Prisma singleton, batas koneksi adapter, Vercel Fluid compute, dan monitoring. Bila connection limit menjadi masalah, pindah ke provider dengan pooling/serverless driver.
3. **Deteksi iframe gagal**: cross-origin tidak selalu memberi error. Mitigasi: timeout 8 detik, tombol reload, tautan eksternal.
4. **CSP nonce dengan Next.js**: perlu diuji di build produksi karena Next menyuntikkan script. Mitigasi: uji `npm run build` + browser, siapkan fallback hash bila diperlukan.
5. **Magic bytes bukan decode penuh**: file bisa memiliki header valid tetapi isi rusak. Mitigasi: hanya raster, batas ukuran, `Content-Type` benar, dan pertimbangkan re-encode dengan `sharp` bila perlu.
6. **Pencarian `contains`**: index B-tree tidak selalu efektif. Untuk skala kelas dapat diterima; FULLTEXT adalah langkah berikutnya.
7. **Blob orphan**: upload yang dibatalkan dapat meninggalkan file. Mitigasi: hapus best-effort, audit berkala.
8. **Gambar Blob publik**: URL dapat diakses jika diketahui. Ini disengaja untuk katalog; jangan unggah data sensitif.
9. **Rate limit tabel**: baris lama perlu dibersihkan. Mitigasi: cleanup oportunistik.
10. **Tidak ada email verification/password reset**: di luar cakupan. Registrasi terbuka dan dibatasi rate limit.
11. **Seed demo**: data demo dan gambar placeholder lokal hanya untuk pengembangan; upload produksi tetap ke Blob.

## 14. Asumsi

- Registrasi terbuka untuk publik dan selalu menghasilkan role `USER`.
- USER hanya melihat project `PUBLISHED`. ADMIN melihat draft.
- Admin juga dapat mengakses dashboard dan detail seperti USER.
- Landing menampilkan 6 project PUBLISHED terbaru; kartu mengarah ke login.
- Filter kategori dan teknologi masing-masing satu pilihan (bukan multi-select).
- Galeri 9 project per halaman; admin 20 per halaman.
- Maksimal 6 screenshot per project, 3 MB per gambar.
- Thumbnail wajib untuk status PUBLISHED, divalidasi di server saat publish.
- Preview allowlist dapat dikonfigurasi lewat environment; default `*.vercel.app`.
- Tidak ada fitur komentar, like, bookmark, leaderboard, notifikasi, atau statistik.
- Browser target: evergreen modern (Chrome, Edge, Firefox, Safari terbaru).
- Seed demo hanya dijalankan di lokal/development; produksi hanya admin + data nyata.

## 15. Rencana fase berikutnya

| Fase | Hasil |
|---|---|
| 2 | Setup Next.js, Prisma schema/migrasi/seed, token desain, layout dasar |
| 3 | Custom session, login/register/logout, guard route |
| 4 | Landing + galeri dengan search/filter/pagination |
| 5 | Detail project + live preview |
| 6 | Admin CRUD + upload Blob |
| 7 | Unit test validasi/otorisasi + checklist manual |
| 8 | `.env.example`, README, migrasi produksi, deploy Vercel |
