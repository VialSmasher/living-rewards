# Deployment

Living Rewards is split into two deploy targets:

- Vercel: frontend only, from `apps/web`
- Railway: API only, from `apps/api`

## Vercel Frontend

Use these settings when importing `VialSmasher/living-rewards` into Vercel:

- Framework preset: Vite
- Root directory: `apps/web`
- Install command: `npm install --include=dev`
- Build command: `npm run build`
- Output directory: `dist`

Do not use `npm install --prefix=../..` for this root-directory deploy. That can install dependencies at the repo root while Vercel runs the web build inside `apps/web`, which makes the `vite` binary unavailable.

Environment variables:

- `VITE_API_BASE_URL`: Railway API URL when available, for example `https://<service>.up.railway.app/api`
- `VITE_SUPABASE_URL`: fresh Living Rewards Supabase URL, public
- `VITE_SUPABASE_ANON_KEY`: fresh Living Rewards Supabase anon key, public

For a frontend-only demo, `VITE_API_BASE_URL` can be omitted. The app will keep using local demo data if the API is unavailable.

## Railway API

Use these settings when creating the Railway service:

- Source repo: `VialSmasher/living-rewards`
- Root directory: `apps/api`
- Build command: `npm install --include=dev && npm run build`
- Start command: `npm run start`

Environment variables:

- `DATABASE_URL`: fresh Living Rewards Supabase Postgres connection string
- `SUPABASE_URL`: fresh Living Rewards Supabase URL
- `SUPABASE_ANON_KEY`: fresh Living Rewards Supabase anon key
- `SUPABASE_JWT_SECRET`: fresh Living Rewards Supabase JWT secret
- `APP_ORIGIN`: Vercel frontend origin after deployment
- `DEMO_MODE`: `1` until real auth/persistence is ready

Do not deploy `apps/api` as a Vercel project for this MVP. Keep the API on Railway so server secrets stay server-side.
