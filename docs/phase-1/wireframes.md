# KaryaKelas — Wireframe Teks

Wireframe ini menjelaskan struktur, hierarki, dan state. Bukan spesifikasi pixel-perfect. Desain visual mengikuti `design-system.md`.

## 0. Shell global

### Public shell
```text
[Skip link]
[Logo KaryaKelas] [Home] [About]                    [Masuk] [Daftar]
──────────────────────────────────────────────────────────────────
<main id="konten">
...
</main>
──────────────────────────────────────────────────────────────────
[Logo] KaryaKelas — katalog karya siswa
[Tentang] [Galeri] [Masuk]
© 2026 KaryaKelas
```

- Bila sudah login, tautan kanan berubah menjadi `Dashboard`, `Admin` (hanya ADMIN), dan menu pengguna dengan `Keluar`.
- Mobile: logo + tombol menu. Menu berupa disclosure vertikal dengan tautan dan tombol auth.
- Fokus keyboard terlihat. Skip link menjadi elemen pertama.

### App shell (USER/ADMIN)
```text
[Logo KaryaKelas] [Galeri] [Admin?]                [Nama user] [Keluar]
──────────────────────────────────────────────────────────────────────
<main id="konten">
...
</main>
```

### Admin shell
```text
[Logo KaryaKelas] [Dashboard] [Projects] [Categories] [Technologies] [Lihat Situs] [Keluar]
──────────────────────────────────────────────────────────────────────────────────────────
<main id="konten">
...
</main>
```

- Admin nav terpisah dari dashboard user.
- Di mobile, nav admin menjadi menu vertikal.
- `Keluar` adalah form POST dengan loading state.

## 1. Landing `/`

Tujuan: menjelaskan platform, menunjukkan 3–6 karya PUBLISHED, mengarahkan pengunjung ke login/register.

### Desktop 1280px
```text
[Public shell]

┌──────────────────────────────────────────────────────────────┐
│ KATALOG KARYA KELAS                                          │
│ Karya nyata,                                      [ilustrasi] │
│ dari kelas kami.                                             │
│ Satu tempat untuk melihat, mencari, dan mencoba project      │
│ hasil karya siswa.                                           │
│ [Masuk ke Galeri] [Lihat Karya]                              │
└──────────────────────────────────────────────────────────────┘

Karya terbaru                                      [Lihat semua →]
┌────────────┐ ┌────────────┐ ┌────────────┐
│ thumbnail  │ │ thumbnail  │ │ thumbnail  │
│ Judul      │ │ Judul      │ │ Judul      │
│ Ringkasan  │ │ Ringkasan  │ │ Ringkasan  │
│ Creator    │ │ Creator    │ │ Creator    │
└────────────┘ └────────────┘ └────────────┘
┌────────────┐ ┌────────────┐ ┌────────────┐
│ ...        │ │ ...        │ │ ...        │
└────────────┘ └────────────┘ └────────────┘
Kartu mengarah ke login. Tidak ada detail publik.

Mengapa KaryaKelas?
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Karya terkurasi│ │ Pencarian cepat│ │ Live preview │
│ ...          │ │ ...          │ │ ...          │
└──────────────┘ └──────────────┘ └──────────────┘

[CTA] Siap melihat karya kelas? [Masuk] [Daftar]
[Footer]
```

### Mobile 360px
```text
[Logo] [Menu]
────────────────
KATALOG KARYA KELAS
Karya nyata,
dari kelas kami.
Deskripsi singkat.
[Masuk ke Galeri]
[Lihat Karya]
────────────────
Karya terbaru
[card]
[card]
[card]
...
────────────────
Mengapa KaryaKelas?
[3 kartu vertikal]
────────────────
[CTA]
[Footer]
```

Data:
- 6 project `PUBLISHED` terbaru, `select` terbatas.
- Bila kurang dari 6, tampilkan sebanyak yang ada.
- Bila kosong: "Belum ada karya yang dipublikasikan."

