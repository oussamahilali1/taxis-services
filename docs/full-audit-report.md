# Full Audit Report

Date: 2026-04-07

Scope: read-only audit of the current repository as a production website with frontend, backend, database/admin flows, accessibility, SEO/performance, and deployment/operations review.

Audit mode: no code changes, no cleanup, no deletions, no refactors, no package changes. This report documents findings only.

## 1. Executive Summary

The repository has a solid baseline in a few important areas: admin passwords are hashed with `bcrypt`, admin sessions are opaque server-side tokens whose hashes are stored in PostgreSQL, mutating admin routes require a CSRF header, public/admin abuse controls exist, `helmet` is enabled, and admin API responses are marked `no-store`. The public HTML output also has titles, meta descriptions, canonicals, and clean local internal link references.

The most serious issue is deployment correctness: the generated frontend and admin pages are currently hardcoded to call `http://localhost:4000`, which would break public forms and admin login/dashboard behavior in production. Around that, there are several meaningful security and launch-readiness gaps: spoofable forwarded-IP handling, privacy/retention mismatch versus the legal page, incomplete special-assistance data handling, CAPTCHA plumbing without frontend capture UI, operational drift in runtime env vars, and accessibility issues in the admin dashboard.

This audit was static and read-only. I did not run a production deployment, did not inspect live database contents, and did not rebuild the site because the build rewrites generated files. I also attempted `npm --prefix backend run prisma:validate`, but it failed locally with `EPERM lstat 'C:\Users\oussa'`, so Prisma schema review was completed statically instead.

## 2. Project Inventory

### 2.1 Repo Structure

| Path | Purpose |
| --- | --- |
| `frontend/` | Generated static site pages and assets |
| `backend/` | Express API, Prisma schema/migrations, admin/session logic |
| `scripts/build-site.mjs` | Static site generator that writes HTML and root `robots.txt` / `sitemap.xml` |
| `docs/deployment.md` | Deployment notes for Vercel + Render/Railway style setup |
| `vercel.json` | Frontend build, headers, redirects, CSP |
| `.env.example` | Frontend build-time env template (`PUBLIC_API_BASE_URL`) |
| `backend/.env.example` | Backend runtime env template |
| `robots.txt`, `sitemap.xml` | SEO artifacts written at repo root |
| `run` | Manual local setup / preview notes |

### 2.2 Frontend Pages And Flows

| Page | Purpose | Notes |
| --- | --- | --- |
| `frontend/index.html` | Home page | Quick booking + full booking form |
| `frontend/services.html` | Services overview | Full booking form |
| `frontend/about.html` | Company/about page | Marketing + local trust page |
| `frontend/contact.html` | Contact page | Contact form + full booking form |
| `frontend/mentions-legales.html` | Legal/privacy/accessibility page | Legal identity and retention statements |
| `frontend/city-taxi.html` | Local taxi service page | Full booking form |
| `frontend/navette-aeroport.html` | Airport shuttle page | Full booking form |
| `frontend/business-taxi.html` | Business transport page | Full booking form |
| `frontend/pmr-taxi.html` | PMR/accessibility service page | Full booking form |
| `frontend/parcel-delivery.html` | Parcel service page | Full booking form |
| `frontend/admin-login.html` | Admin login page | JS-backed admin authentication |
| `frontend/admin-dashboard.html` | Admin dashboard page | JS-backed CRUD UI for bookings/contacts |
| `frontend/admin-login` | Extensionless redirect alias | Redirects to `admin-login.html` |
| `frontend/admin-dashboard` | Extensionless redirect alias | Redirects to `admin-dashboard.html` |

### 2.3 Forms And Submission Targets

| Form | Pages | Target | Frontend handler | Backend handler |
| --- | --- | --- | --- | --- |
| Quick booking | `index.html` | `/api/bookings` | `frontend/assets/js/main.js` | `submitBooking` |
| Full booking | Home, services, contact, all service detail pages | `/api/bookings` | `frontend/assets/js/main.js` | `submitBooking` |
| Contact form | `contact.html` | `/api/contacts` | `frontend/assets/js/main.js` | `submitContact` |
| Admin login | `admin-login.html` | `/api/admin/login` | `frontend/assets/js/admin.js` | `loginAdmin` |
| Admin logout | Dashboard | `/api/admin/logout` | `frontend/assets/js/admin.js` | `logoutAdmin` |
| Admin CRUD | Dashboard | `/api/admin/bookings/*`, `/api/admin/contacts/*` | `frontend/assets/js/admin.js` | Admin controllers |

### 2.4 API Routes And Middleware

Public routes:

- `POST /api/bookings`
- `POST /api/contacts`

