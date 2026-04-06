# Deployment Notes

## Architecture

- Frontend: static marketing site generated into `frontend/`
- Backend: Express API in `backend/`
- Database: PostgreSQL managed by Neon or Supabase
- ORM: Prisma
- Admin auth: HTTP-only JWT cookie + CSRF header

## Local setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `DATABASE_URL` to a local or hosted Postgres database.
3. Run `npm --prefix backend install`.
4. Run `npm --prefix backend run prisma:migrate:dev`.
5. Run `npm --prefix backend run db:seed`.
6. Run `npm --prefix backend run dev`.
7. In a second terminal, set `PUBLIC_API_BASE_URL=http://localhost:4000` and run `npm run build`.
8. Serve `frontend/` with any static server.

## Vercel frontend

- Build command: `npm run build`
- Output directory: `frontend`
- Environment variable: `PUBLIC_API_BASE_URL=https://api.your-domain.com`
- Keep `admin-login.html` and `admin-dashboard.html` noindexed.

## Render or Railway backend

- Root directory: `backend`
- Build command: `npm install && npm run prisma:generate`
- Start command: `npm run prisma:migrate:deploy && npm run start`
- Set all variables from `backend/.env.example`

## Database

- Create a PostgreSQL database on Neon or Supabase.
- Set `DATABASE_URL` in the backend environment.
- Run the committed migration with `npm run prisma:migrate:deploy`.
- Seed the first admin with `npm run db:seed`.

## Auth and domains

- Recommended production setup:
  - Frontend: `www.your-domain.com`
  - API: `api.your-domain.com`
- Recommended cookie settings for that setup:
  - `COOKIE_DOMAIN=.your-domain.com`
  - `COOKIE_SECURE=true`
  - `COOKIE_SAME_SITE=lax`
- If you keep unrelated preview domains like `*.vercel.app` and `*.onrender.com`, cross-site admin cookies are less reliable. Use custom domains for production.

## Known content issue

- Confirm the legal postal address, company registration number, and VAT number shown on the legal page still match `Taxis Services` before production launch.
