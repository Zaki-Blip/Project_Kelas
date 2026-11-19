# Phase 8 — PKL Report Collection, Bug Fixes, and Deployment Notes

Status: implementation and QA complete, awaiting approval before final deployment checks.

## Scope

Phase 8 closes the unfinished work from Phases 6–7 and adds the requested PKL report collection flow.

Included:

- PKL submission model, migration, validation, queries, and Server Actions.
- Student page `/laporan-pkl` for submitting and editing a report.
- Admin page `/admin/laporan-pkl` for searching, reviewing, and deleting reports.
- Demo PKL submissions in the idempotent seed.
- Fix for the admin delete dialog so it is never clipped by table scroll containers.
- Workaround for the Next.js 16 route-level `loading.tsx` streaming bug.
- Root `README.md` with setup, environment, deployment, and testing instructions.
- Phase 8 documentation.
- GitHub Actions CI workflow for migrations, typecheck, lint, tests, and production build.

Not included:

- End-to-end browser tests.
- Real Vercel Blob upload verification.
- Authenticated production verification over HTTPS.
- The first CI run on GitHub. The workflow is committed locally but has not been executed by the provider yet.

## PKL data model

`prisma/schema.prisma` adds:

- `PklStatus`: `SUBMITTED`, `REVIEWED`, `REVISION`.
- `PklSubmission`: one row per user, enforced by `userId @unique`.
- `User.pklSubmission`: optional one-to-one relation with `onDelete: Cascade`.

Fields:

| Field | Notes |
| --- | --- |
| `title` | 5–160 characters. |
| `company` | 2–120 characters. |
| `summary` | 20–2000 characters. |
| `reportUrl` | HTTPS report link, max 2048 characters. |
| `status` | Defaults to `SUBMITTED`. |
| `reviewNote` | Optional, max 1000 characters. |
| `reviewedAt` | Set when the admin reviews. |
| `createdAt`, `updatedAt` | Managed by Prisma. |

Migration: `prisma/migrations/20261112023427_add_pkl_submissions/migration.sql`.

## Validation and security

`src/lib/validation/pkl.ts`:

- `isSafeReportUrl()` rejects non-HTTPS URLs, credentials, custom ports, local hosts, hostnames without a dot, and URLs longer than 2048 characters. An explicit `:443` is accepted because it is the default HTTPS port.
- `pklSubmissionSchema` trims input and validates title, company, summary, and report URL lengths.
- `pklReviewSchema` accepts only `REVIEWED` or `REVISION`, requires a valid submission id, and caps the note at 1000 characters.

`src/server/actions/pkl.ts`:

- `savePklSubmissionAction` requires a logged-in user, checks the origin, validates input, and upserts the user’s submission.
- Editing a `REVIEWED` submission is rejected.
- Editing any other submission resets the status to `SUBMITTED` and clears `reviewNote` and `reviewedAt`.

`src/server/actions/admin-pkl.ts`:

- `reviewPklSubmissionAction` and `deletePklSubmissionAction` call `getAdminSession()` and `assertSameOrigin()` before mutating.
- Both actions validate the submission id and return safe admin paths.

## Pages

- `/laporan-pkl` (protected): shows the current submission, status, admin note, and an edit form. The form is read-only after `REVIEWED`.
- `/admin/laporan-pkl` (admin only): searchable and paginated table with student, report, status, updated date, review form, and delete action.
- Navigation links were added to `SiteHeader` and `AdminNav`.
- `/laporan-pkl` was added to `PROTECTED_PATHS` in `src/proxy.ts`.

## Seed demo data

When `SEED_DEMO_DATA="true"`, the seed creates two PKL submissions:

- `budi` — `SUBMITTED`, no note.
- `sari` — `REVIEWED`, with a review note and review date.

The seed is idempotent. Running it again resets those two demo submissions to the seed state without deleting other data. `npm run db:seed` does not remove user-created submissions.

## Delete dialog fix

The project and PKL delete actions use `ConfirmDeleteButton`.

Problem: the native `<dialog>` was rendered inside the table’s scroll container, so it could be clipped or positioned incorrectly.

Fix:

- The dialog is portaled to `document.body`.
- The trigger has a per-item accessible name, for example `Hapus laporan Budi Santoso`.
- Clicking the backdrop closes the dialog.
- The component uses `useSyncExternalStore` to detect client mount without triggering the `react-hooks/set-state-in-effect` lint rule.
- The dialog contains a real Server Action form, so deletion still works without JavaScript-driven fetch code.

Manual QA confirmed the dialog opens on a real click, is portaled to `BODY`, and closes from the Batal button. The delete action was also tested end-to-end with the expected notice and database deletion, then the seed was restored.

## Next.js 16 loading boundary workaround

Next.js `16.4.6` has a streaming bug on full page loads:

- A route-level `loading.tsx` fallback remains visible.
- The resolved server content is streamed into a hidden `div#S:*`.
- React’s inline reveal does not swap the content in.
- Soft navigations do not reproduce the bug.

`src/components/layout/StreamingBoundaryRecovery.tsx` is mounted in the root layout. It:

1. Waits for a visible loading fallback whose screen-reader label starts with `Memuat`.
2. Detects a hidden streamed segment that already contains content.
3. Calls `router.refresh()` once for the current path.
4. After the refresh, removes orphaned hidden segments outside `#konten` so static IDs such as `#deskripsi-proyek` are not duplicated.

The recovery is limited to `/`, `/about`, `/dashboard`, `/admin`, and `/projects` routes. It is a workaround, not a replacement for an upstream fix. Re-test after upgrading Next.js and remove it only if the bug is confirmed fixed.

Known limitation: the cleanup assumes the route-level boundary is the only streamed boundary on the page. If nested Suspense boundaries are added later, revisit the cleanup before shipping.

## Tests

`tests/unit/validation.test.ts` now covers:

- Safe report URL acceptance and rejection.
- Submission trimming and field-length errors.
- Unsafe report URL rejection.
- Review status and note validation.

Results after the Phase 8 changes:

| Command | Result |
| --- | --- |
| `npm run test` | 8 files, 151 tests, all passed. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |
| `npm run build` | Passed. All application routes are dynamic; `/icon.svg` is static. |

Phase 7 contributed 142 tests. Phase 8 adds 9 PKL validation tests.

## Production smoke test

The production build was started with `npm run start -- -p 3001` and checked over HTTP after the Phase 8 changes.

| Path | Result |
| --- | --- |
| `/` | `200` |
| `/about` | `200` |
| `/login` | `200` |
| `/register` | `200` |
| `/icon.svg` | `200` |
| `/dashboard` | `307` to `/login?next=%2Fdashboard` |
| `/admin` | `307` to `/login?next=%2Fadmin` |
| `/admin/categories` | `307` to `/login?next=%2Fadmin%2Fcategories` |
| `/projects/kasirkita` | `307` to `/login?next=%2Fprojects%2Fkasirkita` |
| `/projects/kasirkita/preview` | `307` to `/login?next=%2Fprojects%2Fkasirkita%2Fpreview` |
| `/does-not-exist` | `404` with a nonce-based CSP |

Security headers observed on `/` and the 404 response:

- `Content-Security-Policy` with a per-request nonce and `strict-dynamic`.
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `Strict-Transport-Security` in the production build.

Authenticated production pages were not tested over plain HTTP because the `__Host-kk_session` cookie is `Secure`. That remains a deployment check over HTTPS.

## Manual QA performed

- Submitted a PKL report as a user and saw it appear on `/admin/laporan-pkl`.
- Marked a report `REVIEWED` with a note; the user page became read-only and displayed the note.
- Changed a report to `REVISION` and saw the admin table update with the notice `Status laporan PKL berhasil diperbarui.`
- Opened the portaled delete dialog, confirmed it was attached to `BODY`, and closed it with Batal.
- Verified the delete action earlier with a real deletion and restored the seed.
- Verified full page loads of `/dashboard`, `/admin`, `/admin/laporan-pkl`, `/projects/kasirkita`, and `/projects/kasirkita/preview` after the streaming recovery:
  - fallback disappears,
  - content is visible,
  - no duplicate IDs,
  - no hidden `div#S:*` segments remain.
- Restored the database to 10 projects and 2 demo PKL submissions after QA.

## Remaining deployment checks

- [ ] Real Vercel Blob upload with a valid `BLOB_READ_WRITE_TOKEN`.
- [ ] Authenticated production check over HTTPS with `__Host-kk_session`.
- [ ] Production preview hostname added to `PREVIEW_ALLOWED_HOSTS` and verified in the iframe CSP.
- [ ] Production migration (`npm run db:deploy`) and seed runbook executed against hosted MySQL.
- [x] CI workflow added at `.github/workflows/ci.yml`; awaiting the first GitHub Actions run.
- [ ] Re-check the streaming recovery after the next Next.js upgrade.

## Files added or changed

Added:

- `prisma/migrations/20261112023427_add_pkl_submissions/migration.sql`
- `src/lib/validation/pkl.ts`
- `src/lib/pkl/queries.ts`
- `src/server/actions/pkl.ts`
- `src/server/actions/admin-pkl.ts`
- `src/components/pkl/PklReportForm.tsx`
- `src/components/pkl/PklReportForm.module.css`
- `src/app/(app)/laporan-pkl/page.tsx`
- `src/app/(app)/admin/laporan-pkl/page.tsx`
- `src/components/admin/PklSubmissionTable.tsx`
- `src/components/admin/PklSubmissionTable.module.css`
- `src/components/layout/StreamingBoundaryRecovery.tsx`
- `README.md`
- `docs/phase-8/README.md`
- `.github/workflows/ci.yml`

Changed:

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/app/layout.tsx`
- `src/components/layout/SiteHeader.tsx`
- `src/components/admin/AdminNav.tsx`
- `src/components/admin/ConfirmDeleteButton.tsx`
- `src/proxy.ts`
- `tests/unit/validation.test.ts`

## Next step

Phase 8 is ready for review. The remaining work is deployment-only: Vercel Blob, HTTPS production auth, preview host allowlist, production migration/seed, and CI. Do not run production migrations until the deployment environment is approved.