Admin routes:

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/me`
- `GET /api/admin/dashboard`
- `GET /api/admin/bookings`
- `GET /api/admin/bookings/:id`
- `PATCH /api/admin/bookings/:id`
- `DELETE /api/admin/bookings/:id`
- `GET /api/admin/contacts`
- `GET /api/admin/contacts/:id`
- `PATCH /api/admin/contacts/:id`
- `DELETE /api/admin/contacts/:id`

Core middleware observed:

- `helmet`
- `cors`
- `cookie-parser`
- JSON and URL-encoded parsers
- request ID + audit context assignment
- PostgreSQL-backed rate limiting
- admin auth + CSRF middleware
- admin `no-store` response headers
- not-found + structured error handler

### 2.5 Auth / Session System

- Cookie name defaults to `taxi_admin_session`
- Session token is opaque and random; only SHA-256 hash is stored in DB
- CSRF token is created per session and required on mutating admin routes
- Session TTL model: absolute TTL + idle TTL + touch window
- New login deletes previous sessions for the same admin
- Password hashing uses `bcrypt`

### 2.6 Prisma Models / DB Structure

| Model | Purpose |
| --- | --- |
| `Admin` | Admin identities and roles |
| `Booking` | Public booking submissions |
| `Contact` | Public contact submissions |
| `AdminSession` | Server-side admin sessions with CSRF token and expiry fields |
| `RateLimitBucket` | Persistent rate-limit counters by scope / identifier hash / window |

Enums:

- `AdminRole`: `ADMIN`, `SUPER_ADMIN`
- `BookingServiceType`: `LOCAL_TAXI`, `AIRPORT_SHUTTLE`, `BUSINESS`, `PMR`, `PARCEL_DELIVERY`, `QUICK_REQUEST`
- `BookingStatus`: `PENDING`, `IN_REVIEW`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `SPAM`
- `ContactStatus`: `NEW`, `IN_PROGRESS`, `RESOLVED`, `ARCHIVED`, `SPAM`

### 2.7 Env Vars And Config Files

| File | Role |
| --- | --- |
| `.env.example` | Frontend build-time `PUBLIC_API_BASE_URL` template |
| `backend/.env.example` | Backend runtime template for DB, CORS, cookies, sessions, rate limits, CAPTCHA, seeding |
| `backend/.env` | Local runtime env present in workspace; contains populated values and some stale/unused vars |
| `vercel.json` | Static hosting headers, redirects, CSP, output directory |
| `docs/deployment.md` | Deployment guidance and known content warning |

### 2.8 Static Assets

CSS:

- `frontend/assets/css/main.css`
- `frontend/assets/css/custom.css`
- `frontend/assets/css/admin.css`

JavaScript:

- `frontend/assets/js/app-config.js`
- `frontend/assets/js/main.js`
- `frontend/assets/js/admin.js`
- `frontend/assets/js/service-area.js`

Largest current images observed:

- `frontend/assets/img/navette-aeroport.jpg` ~934 KB
- `frontend/assets/img/se.jpg` ~629 KB
- `frontend/assets/img/Transport-pmr.jpeg` ~138 KB
- `frontend/assets/img/Transport_vip.jpg` ~115 KB

### 2.9 Admin / Hidden / Internal Pages

- Public site footer links expose `admin-login.html`
- `admin-login.html` and `admin-dashboard.html` are static pages protected by backend auth, not by route secrecy
- Extensionless aliases `frontend/admin-login` and `frontend/admin-dashboard` exist as redirect pages
- Admin HTML pages are marked `noindex, nofollow`

### 2.10 Dependencies And Scripts

Root scripts:

- `build`
- `backend:dev`
- `backend:start`
- `backend:generate`
- `backend:migrate`
- `backend:seed`

Backend scripts:

- `dev`
- `start`
- `prisma:generate`
- `prisma:migrate:dev`
- `prisma:migrate:deploy`
- `prisma:validate`
- `db:seed`

Main backend dependencies:

- `express`
- `helmet`
- `cors`
- `cookie-parser`
- `bcrypt`
- `zod`
- `@prisma/client`
- `dotenv`
- `morgan`

### 2.11 Inventory Notes

- Static link/reference scan found `missing_count=0` for local `href` / `src` targets in current generated pages.
- Generated HTML pages all have a title, meta description, and canonical URL.
- `frontend/admin-dashboard.html` is the only HTML page found without an `<h1>`.
- No project CI workflow, test suite, or lint script was found outside dependency folders.

## 3. Risk Summary By Severity

| Severity | Count | Findings |
| --- | --- | --- |
| Critical | 1 | F1 |
| High | 3 | F2, F3, F4 |
| Medium | 7 | F5, F6, F7, F8, F9, F10, F12 |
| Low | 3 | F11, F13, F14 |
| Nice to have | 1 | F15 |

## 4. Detailed Findings

### F1

- Title: Frontend and admin builds are currently hardcoded to `http://localhost:4000`
- Severity: Critical
- Area: Frontend, Deployment, QA
- Affected files: `frontend/index.html`, `frontend/contact.html`, `frontend/services.html`, `frontend/admin-login.html`, `frontend/admin-dashboard.html`, other generated `frontend/*.html` pages, `frontend/assets/js/app-config.js`, `scripts/build-site.mjs`, `docs/deployment.md`, `vercel.json`
- Description: All generated HTML pages currently ship `<meta name="app-api-base-url" content="http://localhost:4000">`. The frontend reads that value and builds API URLs from it, so production forms and admin requests will target each visitor's own localhost instead of the production API.
- Why it matters: This is a launch blocker. Public booking/contact submissions and admin login/dashboard requests are expected to fail in production. On HTTPS pages, the browser and CSP can also block the HTTP localhost target.
- Evidence:
  - `frontend/index.html:9`, `frontend/contact.html:9`, `frontend/services.html:9`, `frontend/admin-login.html:9`, `frontend/admin-dashboard.html:9` all contain `http://localhost:4000`
  - `frontend/assets/js/app-config.js:4-18` reads the meta tag and uses it as `apiBaseUrl`
  - `scripts/build-site.mjs:12` sets `apiBaseUrl` from `process.env.PUBLIC_API_BASE_URL || ''`
  - `scripts/build-site.mjs:453` writes the meta tag into each page
  - `docs/deployment.md:26` says production should use `PUBLIC_API_BASE_URL=https://api.your-domain.com`
  - `vercel.json` sets `connect-src 'self' https:`, which does not allow `http://localhost:4000`
