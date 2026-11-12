# Phase 4 — Landing Showcase and Gallery

Status: implementation complete, awaiting approval before Phase 5.

## Scope

Phase 4 turns the protected dashboard placeholder into a working gallery and adds the latest published projects to the public landing page.

Included:

- Six latest `PUBLISHED` projects on `/`.
- Public landing cards that send visitors to login with the project detail as the safe `next` path.
- Authenticated landing cards that link directly to the future project detail route.
- Gallery at `/dashboard` for `USER` and `ADMIN`.
- Search by project title or creator name.
- Category and technology filters.
- Paginated gallery results with nine projects per page.
- Shared project card, grid, filter form, pagination, loading skeleton, and empty states.
- Public and dashboard error boundaries for the new data-fetching paths.

Not included:

- Project detail pages.
- Sandboxed live preview.
- Admin CRUD.
- Comments, likes, bookmarks, leaderboards, notifications, and statistics.

## Routes and access

| Route | Access | Behavior |
| --- | --- | --- |
| `/` | Public | Shows the six latest `PUBLISHED` projects. Logged-out cards link to `/login?next=/projects/<slug>`. Logged-in cards link to `/projects/<slug>`. |
| `/dashboard` | `USER`, `ADMIN` | Shows the gallery, filters, result count, empty state, and pagination. Unauthenticated users are redirected by the existing guard. |

`/dashboard` remains protected by `requireUser()`. A `USER` who opens `/admin` is still redirected to `/dashboard?notice=forbidden` and sees the existing forbidden notice above the gallery.

## Gallery query parameters

| Parameter | Validation | Behavior |
| --- | --- | --- |
| `q` | Trimmed string, maximum 100 characters. | Matches project title, creator full name, or creator username. Case-insensitive through the MySQL collation. Invalid or overlong values are ignored. |
| `category` | Lowercase slug matching `^[a-z0-9]+(?:-[a-z0-9]+)*$`, maximum 80 characters. | Filter is applied only when the slug exists in the category taxonomy. Invalid or unknown slugs are ignored. |
| `tech` | Same slug rules as `category`. | Filter is applied only when the slug exists in the technology taxonomy. Invalid or unknown slugs are ignored. |
| `page` | Integer from 1 to 10,000. | Invalid values fall back to page 1. Values above the last page show the out-of-range empty state. |

Filters combine with AND. For example, `?category=game&tech=nextjs` returns only projects that are both in the game category and use Next.js.

Empty values produced by the native GET form, such as `?q=kasir&category=&tech=`, are harmless and are ignored by validation.

## Query behavior

- Only `PUBLISHED` projects are returned.
- Ordering is `publishedAt DESC, id DESC`.
- The landing query takes six rows.
- The gallery query runs `count()` and `findMany()` in one Prisma transaction.
- The gallery uses `skip` and `take` with a page size of nine.
- The selected columns are limited to card data: id, slug, title, summary, thumbnail path, category name/slug, creator full name/username, two technology names/slugs, and the technology count.
- No descriptions, member rows, image rows, or unrelated relations are loaded for cards.
- All database access uses Prisma parameterized queries. No raw user-input SQL is used.
- Category and technology taxonomies are loaded with a small cached per-request query and used both for the filter controls and for validating filter slugs.

## Pagination

- Page size: `9`.
- Total pages: `max(1, ceil(total / 9))`.
- Pagination is hidden when there is only one page.
- The pagination control keeps `q`, `category`, and `tech` in every link.
- Page 1 links omit the `page` parameter.
- Long page ranges use a window with ellipses: first page, neighboring pages, and last page.
- An out-of-range page shows a dedicated empty state with a link back to page 1 instead of a broken result grid.

## Implementation map

| File | Responsibility |
| --- | --- |
| `src/app/layout.tsx` | Adds `data-scroll-behavior="smooth"` so Next.js 16 keeps instant scroll reset during route transitions while the global CSS retains smooth in-page scrolling. |
| `src/app/(public)/page.tsx` | Landing hero plus the `Suspense`-wrapped latest projects section. |
| `src/app/(public)/home.module.css` | Landing latest-section layout, card spacing, and reduced-motion handling. |
| `src/app/(app)/dashboard/page.tsx` | Gallery page, filter parsing, taxonomy validation, result text, empty states, and pagination. |
| `src/app/(app)/dashboard/dashboard.module.css` | Gallery header, count badge, filter/results spacing, and empty state. |
| `src/app/(app)/dashboard/loading.tsx` | Dashboard loading skeleton. |
| `src/app/(app)/dashboard/dashboard-loading.module.css` | Skeleton layout at mobile, tablet, and desktop widths. |
| `src/app/(app)/dashboard/error.tsx` | Dashboard error boundary. |
| `src/app/(public)/error.tsx` | Public error boundary for landing data failures. |
| `src/lib/projects/constants.ts` | Landing limit `6` and gallery page size `9`. |
| `src/lib/projects/queries.ts` | Landing, gallery, and taxonomy Prisma queries. |
| `src/lib/projects/types.ts` | `ProjectCardData`, `GalleryFilters`, and `ProjectTaxonomy` types. |
| `src/lib/projects/urls.ts` | Project hrefs, login-with-next hrefs, and gallery URL builders. |
| `src/lib/projects/pagination.ts` | Pagination window calculation with ellipses. |
| `src/lib/validation/projects.ts` | Zod parsing for gallery GET parameters. |
| `src/components/projects/ProjectCard.tsx` | Shared project card. |
| `src/components/projects/ProjectCard.module.css` | Card thumbnail, category badge, typography, technology badges, and action row. |
| `src/components/projects/ProjectGrid.tsx` | Shared 1/2/3-column grid and public/authenticated link behavior. |
| `src/components/projects/ProjectGrid.module.css` | Grid and card skeleton styles. |
| `src/components/projects/ProjectGridSkeleton.tsx` | Shared card-grid loading skeleton. |
| `src/components/projects/GalleryFilters.tsx` | Native GET search and filter form. |
| `src/components/projects/GalleryFilters.module.css` | Responsive filter layout and control styling. |
| `src/components/projects/GalleryPagination.tsx` | Previous/next controls, page links, current page, and disabled states. |
| `src/components/projects/GalleryPagination.module.css` | Pagination layout and focus states. |

