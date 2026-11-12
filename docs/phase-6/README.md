# Phase 6 — Admin CRUD and Object Storage

Status: implementation and QA complete, approved before Phase 7. The Phase 7 test suite is documented in [`../phase-7/README.md`](../phase-7/README.md).

## Scope

Phase 6 adds the protected admin area for managing projects, categories, technologies, and project media.

Included:

- Admin shell at `/admin` with role guard, admin sub-navigation, and `noindex`.
- Project list with search, pagination, status badges, result counts, empty state, and out-of-range page state.
- Project create and edit form with controlled fields, automatic slug generation, creator and member selection, category and technology selection, GitHub and preview URLs, draft/published status, thumbnail, and screenshots.
- Project deletion with a native `<dialog>` confirmation.
- Category and technology CRUD with conflict, not-found, and in-use delete protection.
- Immediate image upload to Vercel Blob, one file per request, with best-effort discard for newly uploaded files that are removed before saving.
- `returnTo` support so create, edit, and delete actions return to the current filtered project list.
- Server-side Zod validation, per-request authorization, origin checks, image MIME/magic-byte/size validation, and allowlisted stored image paths.
- Loading, error, empty, and not-found states for the admin routes.
- Accessible form errors, status notices, tables, dialogs, and touch targets.

Not included:

- User management, bulk actions, drag-and-drop ordering, a rich-text editor, or an audit log.
- A verified real Blob upload in the local environment. `BLOB_READ_WRITE_TOKEN` is present but empty, so uploads return the configured storage error.
- Automated tests. These were added in Phase 7; see [`../phase-7/README.md`](../phase-7/README.md).

## Routes and behavior

| Route | Behavior |
| --- | --- |
| `/admin` | Project list, search, pagination, status, creator, category, updated date, edit and delete actions. |
| `/admin/projects/new` | Create form. Reads a safe `returnTo` query value. |
| `/admin/projects/[id]/edit` | Edit form. Reads a safe `returnTo` query value; unknown or malformed ids render the admin 404. |
| `/admin/categories` | Category list and create/edit/delete controls. |
| `/admin/technologies` | Technology list and create/edit/delete controls. |

### Project list

- Page size is `20` (`ADMIN_PAGE_SIZE`).
- Search uses the `q` query parameter and matches project title, slug, creator full name, and creator username.
- Pagination uses the `page` query parameter.
- Ordering is `updatedAt` descending, then `id` descending.
- The page shows a result summary, a total count, and a mobile hint for the horizontally scrollable table.
- Empty search results show `Project tidak ditemukan.` with a reset action.
- A page beyond the available range shows `Halaman tidak tersedia.` with a link back to the first page.
- The current filters are encoded into `returnTo` for the add, edit, and delete actions.

### Project form

- The form is a client component with controlled fields and a server action submit.
- The slug is generated from the title until the user edits it manually.
- Fields: title, slug, summary, description, category, creator, members, technologies, GitHub URL, preview URL, status, thumbnail, and screenshots.
- Screenshots support captions and a maximum of `6` images.
- `PUBLISHED` requires a thumbnail. Saving as `DRAFT` clears `publishedAt`.
- The first publish sets `publishedAt`; republishing preserves the original publish date.
- Members, screenshots, and technologies are replaced in a single project mutation.
- Category, creator, technology, and member ids are checked against the database before saving.
- Slug conflicts are checked before saving and also handled through Prisma `P2002`.
- GitHub URLs must be valid HTTPS GitHub URLs. Preview URLs must be HTTPS and match the preview allowlist.
- Stored image paths must be bundled seed assets or HTTPS Vercel Blob public URLs.
- Removed or replaced Blob images are deleted best-effort after a successful save. Seed assets are never deleted.

### Taxonomies

- Categories and technologies share the same manager UI.
- A blank slug is generated from the name.
- Names and slugs are unique. Conflicts return a visible notice.
- Deleting a taxonomy that is still used by a project is rejected by the database relation and returns `Data masih digunakan oleh project dan tidak bisa dihapus.`
- The delete control is disabled in the UI when the row is in use.

### Uploads

- Uploads go to Vercel Blob through `uploadImageAction`, one file per request.
- Maximum size is `3 MB`.
- Accepted types are JPEG, PNG, and WebP.
- The declared MIME type must be in the allowlist and must match the type detected from the file's magic bytes.
- Generated object paths use `projects/<uuid>/<uuid>.<extension>` with public access.
- Without `BLOB_READ_WRITE_TOKEN`, the action returns `Penyimpanan gambar belum dikonfigurasi.`
- A failed Blob request returns `Gagal mengunggah gambar. Coba lagi.`
- The client validates type and size before calling the server action, but the server action remains the security boundary.
- Newly uploaded files are discarded best-effort when removed before the form is saved.

### Return paths

`safeAdminReturnPath()` only accepts `/admin` or `/admin/...` paths. It rejects:

- Absolute URLs and protocol-relative paths.
- Backslashes.
- Literal `..` traversal.
- Encoded dots, slashes, backslashes, control bytes, and raw control characters.
- Lookalike prefixes such as `/administer`.

`buildAdminProjectFormHref()` appends `returnTo` only when the current list has filters or a page beyond the first. `ProjectTable` appends the same value to edit links. The form submits it as a hidden field, and the server actions redirect with the appropriate notice.

## Implementation map

| File | Responsibility |
| --- | --- |
| `src/app/(app)/admin/layout.tsx` | Admin role guard, admin navigation shell, and `noindex` metadata. |
| `src/app/(app)/admin/page.tsx` | Project list, search, pagination, counts, empty and out-of-range states. |
| `src/app/(app)/admin/projects/new/page.tsx` | Create page, safe `returnTo`, taxonomy and user options. |
| `src/app/(app)/admin/projects/[id]/edit/page.tsx` | Edit page, id validation, safe `returnTo`, and edit data. |
| `src/app/(app)/admin/categories/page.tsx` | Category manager page. |
| `src/app/(app)/admin/technologies/page.tsx` | Technology manager page. |
| `src/app/(app)/admin/loading.tsx` | Admin table loading skeleton. |
| `src/app/(app)/admin/projects/loading.tsx` | Project form loading skeleton. |
| `src/app/(app)/admin/error.tsx` | Admin error boundary. |
| `src/app/(app)/admin/not-found.tsx` | Admin 404 state. |
| `src/components/admin/ProjectForm.tsx` | Controlled create/edit form and client-side media state. |
| `src/components/admin/ProjectTable.tsx` | Project table, status badges, edit links, and delete trigger. |
| `src/components/admin/ImageUploader.tsx` | Thumbnail and screenshot upload, preview, removal, and discard. |
| `src/components/admin/TaxonomyManager.tsx` | Shared category/technology CRUD UI. |
| `src/components/admin/ConfirmDeleteButton.tsx` | Native dialog confirmation with a server-action form. |
| `src/components/admin/AdminNav.tsx` | Admin sub-navigation with 44 px touch targets. |
| `src/components/admin/AdminNotice.tsx` | Success and error notices from query parameters. |
| `src/components/admin/AdminPagination.tsx` | Filter-preserving pagination links. |
| `src/lib/admin/queries.ts` | Paginated project query, edit data, taxonomy options, and user options. |
| `src/lib/admin/paths.ts` | Safe admin redirects, list hrefs, form hrefs, and notice URLs. |
| `src/lib/admin/notices.ts` | Admin notice messages. |
| `src/lib/admin/constants.ts` | Page size and screenshot limit. |
| `src/lib/validation/admin.ts` | Zod project, taxonomy, id, and search schemas with Indonesian messages. |
| `src/server/actions/admin-projects.ts` | Create, update, delete, relation checks, transactions, Blob cleanup, revalidation, and redirects. |
| `src/server/actions/admin-taxonomies.ts` | Category and technology create, update, and delete actions. |
| `src/server/actions/uploads.ts` | Blob upload and discard actions with authorization, origin, MIME, magic-byte, and size checks. |
| `src/lib/security/images.ts` | Allowed seed paths and Vercel Blob URL validation. |
| `src/lib/security/magic-bytes.ts` | JPEG, PNG, and WebP signature detection. |
| `src/lib/storage/blob.ts` | Best-effort Blob deletion that skips seed assets and tolerates storage failures. |
| `src/app/icon.svg` | KaryaKelas favicon, added to remove the missing-favicon console error. |

## Security and data integrity

- Every admin page calls `requireAdmin()`; the admin layout also guards the segment.
- Every admin mutation calls `getAdminSession()` and `assertSameOrigin()` before changing data.
- All form, search, id, and taxonomy input is validated with Zod on the server.
- Database access uses Prisma query builders; no raw user-input SQL is used.
- User content is rendered as React text. No admin content uses `dangerouslySetInnerHTML`.
- Stored image paths are restricted to bundled seed assets or HTTPS Vercel Blob public URLs. Credentials, custom ports, foreign hosts, and lookalike suffixes are rejected.
- Uploads verify the declared MIME type against detected magic bytes and enforce the size limit.
- Admin pages are marked `noindex, nofollow`.
- Redirects after mutations are restricted to safe admin paths.
- Project relation replacement runs in one Prisma mutation, so a partially updated project is not left behind.
- Uploads are sent to object storage; the application never writes uploaded images to the local filesystem.

## UI and accessibility

- The admin area reuses the app shell and design tokens: 2 px borders, 8 px radius, 4 px offset shadows, Space Grotesk headings, and DM Sans body text.
- Admin navigation links have a minimum 44 px touch target.
- Tables use a labelled scroll region and a visually hidden caption.
- Forms use explicit labels, descriptions, field-level errors, and an error summary.
- Success and error notices use live-region roles.
- The delete confirmation uses a native `<dialog>` with a labelled title and description.
- Loading skeletons expose `aria-busy` and visually hidden loading text.
- Empty, out-of-range, error, and not-found states provide clear next actions.
- Focus, hover, and reduced-motion behavior follows the existing design system.
- The layout remains usable at the available mobile viewport; the table scrolls horizontally instead of forcing page overflow.