State:
- Loading: skeleton 6 kartu.
- Error: alert + "Coba lagi".
- Public tidak melihat tombol detail; klik kartu ke `/login?next=/projects/<slug>`.

## 2. About `/about`

```text
[Public shell]
H1 Tentang KaryaKelas
Paragraf misi: katalog karya siswa yang mudah dicari dan dicoba.

[Section] Apa yang bisa dilakukan?
- Melihat karya dalam grid yang rapi.
- Mencari berdasarkan judul atau creator.
- Memfilter kategori dan teknologi.
- Membuka detail dan live preview setelah masuk.

[Section] Bagaimana cara masuk?
1. Daftar akun.
2. Masuk ke galeri.
3. Cari karya, buka detail, coba live preview.

[Section] Untuk pengelola
Admin dapat menambah project, mengatur creator/anggota, mengunggah gambar,
dan mengatur status DRAFT/PUBLISHED.

[CTA] [Masuk] [Daftar]
[Footer]
```

- Statis, tanpa data sensitif.
- Mobile satu kolom.
- Tidak ada statistik.

## 3. Login `/login`

```text
[Auth shell: logo kecil di tengah]

┌──────────────────────────────────────┐
│ Masuk                                │
│ Gunakan akun yang sudah terdaftar.   │
│                                      │
│ [Alert error / notice, jika ada]     │
│ Email atau username                  │
│ [________________________________]   │
│ Password                             │
│ [________________________________]   │
│ [Masuk]                              │
│                                      │
│ Belum punya akun? [Daftar]           │
└──────────────────────────────────────┘
```

- Field: identifier (email/username), password.
- `next` disimpan sebagai hidden field; hanya path internal yang diterima.
- Submit: loading "Memeriksa…", tombol disabled.
- Error generik: "Email/username atau password salah."
- Rate limit: "Terlalu banyak percobaan. Coba lagi nanti."
- Sukses: redirect ke `next` yang valid atau `/dashboard`.
- Bila sudah login: redirect `/dashboard`.
- Mobile: card selebar layar dengan margin 16px.

## 4. Register `/register`

```text
[Auth shell]

┌──────────────────────────────────────┐
│ Daftar                               │
│ Buat akun untuk membuka galeri.      │
│                                      │
│ [Alert error, jika ada]              │
│ Nama lengkap                         │
│ [________________________________]   │
│ Username                             │
│ [________________________________]   │
│ Email                                │
│ [________________________________]   │
│ Password                             │
│ [________________________________]   │
│ Minimal 8 karakter, ada huruf & angka│
│ Konfirmasi password                  │
│ [________________________________]   │
│ [Daftar]                             │
│                                      │
│ Sudah punya akun? [Masuk]            │
└──────────────────────────────────────┘
```

- Validasi server: nama, username, email, password, konfirmasi.
- Error bentrok email/username memakai pesan generik.
- Submit loading "Membuat akun…".
- Sukses: redirect `/login?registered=1` dengan notice "Akun berhasil dibuat. Silakan masuk."
- Rate limit register per IP.
- Bila sudah login: redirect `/dashboard`.
- Mobile: satu kolom, field penuh.

## 5. Dashboard / Galeri `/dashboard`

```text
[App shell]
H1 Galeri Karya                          [12 project]
Deskripsi singkat.

┌─────────────────────────────────────────────────────────────┐
│ [Cari judul atau creator...] [Kategori ▾] [Teknologi ▾]    │
│ [Terapkan] [Reset]                                         │
└─────────────────────────────────────────────────────────────┘

Menampilkan 1–9 dari 12 project
┌────────────┐ ┌────────────┐ ┌────────────┐
│ thumbnail  │ │ thumbnail  │ │ thumbnail  │
│ Judul      │ │ Judul      │ │ Judul      │
│ Ringkasan  │ │ Ringkasan  │ │ Ringkasan  │
│ Creator    │ │ Creator    │ │ Creator    │
│ Tech +N    │ │ Tech +N    │ │ Tech +N    │
└────────────┘ └────────────┘ └────────────┘
┌────────────┐ ┌────────────┐ ┌────────────┐
│ ...        │ │ ...        │ │ ...        │
└────────────┘ └────────────┘ └────────────┘

[← Sebelumnya] [1] [2] [3] [Berikutnya →]
```