- Reproduction steps if applicable:
  1. Deploy the current generated `frontend/` output as-is.
  2. Open any public form or the admin login page.
  3. Submit the form or log in.
  4. Observe the browser attempting to call `http://localhost:4000/api/...` instead of the production API.
- Recommended fix: Rebuild the frontend with the correct production `PUBLIC_API_BASE_URL`, or intentionally switch to same-origin API URLs if frontend and API will share an origin. Validate both public form flows and admin auth flows on the real deployed domain after the rebuild.
- Whether the fix is safe/simple or needs my approval first: Safe/simple once you confirm the intended production API origin and hosting topology.

### F2

- Title: Client IP handling trusts spoofable forwarded headers
- Severity: High
- Area: Security, Abuse Protection, Audit Logging
- Affected files: `backend/src/lib/audit.js`, `backend/src/middleware/rate-limiters.js`, `backend/src/middleware/request-context.js`, `backend/src/controllers/public.controller.js`, `backend/src/app.js`
- Description: The backend takes `X-Forwarded-For` first, then `X-Real-IP`, and only falls back to `req.ip`. Because that raw header value is reused for rate limiting, captcha `remoteip`, request context, and audit logging, a client can likely spoof its apparent IP unless the app only ever sits behind a trusted proxy that rewrites those headers reliably.
- Why it matters: Attackers can weaken rate limits, brute-force/login protections, spam protections, and audit trail usefulness by sending arbitrary forwarded-IP headers.
- Evidence:
  - `backend/src/lib/audit.js:4-15` returns `x-forwarded-for` or `x-real-ip` before `req.ip`
  - `backend/src/middleware/rate-limiters.js:124,144` use `getClientIp(req)` for admin/public IP rate limiting
  - `backend/src/middleware/request-context.js:5-8` stores the derived IP into request context
  - `backend/src/controllers/public.controller.js:9-10,27-28` passes that IP to CAPTCHA verification
  - `backend/src/app.js:24` sets `trust proxy` to `1`, but `getClientIp` bypasses Express's proxy-aware `req.ip`
- Reproduction steps if applicable:
  1. Send repeated requests with different `X-Forwarded-For` values to a rate-limited endpoint.
  2. Observe that the limiter key changes with the supplied header, not necessarily with the real client address.
- Recommended fix: Stop reading raw forwarded headers directly in application code. Use a proxy-trusted source such as Express `req.ip` after correct proxy configuration, or only accept forwarded headers from a trusted edge/load balancer layer.
- Whether the fix is safe/simple or needs my approval first: Needs approval first because it changes auth/rate-limit behavior and can affect real-client IP attribution in production.

### F3

- Title: Data retention promised in the legal page is not enforced in code
- Severity: High
- Area: Privacy, Backend, Legal/Compliance
- Affected files: `frontend/mentions-legales.html`, `backend/prisma/schema.prisma`, `backend/src/services/booking.service.js`, `backend/src/services/contact.service.js`
- Description: The legal page says personal data are deleted after the service unless there is a legal obligation or explicit agreement to keep them longer. In the codebase, bookings and contacts are stored indefinitely unless an admin manually deletes them. I found no retention job, scheduled purge, or policy enforcement.
- Why it matters: This is a compliance and trust risk. The public statement and actual data lifecycle do not currently match.
- Evidence:
  - `frontend/mentions-legales.html` states that personal data are deleted after the service
  - `backend/prisma/schema.prisma:63,66,83` stores `notes` and `metadata` on `Booking` and `Contact`
  - `backend/src/services/booking.service.js:127-131` only deletes on explicit admin delete
  - `backend/src/services/contact.service.js:121-125` only deletes on explicit admin delete
  - no cleanup job or retention task was found in the repo
