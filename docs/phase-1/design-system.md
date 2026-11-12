# KaryaKelas — Design System

Arah visual: **Soft Neobrutalism**, terang, minimalis. Border tebal, bayangan offset, warna solid, tanpa gradient.

## 1. Design tokens

Token didefinisikan sebagai CSS variables di `src/styles/tokens.css` dan diimpor oleh `src/app/globals.css`.

```css
:root {
  --color-bg: #faf7f0;
  --color-ink: #111111;
  --color-blue: #2f5bff;
  --color-yellow: #ffd83d;
  --color-surface: #ffffff;
  --color-muted: #5a5a5a;
  --color-border: #111111;
  --color-danger: #b42318;
  --color-danger-bg: #fff1f0;
  --color-success: #067647;
  --color-success-bg: #ecfdf3;
  --color-focus: #111111;
  --color-overlay: rgb(17 17 17 / 45%);
  --color-skeleton: #ece6d8;

  --border-width: 2px;
  --border: var(--border-width) solid var(--color-border);
  --radius-sm: 6px;
  --radius: 8px;
  --radius-lg: 12px;

  --shadow: 4px 4px 0 var(--color-ink);
  --shadow-hover: 2px 2px 0 var(--color-ink);

  --font-heading: var(--font-space-grotesk), sans-serif;
  --font-body: var(--font-dm-sans), sans-serif;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;

  --container: 1200px;
  --gutter: 16px;

  --transition: 120ms ease-out;
  --focus-ring: 3px solid var(--color-focus);
  --focus-offset: 3px;
}
```

Kontras yang sudah dihitung:
- `#2F5BFF` dengan putih: 5.17:1
- `#2F5BFF` dengan `#FAF7F0`: 4.83:1
- `#111111` dengan `#FFD83D`: 13.62:1
- `#111111` dengan `#FAF7F0`: 17.65:1
- `#5A5A5A` dengan `#FAF7F0`: 6.45:1
- `#B42318` dengan `#FAF7F0`: 6.14:1

Focus ring memakai ink `3px` dengan offset `3px`. Ink cukup kontras terhadap background dan tombol biru (≥3:1 untuk elemen non-teks).

## 2. Tipografi

Font dimuat dengan `next/font/google`, self-hosted oleh Next.js:
- Heading: **Space Grotesk** (600/700)
- Body: **DM Sans** (400/500/700)

Skala:

| Token | Ukuran desktop | Ukuran mobile | Line-height | Pemakaian |
|---|---:|---:|---:|---|
| Display | 56px | 36px | 1.05 | Hero landing |
| H1 | 40px | 30px | 1.1 | Judul halaman |
| H2 | 32px | 24px | 1.15 | Section |
| H3 | 24px | 20px | 1.2 | Card besar |
| H4 | 18px | 18px | 1.3 | Subsection |
| Body | 16px | 16px | 1.6 | Teks umum |
| Small | 14px | 14px | 1.5 | Meta, helper |
| Caption | 12px | 12px | 1.4 | Badge, label kecil |

Aturan:
- Maksimal lebar baca deskripsi 68ch.
- Heading memakai `text-wrap: balance`; paragraf `text-wrap: pretty`.
- Tidak memakai font weight di bawah 400.
- Tidak memakai huruf kapital semua untuk paragraf.

## 3. Layout dan grid

- Container maksimal `1200px`, gutter 16px mobile / 24px tablet / 32px desktop.
- Grid project: 1 kolom `<640px`, 2 kolom `640–1023px`, 3 kolom `≥1024px`.
- Target uji: 360px, 768px, 1280px.
- Jarak antar kartu 24px desktop, 16px mobile.
- Section vertical rhythm: 64px mobile, 96px desktop.
- Header tinggi minimal 64px; sticky hanya jika tidak mengganggu fokus.

Breakpoint:

```css
@media (min-width: 640px) { /* tablet */ }
@media (min-width: 1024px) { /* desktop */ }
```

## 4. Komponen inti

