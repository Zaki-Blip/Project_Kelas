# Phase 5 — Project Detail and Live Preview

Status: implementation complete, awaiting approval before Phase 6.

## Scope

Phase 5 adds the protected project detail page and the sandboxed live preview page.

Included:

- Project detail at `/projects/[slug]` for `USER` and `ADMIN`.
- Role-aware visibility: `USER` sees only `PUBLISHED` projects; `ADMIN` may also see `DRAFT`.
- Detail content: thumbnail, category, title, summary, creator, technologies, publication date, description, members, screenshots, GitHub link, and preview action.
- Admin-only `Edit Project` action on the detail page.
- Live preview at `/projects/[slug]/preview` with a sandboxed iframe, loading overlay, eight-second timeout, fallback state, new-tab action, and Fullscreen API action.
- Preview URL validation with an environment-configurable host allowlist.
- GitHub URL validation before rendering the GitHub action.
- Per-request CSP with a script nonce and a `frame-src` allowlist.
- Route-level loading, error, and not-found states for the new routes.

Not included:

- Admin create/edit forms and image upload.
- Automated tests.
- Comments, likes, bookmarks, leaderboards, notifications, and statistics.

## Routes and access

| Route | Access | Behavior |
| --- | --- | --- |
| `/projects/[slug]` | `USER`, `ADMIN` | Unauthenticated users are redirected to `/login?next=<path>`. `USER` sees `PUBLISHED` only. `ADMIN` also sees `DRAFT`. Missing or unavailable projects render the project 404 page. |
| `/projects/[slug]/preview` | `USER`, `ADMIN` | Same visibility rules as detail. If the stored preview URL is empty or fails validation, the page renders `Preview Unavailable` and no iframe. |

Both routes call `requireUser()` on the server. The proxy redirect is only an optimistic cookie-presence check; it is not the authorization layer.

The detail page uses the role from the database session. It does not trust a role from the cookie.

## Detail query behavior

- `getProjectDetail(slug, role)` uses `prisma.project.findFirst()` with `slug` and, for non-admin viewers, `status: PUBLISHED`.
- The query selects only detail fields: id, slug, title, summary, description, thumbnail path, status, GitHub URL, preview URL, publication date, category name/slug, creator name/username, member names/usernames, screenshots, and technology names/slugs.
- Members are ordered by membership creation time.
- Screenshots are ordered by `sortOrder`, then id.
- Technologies are ordered by name.
- The query is wrapped in React `cache()` so metadata and page rendering can reuse the same result within one request.
- Missing projects and drafts requested by a `USER` both call `notFound()`. The page does not reveal whether a draft exists.
- All database access uses Prisma parameterized queries. No raw user-input SQL is used.

## Preview URL validation

Preview URLs must pass all of the following:

- `https:` only.
- Maximum length of 2048 characters.
- No username or password in the URL.
- No non-default port. `443` is accepted and normalized by the URL parser.
- Hostname must match an entry in `PREVIEW_ALLOWED_HOSTS`.
- Exact hosts match exactly.
- Wildcard entries such as `*.vercel.app` require a subdomain; the bare `vercel.app` host does not match.
- Trailing-dot hostnames are rejected.
- Invalid allowlist entries are ignored.
- If no valid allowlist entries remain, `frame-src` becomes `'none'` and preview URLs fail validation.

Default allowlist: `*.vercel.app`.

GitHub URLs must use `https:`, contain no credentials or non-default port, and use `github.com` or `www.github.com`. Invalid GitHub URLs are not rendered.

## iframe and fallback behavior

The preview iframe uses:

```html
<iframe
  sandbox="allow-scripts allow-forms allow-modals"
  referrerpolicy="no-referrer"
  allowfullscreen
  loading="lazy"
/>
```

It does not use `allow-same-origin`, `allow-top-navigation`, or `allow-popups`.