- Search form `GET /dashboard`; parameter `q`, `category`, `tech`, `page`.
- Select kategori dan teknologi diisi dari database.
- Tombol Terapkan mengirim form; Reset menghapus semua filter.
- Jumlah hasil memakai `aria-live="polite"`.
- Kartu: thumbnail 16:10, judul 1 baris, ringkasan maksimal 2 baris, meta creator + 2 teknologi + `+N`, tautan "Lihat Detail".
- Link kartu: `/projects/<slug>`.
- Pagination 9 per halaman dan mempertahankan filter.
- Bila page melebihi total halaman: empty state dengan tautan ke halaman pertama.

State:
- Loading: 9 skeleton kartu.
- Empty: "Tidak ada project yang cocok." + Reset.
- Error: alert + Coba lagi.
- Session kedaluwarsa: redirect login dengan notice.

Responsive:
- 360px: filter vertikal, grid 1 kolom.
- 768px: filter 2 kolom, grid 2 kolom.
- 1280px: filter satu baris, grid 3 kolom.

## 6. Detail Project `/projects/[slug]`

```text
[App shell]
[← Kembali ke Galeri]

┌──────────────────────────┐  Kategori
│ Thumbnail 16:10          │  H1 Judul Project
│                          │  Ringkasan singkat
└──────────────────────────┘  Creator: Nama (@username)
                              Teknologi: [Next.js] [MySQL] [Zod]
                              [Live Preview] [GitHub]
                              [Edit Project] (ADMIN saja)

Deskripsi
Paragraf lengkap project. Teks dirender sebagai teks biasa.

Anggota Tim
- Nama Anggota (@username)
- Nama Anggota (@username)

Screenshot
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ gambar       │ │ gambar       │ │ gambar       │
│ caption      │ │ caption      │ │ caption      │
└──────────────┘ └──────────────┘ └──────────────┘

[← Kembali ke Galeri]
```

- USER hanya melihat project `PUBLISHED`.
- ADMIN dapat melihat draft dan melihat tombol Edit.
- Creator adalah pemilik project; anggota tim ditampilkan terpisah.
- Bila tidak ada anggota: "Tidak ada anggota tim tambahan."
- Bila tidak ada screenshot: section disembunyikan atau empty state kecil.
- GitHub URL hanya ditampilkan bila valid.
- Live Preview hanya aktif bila URL https valid dan lolos allowlist.
- Bila preview tidak tersedia: tombol disabled dengan keterangan "Preview Unavailable".
- Deskripsi panjang tetap aman karena React escaping.
- Mobile: satu kolom, meta di bawah judul, screenshot satu kolom.

## 7. Live Preview `/projects/[slug]/preview`

```text
┌──────────────────────────────────────────────────────────────┐
│ [← Detail] Judul Project        [Buka di Tab Baru] [Fullscreen]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │                 iframe live preview                    │  │
│  │                 sandbox ketat                          │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- iframe memenuhi area konten, minimal tinggi 70vh di desktop.
- `sandbox="allow-scripts allow-forms allow-modals"`, `referrerpolicy="no-referrer"`, `allowfullscreen`.
- Tombol "Buka di Tab Baru" memakai `target="_blank"` + `rel="noopener noreferrer"`.
- Tombol Fullscreen memanggil Fullscreen API pada wrapper.
- Loading: overlay "Memuat preview…" sampai iframe `onLoad` atau timeout.
- Gagal/timeout/URL kosong:
```text
┌────────────────────────────────────────────┐
│ Preview Unavailable                        │
│ Project ini tidak dapat ditampilkan di     │
│ dalam halaman.                             │
│ [Buka di Tab Baru] (bila URL tersedia)     │
└────────────────────────────────────────────┘
```
- CSP `frame-src` hanya mengizinkan origin yang lolos allowlist.
- Mobile: tombol bertumpuk, iframe selebar layar.
- Tidak pernah menjalankan source code unggahan di server.

## 8. Admin — Daftar Project `/admin`

```text
[Admin shell]
H1 Kelola Project                         [Tambah Project]
[Cari judul, slug, atau creator...] [Cari]