- Reproduction steps if applicable:
  1. Submit a booking or contact.
  2. Review code paths for lifecycle handling.
  3. Observe that records remain until manual admin deletion.
- Recommended fix: Define an actual retention matrix for bookings, contacts, audit/security metadata, and special-assistance indicators. Then implement scheduled deletion/anonymization plus a documented exception path for legal/business retention.
- Whether the fix is safe/simple or needs my approval first: Needs approval first because it changes retention behavior and may affect legal/process expectations.

### F4

- Title: Accessibility / special-assistance details are stored without dedicated minimization or retention controls
- Severity: High
- Area: Privacy, Accessibility, Backend
- Affected files: `frontend/index.html`, `frontend/services.html`, `frontend/contact.html`, all service booking pages, `backend/src/lib/validation.js`, `backend/src/services/booking-rules.service.js`, `backend/prisma/schema.prisma`, `frontend/mentions-legales.html`
- Description: The forms collect accessibility/assistance needs, and the backend preserves that signal inside booking metadata alongside free-text notes. The legal page correctly says no medical records are collected, but there is no dedicated handling policy for this special-assistance data, no minimization beyond basic sanitation, and no retention enforcement.
- Why it matters: Accessibility/assistance data can be sensitive from a privacy and compliance perspective. Even a boolean flag plus notes can reveal disability-related needs or mobility limitations.
- Evidence:
  - booking forms include the checkbox label `Besoin d’accessibilité ou d’assistance`
  - `backend/src/lib/validation.js:322-324` normalizes `accessibilityNeeded`
  - `backend/src/services/booking-rules.service.js:43-45` persists `accessibilityRequested`
  - `backend/prisma/schema.prisma:66` stores booking `metadata` as JSON
  - `frontend/mentions-legales.html` explains what is collected, but not how this field is specially minimized or time-bounded in implementation
- Reproduction steps if applicable:
  1. Submit a PMR/accessibility booking with notes.
  2. Review normalized payload and booking rules flow.
  3. Observe that the signal is stored as regular booking metadata without special lifecycle handling.
- Recommended fix: Decide what minimum assistance data are operationally necessary, avoid free-text collection where a smaller controlled input can work, and define retention/anonymization specifically for PMR/accessibility-related fields.
- Whether the fix is safe/simple or needs my approval first: Needs approval first because it changes privacy/legal handling and possibly form design.

### F5

- Title: Backend CAPTCHA support exists, but the frontend currently does not render a CAPTCHA widget or token field
- Severity: Medium
- Area: Security, QA
- Affected files: `backend/.env.example`, `backend/src/services/captcha.service.js`, `backend/src/controllers/public.controller.js`, `frontend/assets/js/main.js`, generated `frontend/*.html`
- Description: The backend supports Turnstile/hCaptcha verification and the frontend JS reads `captchaToken`, but the current generated HTML does not render a CAPTCHA widget or hidden token field. The template also defaults CAPTCHA mode to `off`.
- Why it matters: Spam protection is weaker than it may appear from the backend code alone. If CAPTCHA is later switched to `required` without frontend work, public forms will fail.
- Evidence:
  - `backend/.env.example:26-28` defaults `PUBLIC_CAPTCHA_MODE=off`
  - `backend/src/services/captcha.service.js:13-31` enforces optional/required modes
  - `backend/src/controllers/public.controller.js:9-10,27-28` always calls CAPTCHA verification
  - `frontend/assets/js/main.js:624,644` reads `captchaToken`
  - repo-wide search found no CAPTCHA widget markup or `captchaToken` inputs in generated `frontend/*.html`
- Reproduction steps if applicable:
  1. Search generated HTML for `captchaToken`, Turnstile, or hCaptcha widgets.
  2. Observe that only JS and backend hooks exist.
  3. If mode were changed to `required`, submissions without a frontend token would fail.
- Recommended fix: Either explicitly keep CAPTCHA off and document the current anti-spam posture, or add a real frontend widget/token flow and test it before enabling optional/required modes.
- Whether the fix is safe/simple or needs my approval first: Needs approval first because it changes public form UX and external anti-spam dependencies.

### F6