- The loading overlay stays visible until the iframe fires `load` or the eight-second timeout expires.
- On timeout or error, the iframe is removed and the `Preview Unavailable` fallback is shown.
- The fallback and the page header expose `Buka di Tab Baru` only for a validated URL.
- External links use `target="_blank"` and `rel="noopener noreferrer"`.
- The Fullscreen button requests fullscreen on the preview wrapper. Browser rejection is handled without breaking the page.
- Uploaded source code is never executed on the server. The preview only embeds a validated external URL.

## CSP and security headers

CSP is generated per request in `src/proxy.ts`.

Production policy:

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
frame-src <validated PREVIEW_ALLOWED_HOSTS origins>;
upgrade-insecure-requests;
```

Development adds `'unsafe-eval'` to `script-src` and `ws: wss:` to `connect-src` for React debugging and HMR. `upgrade-insecure-requests` is production-only.

- The nonce is generated with `crypto.randomUUID()`, base64-encoded, and sent in both the request and response `Content-Security-Policy` headers so Next.js can attach it to framework and page scripts.
- `frame-src` contains only allowlisted preview origins, never `https:`.
- `frame-ancestors 'none'` and `X-Frame-Options: DENY` prevent KaryaKelas from being embedded.
- The proxy matcher skips static assets, the seed assets, API routes, and router prefetches.
- The root `not-found.tsx` calls `connection()` so unknown routes are dynamically rendered and receive a valid CSP nonce. Without this, the production static 404 page was served with a nonce header but scripts without nonce attributes, and the CSP blocked them.

The existing `next.config.ts` headers remain active: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, and production HSTS.

## Implementation map

| File | Responsibility |
| --- | --- |
| `src/app/(app)/projects/[slug]/page.tsx` | Protected detail page, role-aware query, metadata, actions, description, members, and screenshots. |
| `src/app/(app)/projects/[slug]/project-detail.module.css` | Detail layout, metadata list, action row, screenshot grid, empty states, and loading skeleton. |
| `src/app/(app)/projects/[slug]/loading.tsx` | Detail loading skeleton. |
| `src/app/(app)/projects/[slug]/error.tsx` | Detail/preview error boundary. |
| `src/app/(app)/projects/[slug]/not-found.tsx` | Project 404 state with gallery and home actions. |
| `src/app/(app)/projects/[slug]/preview/page.tsx` | Protected preview page, URL validation, metadata, header actions, and unavailable state. |
| `src/app/(app)/projects/[slug]/preview/preview.module.css` | Preview top bar, actions, hint, unavailable state, and loading skeleton. |
| `src/app/(app)/projects/[slug]/preview/loading.tsx` | Preview loading skeleton. |
| `src/components/projects/LivePreviewFrame.tsx` | Sandboxed iframe, loading overlay, timeout, and fallback. |
| `src/components/projects/LivePreviewFrame.module.css` | Frame wrapper, overlay, spinner, fallback, and fullscreen styles. |
| `src/components/projects/FullscreenButton.tsx` | Fullscreen API control with state synchronization. |
| `src/lib/projects/queries.ts` | `getProjectDetail()` query and detail mapper. |
| `src/lib/projects/types.ts` | `ProjectDetailData` type. |
| `src/lib/projects/urls.ts` | Project detail and preview href builders. |
| `src/lib/validation/projects.ts` | Project slug validation and parsing. |
| `src/lib/preview/allowlist.ts` | Allowlist parsing, exact/wildcard matching, and CSP origin generation. |
| `src/lib/security/urls.ts` | Preview URL and GitHub URL validation. |
| `src/proxy.ts` | Protected path redirects, per-request CSP nonce, and `frame-src` allowlist. |
| `src/app/not-found.tsx` | Dynamic root 404 so CSP nonces are applied. |

## UI and accessibility

- Detail hero is one column below 900 px and two columns from 900 px.
- Screenshots use one column on mobile, two from 768 px, and three from 1100 px.
- The thumbnail and screenshots keep the 16:10 ratio.
- Detail headings follow `h1 → h2`; metadata uses a description list.
- Description text is rendered as plain React text with `white-space: pre-line`. No user content uses `dangerouslySetInnerHTML`.
- Empty member and screenshot states are explicit.
- The unavailable preview action is a disabled button with a visible explanation.
- The preview page has a labelled back link, page heading, new-tab action, Fullscreen button, iframe title, loading status, and alert fallback.
- Loading skeletons expose `aria-busy` and visually hidden loading text.
- The project 404 and error states provide clear return actions.
- Hover and fullscreen styles respect the existing focus and reduced-motion conventions.

## Verification

The following checks pass:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm audit --omit=dev` reports 0 vulnerabilities.