### Button

- Tinggi minimal 44px; 48px untuk aksi utama.
- Border 2px, radius 8px, shadow 4px.
- Hover: shadow menjadi 2px dan elemen bergeser 2px ke kanan-bawah.
- Focus-visible: outline ink 3px, offset 3px.
- Disabled: opacity 60%, cursor not-allowed, shadow tetap.
- Loading: spinner CSS + teks "Menyimpan…", tombol disabled, `aria-busy`.
- Varian:
  - Primary: biru, teks putih.
  - Secondary: kuning, teks ink.
  - Outline: surface, teks ink.
  - Ghost: transparan, border transparan.
  - Danger: surface, border danger, teks danger; hover isi danger + teks putih.

### Input, Select, Textarea

- Border 2px ink, radius 8px, background surface, tinggi 48px.
- Label selalu terlihat, bukan placeholder-only.
- Helper text dan error text memakai `aria-describedby`.
- Error: border danger + ikon teks (bukan warna saja) + pesan.
- Focus: outline ink.
- Textarea minimal 6 baris, resize vertical.
- Select memakai native `<select>` agar aksesibel dan ringan.

### Card project

- Background surface, border 2px, radius 8px, shadow 4px.
- Thumbnail rasio 16:10, `object-fit: cover`.
- Area teks naratif maksimal 3 baris: judul 1 baris + ringkasan maksimal 2 baris.
- Baris meta berisi creator, maksimal 2 teknologi + `+N`, dan kontrol "Lihat Detail" berupa tautan dengan label aksesibel. Baris meta adalah kontrol, bukan body copy.
- Hover: shadow 2px, kartu bergeser 2px.
- Seluruh kartu dapat diklik, tetapi tautan utama tetap fokusabel dan memiliki focus ring.
- Thumbnail memakai `next/image` dengan `sizes` sesuai grid.

### Badge

- Kategori: background kuning, teks ink, border 2px.
- Teknologi: background surface, teks ink, border 2px.
- Status admin: `DRAFT` kuning, `PUBLISHED` biru dengan teks putih.
- Badge selalu berisi teks; status tidak dibedakan hanya dengan warna.

### Table admin

- Border 2px, header background kuning, teks ink.
- Baris memiliki border bawah 2px.
- Kolom aksi memakai tombol teks yang fokusabel.
- Di mobile, tabel dibungkus horizontal scroll dengan `tabindex="0"` dan label aksesibel.
- Tidak memakai statistik atau chart.

### Alert

- Error: border danger, background `--color-danger-bg`, teks danger/ink.
- Success: border success, background `--color-success-bg`.
- Info: border ink, background surface.
- Alert error form mendapat `role="alert"`; hasil pencarian memakai `aria-live="polite"`.

### Dialog konfirmasi

- Native `<dialog>` atau komponen setara yang mengelola focus trap.
- Overlay `--color-overlay`.
- Fokus awal pada tombol batal, bukan tombol hapus.
- Escape menutup dialog.
- Tombol hapus danger dan menyebut nama project.

### Pagination

- Link Previous/Next + nomor halaman.
- Halaman aktif memakai `aria-current="page"`, background kuning.
- Menjaga `q`, `category`, dan `tech` di URL.
- Disabled state tetap terlihat dan tidak bisa difokus.

### Skeleton dan loading

- Skeleton statis berbentuk blok, bukan gradient dan bukan animasi berulang.
- Skeleton memiliki `aria-hidden="true"`; teks "Memuat data…" disediakan untuk screen reader.
- Tombol submit memakai spinner CSS dan `aria-busy`.

## 5. State wajib

Setiap halaman dan komponen data memiliki:
- **Loading**: skeleton atau indikator teks.
- **Empty**: pesan jelas + aksi reset/tambah.
- **Error**: pesan aman + tombol "Coba lagi".
- **Success**: alert atau perubahan data yang terlihat.
- **Disabled**: alasan terlihat bila perlu.
- **Focus**: outline ink 3px.
- **Hover**: hanya shadow/posisi/warna, ≤150ms.