- Title: Live backend env file has drift from the current session-based implementation
- Severity: Medium
- Area: Operations, Deployment, Security Hygiene
- Affected files: `backend/.env`, `backend/.env.example`, `backend/src/lib/config.js`, `backend/prisma/seed.js`
- Description: The local backend `.env` present in the workspace contains variables associated with older or different auth patterns (`JWT_SECRET`, `JWT_EXPIRES_IN`, `COOKIE_CSRF_NAME`, `SEED_ADMIN_PASSWORD`) that the current codebase does not use. The current seed script expects `BOOTSTRAP_ADMIN_PASSWORD`, not `SEED_ADMIN_PASSWORD`.
- Why it matters: Env drift causes deployment confusion, failed admin bootstrap, incorrect incident assumptions, and false confidence that certain secrets or features are active when they are not.
- Evidence:
  - `backend/.env` contains `JWT_SECRET`, `JWT_EXPIRES_IN`, `COOKIE_CSRF_NAME`, `SEED_ADMIN_PASSWORD` (values intentionally not echoed)
  - repo-wide search found no active code references to those variable names
  - `backend/src/lib/config.js` uses session/cookie settings, not JWT config
  - `backend/prisma/seed.js:17-18,37,66` expects `BOOTSTRAP_ADMIN_PASSWORD`
  - `backend/.env.example` aligns with the current session-based code, not the stale runtime vars
- Reproduction steps if applicable:
  1. Compare `backend/.env` keys with `backend/src/lib/config.js` and `backend/prisma/seed.js`.
  2. Observe that several populated runtime vars are no longer consumed.
- Recommended fix: Reconcile the runtime env with the current codebase, remove stale keys after approval, and ensure deployment secret stores match the session-based auth design now in use.
- Whether the fix is safe/simple or needs my approval first: Needs approval first because it changes deployment/runtime configuration and may affect bootstrap procedures.

### F7

- Title: Visible required markers do not match actual form validation rules
- Severity: Medium
- Area: Frontend, QA, Accessibility
- Affected files: `frontend/index.html`, `frontend/contact.html`, `frontend/services.html`, all service detail pages, `frontend/assets/js/main.js`, `scripts/build-site.mjs`, `backend/src/lib/validation.js`
- Description: Several full booking fields are enforced by client-side and backend validation but are not visually marked as required in the generated form labels. This includes `Passagers`, `Téléphone`, `Adresse de destination`, and `Date et heure souhaitées`.
- Why it matters: Users are more likely to submit incomplete forms, hit preventable errors, and experience the site as broken. This is also an accessibility/clarity issue.
- Evidence:
  - Example labels without required marker:
    - `frontend/index.html:288,305,327,333`
    - `frontend/contact.html:220,237,259,265`
    - `frontend/services.html:194,211,233,239`
    - same pattern repeated in service detail pages
  - `frontend/assets/js/main.js:476-526` requires these fields for full bookings
  - `backend/src/lib/validation.js` also validates the normalized booking payload server-side
  - `scripts/build-site.mjs:652,669,691,697` generates the affected labels without `<span class="required">*</span>`
- Reproduction steps if applicable:
  1. Open any full booking form.
  2. Notice that the labels above are not visually marked required.
  3. Try submitting without those fields.
  4. Observe validation failure.
- Recommended fix: Align visible required indicators with actual client/server validation rules across all generated booking forms.
- Whether the fix is safe/simple or needs my approval first: Safe/simple.

### F8

- Title: Admin dashboard record selection is mouse-only, and the dashboard page has no `<h1>`
- Severity: Medium
- Area: Accessibility, Admin UX
- Affected files: `frontend/admin-dashboard.html`, `frontend/assets/js/admin.js`
- Description: Booking and contact rows are clickable table rows with no keyboard focus model, no button/link semantics, and no key handlers. The dashboard page also lacks a top-level heading.
- Why it matters: Keyboard and assistive-technology users cannot reliably discover or operate the record-selection behavior. The missing `<h1>` also weakens page structure.
- Evidence:
  - `frontend/assets/js/admin.js:352-395` renders booking rows as clickable `<tr>` elements and only binds `click`
  - `frontend/assets/js/admin.js:400-439` does the same for contact rows
  - static HTML inventory found no `<h1>` in `frontend/admin-dashboard.html`
  - `frontend/admin-dashboard.html` starts content with summary cards and `h2` sections only
- Reproduction steps if applicable:
  1. Open the admin dashboard.
  2. Try selecting a booking or contact using keyboard-only navigation.
  3. Observe that the rows are not exposed as normal interactive controls.
- Recommended fix: Make rows operable via keyboard with appropriate semantics, or convert selection controls into buttons/links inside cells. Add a descriptive `<h1>` to the dashboard page.
- Whether the fix is safe/simple or needs my approval first: Safe/simple.

### F9

- Title: Duplicate detection is overly coarse and automatically classifies some retries as `SPAM`
- Severity: Medium
- Area: Backend, QA, Data Integrity
- Affected files: `backend/src/services/booking.service.js`, `backend/src/services/contact.service.js`, `backend/.env.example`
- Description: Duplicate logic for bookings only keys on recent window + same service type + same pickup location + same email/phone match. A legitimate second request that differs in destination or schedule can still be tagged as duplicate and stored with `SPAM` status. Contact duplicate logic is stricter, but the same auto-`SPAM` pattern exists there too.
- Why it matters: Legitimate customers can be silently misclassified, which creates false negatives in operational workflows and undermines admin trust in submission status.
- Evidence:
  - `backend/src/services/booking.service.js:32-54` shows the duplicate lookup criteria
  - `backend/src/services/booking.service.js:82` sets `status` to `SPAM` when duplicate or honeypot triggers
  - `backend/src/services/contact.service.js:27-46` and `:76` apply the same status pattern for contacts
  - `backend/.env.example:24` sets a 10-minute duplicate window
