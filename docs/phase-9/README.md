# Phase 9 — Class Profile and Student Photo Gallery

Status: implementation and browser QA complete; deployment-only checks remain.

## Scope

Phase 9 adds a login-protected class profile page with a class hero, a student photo gallery, social overlays, an accessible profile modal, and admin CRUD for the class and student profiles.

Included:

- Singleton class profile model and student profile model.
- Migration for `class_profiles` and `student_profiles`.
- Public page `/profil-kelas`.
- Hover and keyboard-focus social overlay on student cards.
- Click/tap profile modal with photo, name, role, bio, and social links.
- Admin dashboard `/admin/profil-kelas`.
- Student create/edit pages under `/admin/profil-kelas/siswa/`.
- Student delete confirmation.
- Profile photo uploads through the existing Vercel Blob pipeline with the `profiles` scope.
- Demo class profile and six demo students in the seed.
- Tests for profile validation, social URLs, and seed profile image paths.

Not included:

- End-to-end browser tests.
- Real Vercel Blob upload verification with a valid token.
- Authenticated production verification over HTTPS.
- The first GitHub Actions run.

## Data model

`prisma/schema.prisma` adds:

### `ClassProfile`

A singleton row enforced by `id Int @id @default(1)`. The application reads and upserts `id = 1`.

| Field | Notes |
| --- | --- |
| `className` | Required, 2–80 characters. |
| `tagline` | Optional, max 120 characters. |
| `description` | Optional, max 1000 characters. Paragraphs are split on blank lines. |
| `photoPath` | Optional seed path or Vercel Blob URL. |

### `StudentProfile`

| Field | Notes |
| --- | --- |
| `name` | Required, 2–80 characters. |
| `role` | Optional, max 80 characters. |
| `bio` | Optional, max 500 characters. |
| `photoPath` | Required seed path or Vercel Blob URL. |
| `socialLinks` | Optional newline-separated HTTPS URLs, max 5. Platform labels are detected from the hostname when rendering. |
| `sortOrder` | Integer 0–999. Smaller values appear first. |
| `isVisible` | Defaults to `true`. Hidden profiles stay in the database but are excluded from the public page. |

Migrations: `prisma/migrations/20261115102023_add_class_and_student_profiles/migration.sql` and `prisma/migrations/20261119090000_student_profile_social_links/migration.sql`. The latter copies the old fixed student links into `social_links`, drops the old columns, and removes the obsolete `class_profile_social_links` table.

## Validation and security

`src/lib/social.ts`:

- Student social links accept any HTTPS host, but reject credentials, custom ports, local hosts, and hostnames without a dot.
- `getExternalSocialUrl()` returns a normalized URL or `null`, so stored values are rechecked before rendering.
- `splitSocialUrlLines()` and `normalizeSocialUrlLines()` handle one-URL-per-line input, trimming blanks and deduplicating normalized URLs.
- `getSocialLinksFromText()` prepares render data and detects common platforms (TikTok, Instagram, GitHub, LinkedIn, YouTube, Facebook, X, Threads, Telegram, Discord, GitLab, Behance, Dribbble, Medium). Unknown hosts fall back to the hostname and a generic icon.

`src/lib/validation/profiles.ts`:

- `classProfileFormSchema` validates class name, tagline, description, and optional photo. Class profiles have no social links.
- `studentProfileFormSchema` validates the student id, name, role, bio, required photo, newline-separated social links, sort order, and visibility.
- Student social links are capped at 5, and every non-empty line must be a safe external HTTPS URL.
- Photos must match the existing image allowlist: bundled seed assets under `/seed/thumbnails`, `/seed/screenshots`, or `/seed/profiles`, or HTTPS Vercel Blob URLs.

`src/server/actions/admin-profiles.ts`:

- `saveClassProfileAction` and `saveStudentProfileAction` require an admin session and `assertSameOrigin()`.
- Saves are validated with Zod before any database write.
- Student edits verify that the target exists.
- Deleting a student requires an admin session, a valid id, and same-origin.
- Replaced profile photos are deleted from Blob on a best-effort basis.

## Public page

`src/app/(app)/profil-kelas/page.tsx`:

- Calls `requireUser("/profil-kelas")`.
- Loads the class profile and visible students in parallel.
- Revalidates image paths and prepares student social link items before rendering.
- Shows a fallback initial when the class photo is missing.
- Shows an empty state when no student profiles are visible.
- Shows an admin-only link to `/admin/profil-kelas`.

`src/components/profiles/StudentGallery.tsx`:

- Renders student cards in a responsive grid.
- The photo is a real button labelled `Lihat profil <name>`.
- Hovering or focusing the card reveals the student's social overlay.
- Clicking or tapping the photo opens a native `<dialog>`.
- The dialog closes from the close button, Escape, or a backdrop click.
- Focus returns to the originating photo button after close.
- Social links open in a new tab with `rel="noopener noreferrer"`.

## Admin pages

- `/admin/profil-kelas` — class form, student table, notices, and create link.
- `/admin/profil-kelas/siswa/new` — create a student profile.
- `/admin/profil-kelas/siswa/[id]/edit` — edit an existing student profile.

The admin table shows the student photo, role, social link count, sort order, visibility status, edit link, and a per-student delete button.

Admin notices:

- `Profil kelas berhasil disimpan.`
- `Profil siswa berhasil ditambahkan.`
- `Perubahan profil siswa berhasil disimpan.`
- `Profil siswa berhasil dihapus.`

## Uploads

`src/server/actions/uploads.ts` now accepts `scope: "profiles"` in addition to `projects`. Profile uploads are stored under `profiles/<uuid>/<uuid>.<ext>` in Vercel Blob.

`ProfilePhotoUploader` in `src/components/admin/ImageUploader.tsx` uses the profile scope and is shared by the class form and student form. The uploader still validates MIME type, magic bytes, extension, and the 3 MB limit.

## Seed data

When `SEED_DEMO_DATA="true"`, `prisma/seed.ts` creates:

- One class profile for `XII RPL 1` without social links.
- Six students: Budi Santoso, Sari Dewi, Raka Pratama, Nabila Putri, Fajar Nugroho, and Alya Rahma, each with newline-separated demo social URLs.
- Placeholder PNG photos in `public/seed/profiles/`.

The seed is idempotent. Running it again restores the demo class and student data without deleting unrelated records.

## Navigation and access

- `SiteHeader` links to `/profil-kelas`.
- `AdminNav` links to `/admin/profil-kelas`.
- `/profil-kelas` was added to `PROTECTED_PATHS` in `src/proxy.ts`.
- The admin routes use `requireAdmin()`.

## QA performed

- Opened `/profil-kelas` as an admin: class hero, six student cards, and admin link rendered. No class social links were shown.
- Hovered a student card: the student's social overlay appeared.
- Focused a student photo button with the keyboard and pressed Tab: focus moved to the first social link and the overlay stayed visible.
- Clicked a student photo: the modal opened with the correct photo, name, role, bio, and social URLs.
- Added a LinkedIn URL to Budi's social links, saved, and confirmed it appeared on `/profil-kelas` and in the modal; removed it afterward to restore the original three links.
- Closed the modal with the close button and Escape: focus returned to the originating photo button.
- Saved a class tagline change: notice `Profil kelas berhasil disimpan.` appeared and the public page reflected the change. Reverted the tagline afterward.
- Created a QA student using a seeded photo and valid social links: notice `Profil siswa berhasil ditambahkan.` appeared.
- Edited the QA student's role and visibility: notice `Perubahan profil siswa berhasil disimpan.` appeared.
- Deleted the QA student: notice `Profil siswa berhasil dihapus.` appeared. The public page returned to six students and no QA data remained.
- Verified production auth redirects for `/profil-kelas`, `/admin/profil-kelas`, and `/admin/profil-kelas/siswa/new`; each returned `307` to `/login` with the correct `next` parameter.