┌────────────────────────────────────────────────────────────────────┐
│ Judul            Status     Kategori   Creator     Diperbarui  Aksi│
├────────────────────────────────────────────────────────────────────┤
│ Aplikasi Kasir   PUBLISHED  Web App    Budi        10 Nov 2026  [Edit][Hapus]│
│ Game Edukasi     DRAFT      Game       Sari        09 Nov 2026  [Edit][Hapus]│
└────────────────────────────────────────────────────────────────────┘

[← Sebelumnya] [1] [2] [Berikutnya →]
```

- Search `q` lewat URL, query database.
- Page size 20.
- Tombol Hapus membuka dialog konfirmasi yang menyebut judul project.
- Hapus: loading, lalu baris hilang dan daftar di-refresh.
- Tidak ada statistik.
- Mobile: tabel horizontal scroll; kolom aksi tetap terlihat.
- Empty: "Belum ada project." + Tambah.
- Loading: skeleton baris tabel.
- Error: alert + Coba lagi.

## 9. Admin — Form Project `/admin/projects/new` dan `/admin/projects/[id]/edit`

```text
[Admin shell]
[← Kembali ke Kelola Project]
H1 Tambah Project / Edit Project

┌─ Informasi ────────────────────────────────────────────────┐
│ Judul [________________________________________]            │
│ Slug  [________________________________________] (otomatis) │
│ Ringkasan [____________________________________]            │
│ Deskripsi [____________________________________]            │
│           [____________________________________]            │
│ Kategori [Pilih ▾]                                         │
│ Teknologi [ ] Next.js  [ ] Laravel  [ ] MySQL  ...         │
└────────────────────────────────────────────────────────────┘

┌─ Media ────────────────────────────────────────────────────┐
│ Thumbnail (16:10, wajib untuk PUBLISHED)                   │
│ [Pilih file] [preview] [Hapus]                             │
│ Format JPEG/PNG/WebP, maks 3 MB.                           │
│                                                            │
│ Screenshot (maks 6)                                        │
│ [Pilih file] [upload]                                      │
│ ┌──────────┐ caption [__________] urutan [1] [Hapus]       │
│ ┌──────────┐ caption [__________] urutan [2] [Hapus]       │
└────────────────────────────────────────────────────────────┘

┌─ Tim ──────────────────────────────────────────────────────┐
│ Creator [Pilih user ▾]                                     │
│ Anggota [ ] Budi  [ ] Sari  [ ] Raka  ...                  │
└────────────────────────────────────────────────────────────┘

