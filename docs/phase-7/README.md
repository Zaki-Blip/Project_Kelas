# Phase 7 — Automated Tests and Regression Checklist

Status: implementation and QA complete, awaiting approval before Phase 8.

## Scope

Phase 7 adds the automated unit test suite for validation, authorization, and security helpers, plus a production smoke test and a regression checklist for the remaining deployment checks.

Included:

- Vitest configuration for a Node test environment with the `@/` path alias and a `server-only` stub.
- Deterministic test environment values so tests do not depend on the developer's `.env`.
- Eight unit test files covering validation, authorization guards, rate limiting, CSRF origin checks, session lifecycle and cookies, password hashing, URL and image allowlists, preview allowlists, redirects, slugs, pagination, and href builders.
- A production smoke test of public routes, protected-route redirects, the 404 CSP response, and security headers.
- A documented regression checklist for the flows that remain browser-driven or require a deployed environment.

Not included:

- End-to-end browser tests (for example Playwright) or tests that drive Server Actions through the real Next.js runtime.
- Integration tests against MySQL or a real Vercel Blob store.
- Load tests, coverage thresholds, or a CI workflow. These belong to Phase 8 or later deployment work.
- Application code changes. Phase 7 tests the behavior implemented in Phases 2–6.

## Test setup

| File | Responsibility |
| --- | --- |
| `vitest.config.mts` | Node environment, `tests/**/*.test.ts` include pattern, `@/` alias, `server-only` stub, and setup file. |
| `tests/setup.ts` | Sets deterministic `DATABASE_URL`, `APP_URL`, `AUTH_SECRET`, empty `BLOB_READ_WRITE_TOKEN`, and `PREVIEW_ALLOWED_HOSTS=*.vercel.app`. |
| `tests/stubs/server-only.ts` | Empty module used only by the test runner so server-only helpers can be imported in Node. |

The setup values are not secrets and are not used to connect to a database. Modules that would touch MySQL (`@/lib/db`), Next.js request headers (`next/headers`), or Next.js navigation (`next/navigation`) are mocked inside the tests that need them. Real `node:crypto` and `@node-rs/argon2` implementations are used for hashing tests.

Run the suite with:

```bash
npm run test
```

## Coverage map

| Test file | What it verifies |
| --- | --- |
| `tests/unit/validation.test.ts` | Login and registration schemas, normalization, password rules, confirmation matching, project slug rules, gallery search params, admin project form rules, taxonomy rules, admin search params, and admin id parsing. |
| `tests/unit/security.test.ts` | JPEG/PNG/WebP magic bytes, MIME and extension maps, seed and Blob image allowlists, preview host parsing and wildcard matching, preview and GitHub URL validation, and `safeNextPath()` redirect rules. |
| `tests/unit/origin.test.ts` | `assertSameOrigin()` accepts the configured origin and matching forwarded/host values, and rejects missing, invalid, unsupported, and mismatched origins. |
| `tests/unit/guards.test.ts` | `requireUser()` login redirects and expired-cookie marker, `requireAdmin()` role enforcement, and `getAdminSession()` returning `null` for non-admins. |
| `tests/unit/rate-limit.test.ts` | Login limits of 5 failures per identifier/IP and 20 per IP, dual-key recording, 24-hour cleanup, clearing the identifier key after success, and the 5-per-hour register limit. |
| `tests/unit/auth-helpers.test.ts` | Client IP and user-agent parsing, SHA-256/HMAC output, Argon2id hashing and verification, dummy-hash timing behavior, session cookie names and options, the production `Secure` `__Host-` cookie, and cookie clearing. |
| `tests/unit/session.test.ts` | Session lookup by hashed token, expiry rejection, error fallback, current-user lookup, token generation and hashing, 7-day expiry, IP and user-agent storage, rotation of an existing token, cleanup of expired sessions, cookie-failure rollback, logout revocation, and cookie clearing even when the database delete fails. |
| `tests/unit/helpers.test.ts` | Slug generation, pagination window/ellipsis logic, project/gallery/login URLs, safe admin return paths including encoded traversal and control bytes, admin href builders, and notice lookup. |

## Results

Commands run after the Phase 7 changes:

| Command | Result |
| --- | --- |
| `npm run test` | 8 files, 142 tests, all passed. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |
| `npm run build` | Passed. All application routes are dynamic; `/icon.svg` is static. |

> Phase 8 later added 9 PKL validation tests, bringing the current total to 151, plus a GitHub Actions CI workflow.