- Reproduction steps if applicable:
  1. Submit a booking.
  2. Within the duplicate window, submit another booking with the same pickup/service and same phone or email but a different destination or time.
  3. Static code review indicates the second request can still be classified as duplicate and stored as `SPAM`.
- Recommended fix: Treat duplicates as a review signal rather than an automatic `SPAM` verdict, or expand the duplicate fingerprint to include destination/time and an explicit user-visible duplicate response.
- Whether the fix is safe/simple or needs my approval first: Needs approval first because it changes business workflow and status semantics.

### F10

- Title: Database housekeeping is incomplete, and the health endpoint does not verify database availability
- Severity: Medium
- Area: Backend, Database, Operations
- Affected files: `backend/src/middleware/rate-limiters.js`, `backend/src/services/auth.service.js`, `backend/src/app.js`, `backend/prisma/schema.prisma`
- Description: Rate-limit counters are persisted in PostgreSQL, but no pruning job for old `RateLimitBucket` rows was found. Expired admin sessions are removed on lookup or explicit logout/login, but there is no separate cleanup path for idle expired sessions. Separately, `/api/health` always returns `status: ok` without checking Prisma or database connectivity.
- Why it matters: Over time, operational tables can grow unnecessarily, and infrastructure can treat the service as healthy even while the database is unavailable.
- Evidence:
  - `backend/src/middleware/rate-limiters.js:17-38` only upserts rate-limit buckets
  - repo search found no `rateLimitBucket.deleteMany` or cleanup task
  - `backend/src/services/auth.service.js:127-132` only deletes expired sessions when they are looked up
  - `backend/src/app.js:39-44` returns a static health response without DB verification
  - `backend/prisma/schema.prisma` defines persistent `AdminSession` and `RateLimitBucket` tables
- Reproduction steps if applicable:
  1. Inspect the limiter/session code paths.
  2. Note the absence of scheduled pruning.
  3. Consider a DB outage scenario: `/api/health` still returns success from static code.
- Recommended fix: Add a pruning routine for stale rate-limit/session rows and upgrade `/api/health` into a real readiness check that validates database connectivity (or add a separate readiness endpoint).
- Whether the fix is safe/simple or needs my approval first: Safe/simple for the health check itself; cleanup policy should be approved first if it changes retention/ops expectations.

### F11

- Title: Frontend CSP permits global `unsafe-inline`
- Severity: Low
- Area: Security Headers
- Affected files: `vercel.json`, `frontend/admin-login`, `frontend/admin-dashboard`, generated HTML pages with inline JSON-LD
- Description: The deployed frontend CSP allows `'unsafe-inline'` for scripts and styles. This is broader than ideal and increases the blast radius of any future XSS issue or accidental inline injection.
- Why it matters: Even when no direct XSS is visible in the current code, a looser CSP weakens a valuable defense-in-depth control.
- Evidence:
  - `vercel.json` sets `script-src 'self' 'unsafe-inline'`
  - `frontend/admin-login` and `frontend/admin-dashboard` use inline redirect scripts
  - public pages also include inline JSON-LD blocks
- Reproduction steps if applicable:
  1. Review `vercel.json` CSP.
  2. Review generated HTML for inline script usage.
- Recommended fix: Narrow CSP over time by removing unnecessary inline script/style needs, using hashes/nonces where possible, and limiting exceptions to the pages that truly require them.
- Whether the fix is safe/simple or needs my approval first: Needs approval first because CSP changes can break functionality and SEO markup if done incorrectly.

### F12

- Title: Legal identity and hosting details look inconsistent with the deployment docs and require confirmation
- Severity: Medium
- Area: QA, Legal, SEO, Deployment
- Affected files: `frontend/mentions-legales.html`, `docs/deployment.md`, `scripts/build-site.mjs`, `vercel.json`
- Description: The legal page currently says the site is hosted by `Combell NV, Belgique`, while the deployment docs describe a `Vercel frontend` and `Render or Railway backend` setup. The docs also already flag the need to confirm the legal postal address, company registration number, and VAT number before launch.
- Why it matters: Legal/business identity mismatches are a production risk and can undermine compliance, credibility, and SEO trust signals.
- Evidence:
  - `frontend/mentions-legales.html:101,139` says `Combell NV, Belgique`
  - `docs/deployment.md:22-29` describes Vercel + Render/Railway style hosting
  - `docs/deployment.md:68` explicitly says to confirm legal postal address and registration/VAT data before launch
  - the legal page presents `Rue du Pasteur Noir 30, 6180 Courcelles` and BCE/VAT identifiers that were not independently verified in this audit
