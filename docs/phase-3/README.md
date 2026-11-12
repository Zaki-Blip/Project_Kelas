# Phase 3 — Authentication, Sessions, and Authorization

Status: implementation complete, awaiting approval before Phase 4.

## Scope

Phase 3 adds the authentication and authorization layer:

- Login with email or username, registration, and logout.
- Database-backed opaque sessions with rotation and revocation.
- Argon2id password hashing.
- CSRF origin checks on every auth mutation.
- Database-backed login and registration rate limits.
- Safe post-login redirects.
- Session-aware header and footer.
- Protected app shell with placeholder `/dashboard` and `/admin` pages.
- Optimistic cookie-presence redirects in `src/proxy.ts`.

No Phase 4 gallery or admin CRUD work has started.

## Route access

| Route | Access | Behavior |
| --- | --- | --- |
| `/login` | Public | Authenticated users redirect to a safe `next` path or `/dashboard`. |
| `/register` | Public | Authenticated users redirect to `/dashboard`. |
| `/dashboard` | `USER`, `ADMIN` | Unauthenticated users redirect to `/login?next=/dashboard`. |
| `/admin` | `ADMIN` | `USER` redirects to `/dashboard?notice=forbidden`; unauthenticated users redirect to login. |
| `/`, `/about` | Public | Header and footer reflect the current session. |

## Implementation map

| File | Responsibility |
| --- | --- |
| `src/lib/auth/constants.ts` | Cookie names, session TTL, production detection. |
| `src/lib/auth/password.ts` | Argon2id hashing, verification, dummy hash for timing consistency. |
| `src/lib/auth/cookies.ts` | Read, set, and clear the session cookie. |
| `src/lib/auth/session.ts` | Create, read, and destroy sessions; per-request `cache()`. |
| `src/lib/auth/guards.ts` | `requireUser()` and `requireAdmin()`. |
| `src/lib/auth/request.ts` | Client IP, user agent, HMAC, and SHA-256 helpers. |
| `src/lib/auth/rate-limit.ts` | Login and registration attempt counters. |
| `src/lib/security/origin.ts` | `assertSameOrigin()` CSRF check. |
| `src/lib/security/urls.ts` | `safeNextPath()` redirect validation. |
| `src/lib/validation/auth.ts` | Zod login and registration schemas. |
| `src/server/actions/auth.ts` | `loginAction`, `registerAction`, `logoutAction`. |
| `src/proxy.ts` | Optimistic redirects for protected paths when the cookie is absent. |
| `src/components/auth/*` | Auth forms, field component, logout button. |
| `src/app/(app)/*` | Protected layout and placeholder dashboard/admin pages. |

## Security decisions

- Passwords use Argon2id with memory `19456` KiB, time cost `2`, parallelism `1`, and a 32-byte output.
- Registration requires 8–128 characters with at least one letter and one number.
- Login accepts email or username, normalized to lowercase.
- Missing accounts still verify a dummy Argon2id hash to reduce timing-based account enumeration.
- Login always returns `Email/username atau password salah.` for invalid credentials.
- Session tokens are 32 random bytes encoded as base64url. Only the SHA-256 hex hash is stored.
- Production cookie: `__Host-kk_session` with `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`.
- Development cookie: `kk_session` with `Secure` disabled.
- Sessions have a 7-day absolute expiry and are rotated on login. Logout deletes the current session and clears the cookie.
- Every auth Server Action calls `assertSameOrigin()` before processing input. Next.js's built-in Server Actions origin check remains enabled as an additional layer.
- Login limits: 5 failures per normalized identifier + IP per 15 minutes, and 20 failures per IP per 15 minutes.
- Registration limit: 5 attempts per IP per hour.
- Rate-limit keys are HMAC-SHA256 values derived from `AUTH_SECRET`; raw identifiers and IPs are not stored in `auth_attempts`.
- `safeNextPath()` accepts only same-origin internal paths and rejects absolute URLs, protocol-relative paths, backslashes, control characters, and login/register paths.
- Database failures in session reads are logged and treated as no session. Database failures in auth mutations return the generic error and do not authenticate the user.
- All database access uses Prisma parameterized queries. No raw user-input SQL is used.

## Environment

`APP_URL` and `AUTH_SECRET` are required. `AUTH_SECRET` must be at least 32 characters.

- Production `APP_URL` must use HTTPS. `localhost`, `127.0.0.1`, and `::1` are also accepted for local production builds.
- The `__Host-` production cookie requires HTTPS and cannot be set over plain HTTP.
- Vercel preview deployments should set `APP_URL` to their own preview origin so origin checks and redirects match.

## Verification

The following checks pass:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm audit` reports 0 vulnerabilities.

Manual and HTTP verification covered:

- Empty-field and malformed-input validation messages.
- Invalid login message and preserved identifier.
- Successful login with email and username.
- Registration validation, password mismatch, weak-password rules, and duplicate email/username conflict.
- Session cookie attributes in development: `kk_session`, `Path=/`, `Max-Age=604800`, `HttpOnly`, `SameSite=lax`, `Priority=high`.
- Database session rows store a 64-character hash, never the raw token.
- Login rate limit blocks the sixth attempt after five failures.
- Registration rate limit blocks the sixth attempt after five attempts.
- Cross-origin Server Action requests are rejected.
- Unauthenticated `/dashboard` redirects to `/login?next=%2Fdashboard`.
- Invalid session cookies redirect with `expired=1` and show the expiry notice.
- A `USER` opening `/admin` is redirected to `/dashboard?notice=forbidden`.
- Logout clears the cookie and deletes the database session.
- Safe redirects reject `//evil.example`, `https://evil.example`, `/login`, `/login/`, and `/register/foo`.

Visual QA used Chrome DevTools device metrics at 360, 768, and 1280 px:

- No horizontal overflow on `/`, `/login`, `/register`, `/dashboard`, or `/admin`.
- Auth cards measure 328 px at 360 px and 460 px at 768/1280 px.
- Desktop navigation appears at 768 px and above; mobile menu appears below 768 px.
- Lighthouse reports Accessibility 100, Best Practices 100, and SEO 100 on `/`, `/about`, `/login`, `/register`, `/dashboard`, and `/admin`.

## Known limitations

- `/dashboard` and `/admin` are protected placeholders. Gallery, search, filters, pagination, detail pages, previews, and admin CRUD belong to Phase 4.
- Rate limiting is best-effort under concurrent requests; the database count and insert are not a single atomic operation.
- `sessions.lastUsedAt` is initialized at login but is not refreshed on every authenticated request.
- Rotating `AUTH_SECRET` resets rate-limit keys and stored IP hashes. Existing sessions remain valid because session tokens are hashed with SHA-256, not HMAC. Delete `sessions` to invalidate all active sessions.
- The automated test suite is planned for Phase 7. Phase 3 was verified manually and with HTTP-level checks.
- Local role testing created a `USER` account with username `siti_rahma` and email `siti.rahma@example.test`. Remove it before using a shared or production database.