┌─ Tautan ───────────────────────────────────────────────────┐
│ GitHub URL  [https://github.com/...]                       │
│ Preview URL [https://...]                                  │
│ Hanya https dan domain yang diizinkan.                     │
└────────────────────────────────────────────────────────────┘

┌─ Status ───────────────────────────────────────────────────┐
│ ( ) DRAFT   ( ) PUBLISHED                                  │
│ PUBLISHED membutuhkan thumbnail.                           │
└────────────────────────────────────────────────────────────┘

[Sticky action bar]
[Batal]                                  [Simpan Draft] [Simpan]
```

- Field pendek dua kolom di desktop, satu kolom di mobile.
- Slug otomatis dari judul; admin dapat mengubah. Server memastikan unik.
- Upload satu file per request; file divalidasi di server.
- Screenshot memiliki caption opsional dan urutan.
- Creator dan anggota berasal dari user yang ada. Creator tidak ditampilkan sebagai pilihan anggota.
- Preview URL menampilkan hint allowlist. Bila tidak valid, error di field.
- Status PUBLISHED tanpa thumbnail ditolak di server, bukan hanya UI.
- Error ringkasan di atas form + error per field.
- Tombol submit loading dan disabled.
- Bila upload berhasil tetapi form batal, blob dapat menjadi orphan; cleanup best-effort.
- Mobile: action bar tetap di bawah, tombol penuh lebar.

## 10. Admin — Kategori `/admin/categories`

```text
[Admin shell]
H1 Kategori
[Tambah kategori: ________________] [Tambah]

┌──────────────────────────────────────────────────────┐
│ Nama             Slug             Project   Aksi      │
├──────────────────────────────────────────────────────┤
│ Web App          web-app          5         [Edit][Hapus]│
│ Game             game             2         [Edit][Hapus]│
└──────────────────────────────────────────────────────┘
```

- Kategori yang masih dipakai tidak bisa dihapus; tampilkan pesan "Kategori masih digunakan oleh project."
- Edit memakai form inline atau dialog.
- Nama dan slug unik.
- Empty: "Belum ada kategori." + form tambah.
- Loading/error state.
- Mobile: tabel scroll atau daftar kartu.

## 11. Admin — Teknologi `/admin/technologies`

Struktur sama dengan kategori:
```text
H1 Teknologi
[Tambah teknologi: ________________] [Tambah]
Tabel: Nama | Slug | Jumlah project | Aksi
```

- Teknologi yang masih dipakai tidak bisa dihapus.
- Empty/loading/error.
- Tidak ada statistik.

## 12. State global

### Loading
- Landing/galeri: skeleton kartu.
- Detail: skeleton judul, meta, paragraf, screenshot.
- Preview: overlay "Memuat preview…".
- Admin table: skeleton baris.
- Form: tombol submit spinner + `aria-busy`.

### Empty
- Tidak ada project publik: "Belum ada karya yang dipublikasikan."
- Galeri tanpa hasil: "Tidak ada project yang cocok." + Reset.
- Admin tanpa data: CTA tambah.
- Detail tanpa screenshot/anggota: section kosong yang ringkas.

### Error
- Halaman: `error.tsx` dengan pesan aman + "Coba lagi".
- Form: alert error + field errors.
- Upload: "Gambar tidak valid. Gunakan JPEG, PNG, atau WebP maksimal 3 MB."
- Preview: "Preview Unavailable" + tautan eksternal.

### 404
```text
H1 Halaman tidak ditemukan
Project atau halaman yang kamu cari tidak tersedia.
[Ke Dashboard] [Ke Beranda]
```

### Forbidden
- USER membuka `/admin`: redirect `/dashboard?notice=forbidden`.
- Notice: "Kamu tidak memiliki akses ke halaman admin."
- Action admin dari USER: error generik, tidak ada data yang dikembalikan.

### Session kedaluwarsa
- Redirect `/login?next=<path>` dengan notice "Sesi berakhir. Silakan masuk lagi."

## 13. Ringkasan responsif

| Area | 360px | 768px | 1280px |
|---|---|---|---|
| Navbar publik | logo + menu | horizontal/menu | horizontal |
| Hero | 1 kolom | 1 kolom | 2 kolom |
| Grid project | 1 | 2 | 3 |
| Filter | vertikal | 2 kolom | 1 baris |
| Detail | 1 kolom | 2 kolom | 2 kolom |
| Screenshot | 1 kolom | 2 kolom | 3 kolom |
| Admin table | scroll | scroll | penuh |
| Form admin | 1 kolom | 2 kolom | 2 kolom |
| Preview actions | vertikal | horizontal | horizontal |

## 14. Peta interaksi utama

```text
Landing → Login → Dashboard → Detail → Live Preview
Landing → Register → Login → Dashboard
Dashboard → Search/Filter → URL berubah → query database → hasil
Dashboard → Pagination → URL berubah → query database
Admin → Tambah/Edit → Upload → Simpan → revalidate → daftar berubah
Admin → Hapus → Dialog konfirmasi → action → revalidate
User biasa → /admin → redirect dashboard (server)
User biasa → action admin → ditolak (server)
```