- Reproduction steps if applicable:
  1. Compare the legal page with the deployment notes.
  2. Confirm with the business owner which hosting and legal identity details are current.
- Recommended fix: Manually confirm the correct legal entity, address, BCE/KBO number, VAT number, and hosting provider text before any public launch or indexing.
- Whether the fix is safe/simple or needs my approval first: Needs approval first because it changes branding/legal identity content.

### F13

- Title: Inference: `robots.txt` and `sitemap.xml` may be omitted from the deployed Vercel artifact
- Severity: Low
- Area: SEO, Deployment
- Affected files: `vercel.json`, `scripts/build-site.mjs`, root `robots.txt`, root `sitemap.xml`
- Description: This is an inference from local configuration, not a live deployment verification. The build script writes `robots.txt` and `sitemap.xml` to the repo root, while `vercel.json` declares `outputDirectory: "frontend"`. If Vercel only serves the declared output directory contents, those root SEO files may not reach production.
- Why it matters: Missing `robots.txt` or `sitemap.xml` can slow discovery, weaken crawl guidance, and create SEO inconsistency.
- Evidence:
  - `vercel.json:3` sets `outputDirectory` to `frontend`
  - `scripts/build-site.mjs:1928-1929` writes `robots.txt` and `sitemap.xml` to the repo root, not `frontend/`
  - root `robots.txt` and `sitemap.xml` do exist locally
- Reproduction steps if applicable:
  1. Deploy the current configuration.
  2. Check `/robots.txt` and `/sitemap.xml` on the live domain.
  3. Confirm whether the served content matches the local root artifacts.
- Recommended fix: Verify the live deployment behavior. If needed, emit these files into `frontend/` as part of the build or adjust deployment packaging accordingly.
- Whether the fix is safe/simple or needs my approval first: Needs approval first because it changes build/deployment behavior.

### F14

- Title: Launch guardrails are thin: no CI/test/lint pipeline or explicit monitoring workflow was found
- Severity: Low
- Area: QA, SRE, Operations
- Affected files: `package.json`, `backend/package.json`, repo root
- Description: The repo exposes build, backend, Prisma, and seed scripts, but no project test script, lint script, CI workflow, or monitoring/alerting configuration was found.
- Why it matters: Production changes can regress core flows silently, and incidents can be harder to detect quickly.
- Evidence:
  - `package.json` has build and backend scripts only
  - `backend/package.json` has runtime and Prisma scripts only
  - no project `.github/workflows` pipeline was found
  - no dedicated tests outside dependency folders were found
- Reproduction steps if applicable:
  1. Inspect root and backend scripts.
  2. Inspect the repo for CI workflow/test configuration.
- Recommended fix: Add at least one automated smoke path for build + API validation, a lint/static check, and basic deployment monitoring/alerting.
- Whether the fix is safe/simple or needs my approval first: Safe/simple, though tool choice may need your preference.

### F15

- Title: A few large image assets are likely heavier than necessary for the current site
- Severity: Nice to have
- Area: Performance, SEO
- Affected files: `frontend/assets/img/navette-aeroport.jpg`, `frontend/assets/img/se.jpg`
- Description: The two largest image assets found in the generated frontend are noticeably heavier than the rest of the image set.
- Why it matters: Heavier images can slow first contentful paint and mobile performance, especially on service pages that depend on strong visual assets.
- Evidence:
  - `frontend/assets/img/navette-aeroport.jpg` ~934 KB
  - `frontend/assets/img/se.jpg` ~629 KB
- Reproduction steps if applicable:
  1. Review asset sizes in the generated frontend.
  2. Compare page weight impact on slower mobile connections.
- Recommended fix: Re-export or compress large hero/cover images and consider modern responsive variants where appropriate.
- Whether the fix is safe/simple or needs my approval first: Safe/simple.

## 5. Potentially Unused / Suspicious / Orphaned Items

Important: report only. Do not delete, modify, or clean up any of the items below without explicit user approval first. This is especially important for map-related files and assets.

- `frontend/assets/js/service-area.js`
  - Current HTML scan found no page including this script.
  - The file contains the note: `Replace these placeholder coordinates with the final approved GeoJSON polygon.`
  - Because this is map-related, it should not be touched without explicit approval.

- `frontend/assets/css/custom.css`
  - The `.service-area-*` and `.leaflet*` blocks appear to support a service-area map UI.
  - Current generated HTML scan found no `data-service-area-map` hook.
  - This looks like dormant or future map functionality, not safe cleanup material.