Manual, HTTP, and browser checks covered:

- Unauthenticated `/projects/kasirkita` returns `307` to `/login?next=%2Fprojects%2Fkasirkita`.
- Unauthenticated `/projects/kasirkita/preview` returns `307` to `/login?next=%2Fprojects%2Fkasirkita%2Fpreview`.
- `USER` can open published detail and preview pages.
- `USER` receives the project 404 for the `DRAFT` project.
- `ADMIN` can open the `DRAFT` project, sees the `Draf` badge, and sees the `Edit Project` link.
- Unknown and malformed slugs render the project 404 page.
- Detail renders title, summary, creator, technologies, publication date, description paragraphs, members, screenshots, Live Preview, and GitHub.
- `SenyumSehat` has no preview URL: detail shows the disabled `Preview Unavailable` action and hint; preview page renders no iframe.
- iframe attributes were inspected in the browser: `sandbox="allow-scripts allow-forms allow-modals"`, `referrerpolicy="no-referrer"`, `allowfullscreen`, `loading="lazy"`.
- New-tab links use `rel="noopener noreferrer"`.
- A temporary missing `*.vercel.app` preview URL produced the eight-second timeout fallback, removed the iframe, and kept the wrapper at its minimum height. The original preview URL was restored after the test.
- Preview URL validation accepts `https://kasirkita.vercel.app`, `https://kasirkita.vercel.app:443`, and `https://foo.bar.vercel.app/path?q=1`.
- Preview URL validation rejects `http:`, the bare `vercel.app` host, credentials, non-default ports, and host-spoofing suffixes.
- GitHub URL validation accepts `https://github.com/...` and rejects non-HTTPS, non-GitHub, spoofed, and non-default-port URLs.
- Wildcard allowlist matching accepts subdomains, rejects the bare suffix, and rejects lookalike suffixes such as `evil.vercel.app.attacker.test`.

CSP checks:

- Development response includes a nonce, `'strict-dynamic'`, `'unsafe-eval'`, WebSocket connect sources, and `frame-src https://*.vercel.app`.
- Production response includes a nonce, `'strict-dynamic'`, no `'unsafe-eval'`, no WebSocket sources, `frame-src https://*.vercel.app`, and `upgrade-insecure-requests`.
- Production scripts receive the nonce automatically.
- Production landing page loads without CSP console errors.
- Production unknown route (`/does-not-exist`) loads without CSP console errors after the root 404 was forced dynamic.

Lighthouse reports Accessibility 100, Best Practices 100, and SEO 100 on the detail page and preview page.

Visual QA covered the available browser viewport (656 px):

- No horizontal overflow on detail or preview.
- Detail hero stacks below the 900 px breakpoint.
- The fallback state is centered, readable, and keeps the preview area height.
- The preview frame fills the content width and the header actions wrap cleanly.

## Known limitations

- Cross-origin iframes blocked by `X-Frame-Options` or `frame-ancestors` cannot always be detected reliably. The eight-second timeout and `Buka di Tab Baru` link are the honest fallback.
- A sandboxed Next.js preview that reads cookies can throw `SecurityError` because `allow-same-origin` is intentionally absent. This is expected; the preview remains sandboxed and the external link is available.
- The `Edit Project` link points to `/admin/projects/[id]/edit`, which is implemented in Phase 6. Clicking it before Phase 6 resolves to a 404.
- The default preview allowlist is only `*.vercel.app`. Other hosts must be added through `PREVIEW_ALLOWED_HOSTS`.
- Automated tests are planned for Phase 7. Phase 5 was verified with HTTP checks, browser automation, and Lighthouse.
- Local role testing still has the `USER` account `siti_rahma` / `siti.rahma@example.test`. Remove it before using a shared or production database.