Contoh empty state:
- Galeri tanpa hasil: "Tidak ada project yang cocok. Coba kata kunci lain atau reset filter." + tombol Reset.
- Admin tanpa project: "Belum ada project." + tombol "Tambah Project".
- Preview tanpa URL: "Preview Unavailable" + tautan eksternal bila ada.
- 404: "Halaman tidak ditemukan." + tautan ke dashboard/beranda.
- 403/forbidden: redirect ke dashboard dengan notice, atau halaman pesan tanpa data admin.

## 6. Motion

- Hanya transisi hover/focus dan perubahan state kecil.
- Durasi 120ms, maksimal 150ms.
- Properti yang ditransisikan: `box-shadow`, `transform`, `background-color`, `border-color`, `color`, `opacity`.
- `prefers-reduced-motion: reduce` mematikan transform dan transisi.
- Tidak ada animasi masuk, parallax, marquee, atau gradient bergerak.

## 7. Aksesibilitas

- Bahasa dokumen `lang="id"`.
- Skip link "Lewati ke konten utama".
- Satu `<h1>` per halaman; heading berurutan.
- Semua input memiliki `<label>`.
- Error form: ringkasan error di atas form + fokus ke ringkasan atau field pertama yang error.
- Fokus terlihat di semua elemen interaktif.
- Target sentuh minimal 44×44px.
- Kontras teks ≥4.5:1; elemen non-teks ≥3:1.
- Status tidak hanya warna: teks `DRAFT`/`PUBLISHED`, ikon teks, atau label.
- Gambar memiliki alt yang bermakna; thumbnail dekoratif memakai alt kosong bila judul sudah menjelaskan.
- iframe memiliki `title`.
- Tabel memakai `<caption>`/`scope`.
- Dialog mengembalikan fokus ke pemicu.
- `aria-live="polite"` untuk jumlah hasil pencarian.
- `aria-busy` saat submit.
- Tidak menangkap fokus pengguna tanpa alasan.

## 8. Responsif

### 360px
- Navbar: logo + tombol menu; menu membuka daftar tautan vertikal.
- Hero satu kolom, heading 36px.
- Grid 1 kolom.
- Filter bertumpuk vertikal; tombol Terapkan selebar penuh.
- Detail satu kolom; meta di bawah judul.
- Admin table horizontal scroll; form satu kolom.
- Preview iframe selebar layar, tombol aksi bertumpuk.

### 768px
- Navbar horizontal jika muat; jika tidak, tetap menu.
- Grid 2 kolom.
- Filter 2 kolom + tombol.
- Detail dapat memakai dua kolom untuk thumbnail dan ringkasan.
- Admin form dua kolom untuk field pendek.

### 1280px
- Grid 3 kolom.
- Container 1200px.
- Detail dua kolom: visual + informasi, lalu deskripsi/screenshot full width.
- Admin sidebar/top nav horizontal, tabel penuh.
- Preview memakai tinggi viewport yang nyaman.

## 9. Bahasa dan konten

- UI berbahasa Indonesia.
- Nada ringkas, jelas, tidak hiperbola.
- Tidak memakai emoji dekoratif.
- Tombol memakai kata kerja: "Simpan", "Terbitkan", "Hapus", "Masuk", "Daftar".
- Pesan error tidak membocorkan detail teknis atau keberadaan akun.
- Nama project, deskripsi, caption, dan nama pengguna dirender sebagai teks React, bukan HTML.

## 10. Larangan

- Tidak ada Tailwind.
- Tidak ada gradient.
- Tidak ada dark theme.
- Tidak ada library UI, icon set besar, atau animation library.
- Tidak ada `dangerouslySetInnerHTML` untuk konten user.
- Tidak ada gambar SVG unggahan.
- Tidak ada teks placeholder sebagai satu-satunya label.
- Tidak ada statistik, chart, leaderboard, atau elemen sosial.