- Unreferenced images under `frontend/assets/img/person/`
  - Current repo scan found no references to:
  - `person-f-12.webp`
  - `person-f-14.webp`
  - `person-f-3.webp`
  - `person-f-4.webp`
  - `person-f-5.webp`
  - `person-f-8.webp`
  - `person-f-9.webp`
  - `person-m-12.webp`
  - `person-m-13.webp`
  - `person-m-6.webp`
  - `person-m-7.webp`
  - `person-m-9.webp`
  - These may still be intentional for future/testimonial/gallery use; do not remove without approval.

- `frontend/assets/img/sevice.jpg`
  - Current repo scan found no reference to this file.
  - The name also looks typo-like, which makes it suspicious, but it still requires approval before any change.

- `backend/backend/package.json` and `backend/backend/package-lock.json`
  - These point to a nested local package dependency (`"taxis-services-backend": "file:.."`) and are accompanied by a recursively nested `backend/backend/node_modules/...` structure in the workspace.
  - This looks like an accidental self-referential install artifact, but it must be treated as report-only until you approve any cleanup.

- `frontend/admin-login` and `frontend/admin-dashboard`
  - These extensionless redirect pages look intentional as alias/shortcut pages.
  - They should not be removed just because there are `.html` equivalents.

## 6. Questions / Approvals Needed From User Before Any Change

- Confirm the intended production API origin.
  - Should the frontend call the API on the same origin, or on a subdomain such as `https://api.taxis-services.be`?

- Confirm the legal and branding identity details.
  - Before any text changes, please confirm the correct legal address, BCE/KBO number, VAT number, and hosting provider wording.

- Confirm the intended retention/privacy policy.
  - Do you want bookings and contacts deleted, anonymized, or archived after service completion, and how should PMR/accessibility flags be handled?

- Confirm whether you want CAPTCHA enabled.
  - If yes, which provider do you want: Turnstile or hCaptcha, and should it be `optional` or `required`?

- Confirm whether auth/session behavior can be tightened.
  - Adjusting client-IP handling, cookies, CSP, or other security headers may affect login/admin behavior and should be approved first.

- Confirm whether any suspicious/orphaned items can be cleaned up.
  - Especially map-related files, `backend/backend/*`, redirect aliases, and any image assets.

## 7. Quick Wins I Can Approve One By One

- [ ] Rebuild/regenerate the frontend with the correct production `PUBLIC_API_BASE_URL`
- [ ] Replace raw forwarded-header IP parsing with trusted proxy-aware client IP handling
- [ ] Add real CAPTCHA widget/token handling before enabling CAPTCHA mode
- [ ] Align visible required markers with actual validation rules on all booking forms
- [ ] Make admin dashboard row selection keyboard accessible and add an `<h1>`
- [ ] Add a DB-aware readiness/health check
- [ ] Add pruning for stale `RateLimitBucket` rows and expired sessions
- [ ] Reconcile stale/unused runtime env vars in `backend/.env`
- [ ] Confirm and correct legal/hosting/company identity text
- [ ] Add at least a smoke-test / lint / CI baseline for build + API checks
- [ ] Optimize the two heaviest images used by the frontend

## 8. Manual Tests I Should Run Before Launch

- Test every public booking form on the real deployed domain and confirm the request goes to the intended production API, not localhost.
- Test the contact form on the real deployed domain and verify success, validation, and error states.
- Test admin login, dashboard load, logout, and re-login on the production domain pair you intend to use.
- Test admin PATCH and DELETE operations with and without the CSRF header to confirm protection is enforced.
- Test login and public form rate limits from repeated requests and confirm the limiter uses the real client IP path you expect.
- Test duplicate booking behavior with legitimate retry scenarios so real customers are not silently marked as spam.
- Test keyboard-only use of the admin dashboard, especially selecting bookings and contacts from the tables.
- Test screen-reader announcements and form error focus behavior on the public forms.
- Test mobile layouts on major breakpoints and a real phone for the contact/booking/admin pages you expect staff to use.
- Verify `Cache-Control` and `X-Robots-Tag` headers on `admin-login.html`, `admin-dashboard.html`, and `/api/admin/*` responses.
- Verify `/robots.txt` and `/sitemap.xml` on the live domain, not just locally.
- Verify canonical host redirects between `taxis-services.be`, `www.taxis-services.be`, and any legacy domains.
- Verify the legal page content against the actual company/legal identity and hosting arrangement.
- Verify what happens when the database is unavailable and confirm monitoring catches it.
- Verify how long bookings, contacts, and PMR/accessibility-related data remain in the database after service completion.

## 9. Positive Controls Already Present

- Admin passwords are hashed with `bcrypt`.
- Admin session cookies are opaque tokens; only token hashes are stored in the database.
- Admin mutating routes require a CSRF token.
- Admin API routes are protected with `no-store` response headers.
- Public/admin rate limiting exists and is centralized in PostgreSQL.
- `helmet` is enabled on the backend.
- Generated public/admin HTML pages already include title, description, and canonical metadata.
- Local static reference scan did not find broken internal `href` / `src` targets in the current generated frontend.