## UI and accessibility

- The project card follows the Phase 1 design system: 2 px border, 8 px radius, 4 px offset shadow, 16:10 thumbnail, Space Grotesk title, DM Sans body text, and a yellow category badge.
- Cards show the title, a two-line summary, creator name, up to two technologies, an extra-technology count, and the detail action.
- The card image is decorative (`alt=""`) because the card link already exposes the project title and metadata. Images use explicit `640 × 400` dimensions and a responsive `sizes` attribute.
- The first gallery card image is above the fold and uses `loading="eager"` with `fetchPriority="high"`. Landing cards remain lazy because the latest section is below the fold.
- The grid is one column below 640 px, two columns from 640 px, and three columns from 1024 px.
- The filter form has a visible label for every control, a hint for the search field, `role="search"`, and an accessible name.
- The result count uses `aria-live="polite"`.
- The gallery adds a visually hidden `h2` before the card grid so heading order stays `h1 → h2 → h3`.
- The pagination nav has an accessible name; the current page uses `aria-current="page"`; disabled previous/next controls use `aria-disabled="true"`.
- Loading states expose `aria-busy` and hidden loading text while marking skeleton visuals as decorative.
- Empty states explain the condition and offer a reset or return action.
- Hover movement on the latest-projects link is disabled under `prefers-reduced-motion: reduce`.

## Verification

The following checks pass:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm audit` reports 0 vulnerabilities.

Manual and HTTP-level checks covered:

- Landing shows exactly six latest `PUBLISHED` projects.
- The draft project does not appear on the landing or in the gallery.
- Logged-out landing cards link to `/login?next=%2Fprojects%2F<slug>`.
- Logged-in landing cards link to `/projects/<slug>` and the latest heading links to `/dashboard`.
- `q=kasir` returns KasirKita.
- `q=budi` returns three projects by Budi Santoso.
- `q=KASIR` returns the same result as lowercase `q=kasir`.
- `category=game` returns MathQuest.
- `tech=nextjs` returns four projects.
- `category=game&tech=nextjs` returns zero projects and the filtered empty state.
- An unknown category slug is ignored and the full gallery is shown.
- A `q` value longer than 100 characters is ignored.
- `page=abc` falls back to page 1.
- `page=2` with only nine published projects shows the out-of-range empty state and a link back to page 1.
- A temporary tenth published project produced two pages: nine cards on page 1, one card on page 2, and working previous/next/page links. The temporary project was deleted after verification; the database is back to nine published projects.
- The native GET form submits and preserves the search value.
- `USER` and `ADMIN` can open `/dashboard`; unauthenticated access is redirected by the existing guard.

Visual QA used Chrome headless at 360, 768, and 1280 px:

- No horizontal overflow on the landing or gallery.
- Project grid columns: `328px` at 360, `348px 348px` at 768, and `384px 384px 384px` at 1280.
- Filter form columns: one column at 360/768 and two tracks (fields plus actions) at 1280.
- Cards remain 328 px wide at 360, 348 px at 768, and 384 px at 1280.
- The category badge was moved from the thumbnail into the card body after visual QA found that it covered the seeded thumbnail artwork.
- The gallery count badge was moved next to the page title after visual QA found it detached at wide widths.
- Lighthouse reports Accessibility 100, Best Practices 100, and SEO 100 on the landing and dashboard.

## Known limitations

- `/projects/<slug>` is a Phase 5 route. Logged-in card links currently resolve to the 404 page until Phase 5 adds project detail and live preview.
- Public card links intentionally go to login first, with the future detail route as the safe `next` path.
- The native GET filter form may include empty `q`, `category`, and `tech` parameters in the address bar. They are ignored by validation and by generated pagination links.
- Search uses Prisma `contains` over title, creator full name, and username. It is appropriate for the current data size but is not a full-text search implementation.
- The automated test suite is planned for Phase 7. Phase 4 was verified manually, with browser automation, and with Lighthouse.
- Local role testing still has the `USER` account `siti_rahma` / `siti.rahma@example.test`. Remove it before using a shared or production database.