The first test run used `vitest.config.ts` and emitted a Vite warning about ESM syntax in a CommonJS-loaded config. Renaming it to `vitest.config.mts` removed the warning without changing `package.json` module semantics.

## Production smoke test

The production build was started with `npm run start` and checked over HTTP.

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
| `/does-not-exist` | `404` with a nonce-based CSP header |

Security headers observed on `/`:

- `Content-Security-Policy` with a per-request nonce, `strict-dynamic`, and `frame-src https://*.vercel.app`. Production does not include `unsafe-eval`.
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

The 404 response carried the same nonce-based CSP plus `X-Content-Type-Options`, `Referrer-Policy`, and `X-Frame-Options`.

## Manual regression checklist

The browser-driven flows below were verified during Phases 3–6. Phase 7 adds the unit suite and rechecks the public and unauthenticated production paths.

Baseline verified in Phases 3–6:

- [x] Landing page renders the six latest `PUBLISHED` projects and links to the gallery.
- [x] About page renders.
- [x] Register, login, and logout work; login failures use the generic message; rate limits trigger; duplicate registration is rejected.
- [x] Post-login redirects use only safe internal `next` paths; login/register pages redirect authenticated users.
- [x] Protected routes redirect unauthenticated users to login with the correct `next` path and mark expired cookies.
- [x] `USER` opening `/admin` is redirected to `/dashboard?notice=forbidden`; `ADMIN` can open the admin area.
- [x] Gallery search, category/technology filters, pagination, empty state, and out-of-range page state work.
- [x] Detail pages show `PUBLISHED` projects to `USER`; `ADMIN` can see drafts; missing or unauthorized projects return 404.
- [x] Preview pages render a sandboxed iframe without `allow-same-origin`, top navigation, or popups, with `referrerpolicy="no-referrer"` and lazy loading.
- [x] Admin project create, edit, delete, search, pagination, `returnTo`, validation, duplicate-slug handling, published-without-thumbnail handling, and invalid URL handling work.
- [x] Category and technology create/edit/delete work; conflicts and in-use deletes are rejected.
- [x] Upload error paths work: missing token, invalid magic bytes, and failed store.
- [x] Root 404 page renders without CSP console errors.
- [x] Lighthouse baseline: `/` and `/login` each scored Accessibility 100, Best Practices 100, and SEO 100.

Phase 7 smoke test:

- [x] Production public pages return `200`.
- [x] Production protected routes redirect to login with the expected `next` value.
- [x] Production 404 returns `404` with a CSP nonce.
- [x] Security headers are present.
- [x] Unit tests, typecheck, lint, and build pass.

Pending deployment checks:

- [ ] Real Vercel Blob upload success with a valid `BLOB_READ_WRITE_TOKEN`.
- [ ] Authenticated production check over HTTPS with the `__Host-kk_session` cookie.
- [ ] Preview deployment hostname added to `PREVIEW_ALLOWED_HOSTS` and verified in the iframe CSP.
- [ ] Production migration and seed runbook executed against the hosted MySQL database.
- [ ] CI workflow runs test, typecheck, lint, and build.

## Limitations

- Unit tests use mocks for Prisma, `next/headers`, and `next/navigation`. They verify decision logic and validation, not the real Next.js request pipeline or database constraints.
- Server Actions, forms, dialogs, and browser-only behavior are covered by the Phase 3–6 manual QA, not by automated end-to-end tests.
- The `server-only` package is stubbed in tests so pure helpers can be imported in Node. The real package still protects application imports at build time.
- Production authentication cannot be exercised over plain HTTP localhost because the production cookie is `__Host-kk_session` with `Secure`. Development mode uses `kk_session`.
- A real Blob upload cannot complete locally because `BLOB_READ_WRITE_TOKEN` is empty.
- No coverage threshold is configured. Phase 8 adds the CI workflow.

## Files added in Phase 7

- `vitest.config.mts`
- `tests/setup.ts`
- `tests/stubs/server-only.ts`
- `tests/unit/validation.test.ts`
- `tests/unit/security.test.ts`
- `tests/unit/origin.test.ts`
- `tests/unit/guards.test.ts`
- `tests/unit/rate-limit.test.ts`
- `tests/unit/auth-helpers.test.ts`
- `tests/unit/session.test.ts`
- `tests/unit/helpers.test.ts`
- `docs/phase-7/README.md`

No application source files were changed in this phase.

## Next step

Phase 7 is ready for approval. Phase 8 can cover deployment configuration and final hardening: `.env.example`, README/setup and migration/seed runbooks, Vercel project and Blob setup, preview host configuration, CI, and any remaining production-only checks. Do not start Phase 8 until it is approved.
