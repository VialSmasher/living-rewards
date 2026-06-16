# Deployment

Living Rewards is split into two deploy targets:

- Vercel: frontend only, from `apps/web`
- Railway: API only, from `apps/api`

## Current MVP Resources

- GitHub repo: `VialSmasher/living-rewards`
- Vercel frontend project: `living-rewards-web`
- Public frontend URL: `https://web-tan-gamma-k3f1gnhc4u.vercel.app`
- Railway project: `focused-reverence`
- Railway API service: `@apps/api`
- Railway API URL: `https://appsapi-production-1a3d.up.railway.app`
- Supabase project: `living-rewards-mvp`
- Supabase project ref: `nokwsxptthflojccgeie`

The Railway service name is still `@apps/api`, but its source repo is `VialSmasher/living-rewards` on `main` and it deploys with the Living Rewards workspace commands. Rename the Railway service later if the dashboard supports it cleanly.

## Vercel Frontend

Use these settings when importing `VialSmasher/living-rewards` into Vercel:

- Framework preset: Vite
- Root directory: `apps/web`
- Install command: `npm install --include=dev`
- Build command: `npm run build`
- Output directory: `dist`

Do not use `npm install --prefix=../..` for this root-directory deploy. That can install dependencies at the repo root while Vercel runs the web build inside `apps/web`, which makes the `vite` binary unavailable.

Environment variables:

- `VITE_API_BASE_URL`: `https://appsapi-production-1a3d.up.railway.app/api`
- `VITE_SUPABASE_URL`: fresh Living Rewards Supabase URL, public
- `VITE_SUPABASE_ANON_KEY`: fresh Living Rewards Supabase anon key, public

For a frontend-only demo, `VITE_API_BASE_URL` can be omitted. The app will keep using local demo data if the API is unavailable.

## Railway API

Use these settings when creating the Railway service:

- Source repo: `VialSmasher/living-rewards`
- Branch: `main`
- Root directory: repo root
- Build command: `npm run build --workspace=@living-rewards/api`
- Start command: `npm run start --workspace=@living-rewards/api`

Environment variables:

- `DATABASE_URL`: fresh Living Rewards Supabase Postgres connection string
- `SUPABASE_URL`: fresh Living Rewards Supabase URL
- `SUPABASE_ANON_KEY`: fresh Living Rewards Supabase anon key
- `SUPABASE_JWT_SECRET`: fresh Living Rewards Supabase JWT secret
- `APP_ORIGIN`: Vercel frontend origin after deployment
- `DEMO_MODE`: `1` until real auth/persistence is ready

Do not deploy `apps/api` as a Vercel project for this MVP. Keep the API on Railway so server secrets stay server-side.

## Known Cleanup Items

- Vercel still has an unused `living-rewards-api` project from an early import attempt. It has no environment variables; remove it later after explicit approval.
- Vercel still has an older `level-cre-resident-loyalty-mvp` project from the mixed phase. It has public `VITE_*` variables only; remove it later after explicit approval.
- Supabase Auth still includes the old `https://level-cre-resident-loyalty-mvp.vercel.app/auth/callback` redirect URL alongside the new Living Rewards callback. Remove it after the new hosted URL is final.
- The current public Vercel alias is generated (`web-tan-gamma-k3f1gnhc4u.vercel.app`). Replace it with a cleaner Vercel/custom domain later, after explicit domain approval.