## Verification

The following commands pass after the Phase 6 changes:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm audit` reports 0 vulnerabilities.

The production build marks all application routes as dynamic, with `/icon.svg` prerendered as a static asset.

Manual and browser checks covered:

- Admin login and access to `/admin`, `/admin/categories`, and `/admin/technologies`.
- Project list renders the seeded projects with status, category, creator, and updated date.
- Search `q=kasir` returns one project; an unmatched search shows the empty state with a reset action.
- `page=999` shows the out-of-range state and a first-page action.
- Pagination was exercised with 22 temporary projects: page 1 showed 20 rows, page 2 showed 2 rows, and the add/edit links carried `returnTo`.
- Editing a project from page 2 redirected to `/admin?page=2&notice=updated` with the success notice.
- Project create, edit, and delete flows were exercised. The edit test changed the title, status, and screenshots; the changes persisted. The delete test used the native dialog and removed the project.
- Category create, edit, and delete; technology create and delete; duplicate taxonomy conflicts; and disabled in-use delete controls.
- Empty-form validation, `PUBLISHED` without a thumbnail, invalid GitHub and preview URLs, and duplicate slugs all returned the expected Indonesian field messages.
- `USER` opening `/admin` or `/admin/categories` is redirected to `/dashboard?notice=forbidden`.
- `USER` receives the project 404 for the `DRAFT` project. `ADMIN` can open the same project, sees the `Draf` badge, and sees the `Edit Project` link.
- The preview iframe retains `sandbox="allow-scripts allow-forms allow-modals"`, `referrerpolicy="no-referrer"`, `allowfullscreen`, and `loading="lazy"`.
- The preview page exposes the title, `Buka di Tab Baru`, and the Fullscreen control.
- A thumbnail upload without a token returns `Penyimpanan gambar belum dikonfigurasi.`
- A file with an allowed `image/png` MIME type but non-PNG bytes returns the server-side invalid-image error.
- A valid PNG with a dummy token reaches the Blob request and returns `Gagal mengunggah gambar. Coba lagi.` when the store does not exist.
- A temporary security-helper script ran 50 assertions across magic-byte detection, allowed image paths, Blob URL rules, safe admin redirects, preview allowlist matching, and admin href builders. All passed; the script was removed after the run.

Production checks:

- The landing page and latest-project previews render.
- The root 404 page renders without CSP console errors.
- `/admin` redirects to `/login?next=%2Fadmin` over plain HTTP because the production session cookie is `Secure` and only the development cookie was present. Authenticated admin behavior was verified in development mode.

Lighthouse, production build, local server:

| Page | Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- |
| `/` | 85 | 100 | 100 | 100 |
| `/login` | 95 | 100 | 100 | 100 |

Adding `src/app/icon.svg` removed the only remaining Best Practices console error, the missing `/favicon.ico` request.

## Verification notes

- During browser automation, streamed React Suspense content sometimes remained behind the loading boundary because the automation browser throttled `requestAnimationFrame`. The final HTML contained the page content, and invoking React's stream replacement (`$RV`) revealed it. This is an automation-environment artifact; the production pages contain the final content and normal visible browser tabs swap it in automatically.
- Production authentication cannot be exercised over plain HTTP localhost because the production cookie is `__Host-kk_session` with `Secure`. Development mode used `kk_session` for the authenticated admin and role checks.
- Real Blob upload success remains unverified locally because `BLOB_READ_WRITE_TOKEN` is empty. The missing-token, invalid-image, and failed-store paths were verified. A real token is required for end-to-end upload verification on a deployed environment.

## Local state after QA

- `10` projects, `5` categories, `10` technologies, and `5` seed users remain.
- Temporary pagination projects, QA projects, QA taxonomies, test users, sessions, and `auth_attempts` were removed.
- Temporary QA scripts were deleted.
- `.env` was restored to its original empty `BLOB_READ_WRITE_TOKEN`.
- The local seed admin remains `admin` / `AdminKarya123!`. Rotate this password before using a shared or production database.

## Known limitations

- No real Blob token is configured locally, so uploads cannot complete end-to-end in this environment.
- Blob deletion is best-effort. A storage failure is logged and does not roll back a successful project save.
- Admin search uses `contains` matching and is intended for a small class catalog; it is not a full-text search index.
- There is no user management, bulk action, drag-and-drop ordering, or rich-text editing in this phase.
- Automated tests are unit tests in Phase 7; they are not end-to-end browser tests.

## Next step

Phase 6 is approved. The Phase 7 unit test suite and regression checklist are documented in [`../phase-7/README.md`](../phase-7/README.md). Phase 8 can cover deployment configuration and final hardening after approval.