During QA, the desktop modal photo used `aspect-ratio: 1` while also being sized by the grid row, which made it overflow its column and cover the start of the text. The desktop rule now sets `width: 100%`, `height: 100%`, `min-height: 0`, and `aspect-ratio: auto`. The build was rebuilt and the modal was rechecked.

## Tests

Results after the Phase 9 changes:

| Command | Result |
| --- | --- |
| `npm run test` | 13 files, 193 tests, all passed. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |
| `npm run build` | Passed. All application routes are dynamic; `/icon.svg` is static. |

Phase 9 adds coverage for:

- Class profile validation and trimming without social links.
- Optional class fields and unsafe photo rejection.
- Student profile validation, required photo, lengths, sort order, and visibility.
- Newline-separated social link normalization, trimming, and deduplication.
- Arbitrary HTTPS social hosts, platform detection, and the 5-link cap.
- Unsafe social URL rejection, including credentials, custom ports, and local hosts.
- Seed profile image allowlist paths.

## Remaining deployment checks

- [ ] Real Vercel Blob upload with a valid `BLOB_READ_WRITE_TOKEN`.
- [ ] Authenticated production check over HTTPS with `__Host-kk_session`.
- [ ] Production preview hostname added to `PREVIEW_ALLOWED_HOSTS` and verified in the iframe CSP.
- [ ] Production migration (`npm run db:deploy`) and seed runbook executed against hosted MySQL.
- [ ] First GitHub Actions run.
- [ ] Re-check the streaming recovery after the next Next.js upgrade.

## Files added or changed

Added:

- `prisma/migrations/20261115102023_add_class_and_student_profiles/migration.sql`
- `prisma/migrations/20261118143000_class_profile_social_links/migration.sql`
- `prisma/migrations/20261119090000_student_profile_social_links/migration.sql`
- `public/seed/profiles/*.png`
- `src/lib/social.ts`
- `src/lib/validation/profiles.ts`
- `src/lib/profiles/types.ts`
- `src/lib/profiles/queries.ts`
- `src/server/actions/admin-profiles.ts`
- `src/components/admin/ClassProfileForm.tsx`
- `src/components/admin/StudentProfileForm.tsx`
- `src/components/admin/StudentProfileTable.tsx`
- `src/components/admin/StudentProfileTable.module.css`
- `src/components/admin/ProfileForm.module.css`
- `src/components/profiles/SocialLinks.tsx`
- `src/components/profiles/SocialLinks.module.css`
- `src/components/profiles/StudentGallery.tsx`
- `src/components/profiles/StudentGallery.module.css`
- `src/app/(app)/profil-kelas/page.tsx`
- `src/app/(app)/profil-kelas/profil-kelas.module.css`
- `src/app/(app)/admin/profil-kelas/page.tsx`
- `src/app/(app)/admin/profil-kelas/siswa/new/page.tsx`
- `src/app/(app)/admin/profil-kelas/siswa/[id]/edit/page.tsx`
- `docs/phase-9/README.md`

Changed:

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/lib/admin/notices.ts`
- `src/lib/security/images.ts`
- `src/server/actions/uploads.ts`
- `src/components/admin/ImageUploader.tsx`
- `src/components/admin/ImageUploader.module.css`
- `src/app/(app)/admin/admin.module.css`
- `src/components/admin/AdminNav.tsx`
- `src/components/layout/SiteHeader.tsx`
- `src/proxy.ts`
- `tests/unit/security.test.ts`
- `tests/unit/validation.test.ts`
- `README.md`

## Next step

Phase 9 is ready for review. Remaining work is deployment-only: real Blob uploads, HTTPS production auth, preview host allowlist, production migration/seed, and the first CI run.
