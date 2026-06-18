# Living Rewards

Living Rewards is a standalone resident loyalty and property operations MVP for multifamily landlords.

The product is separate from LevelCRE. It reuses proven UI and architecture patterns, but this repository is intended to have its own:

- GitHub repo;
- Vercel frontend project;
- Railway API service;
- Supabase Postgres/Auth/Storage project.

## What It Does

The MVP rewards residents for operationally useful behaviours:

- better maintenance requests with photos;
- access confirmations;
- notice acknowledgements;
- move-in readiness;
- early renewal interest;
- on-time rent streak habits.

The landlord value proposition is fewer manager follow-ups, cleaner operating records, better resident communication, and earlier renewal visibility.

## Current Routes

- `/` public product landing page
- `/property-ops` residential/commercial property operations cockpit
- `/resident-loyalty` manager/product demo
- `/resident-loyalty/resident-demo` resident wallet demo
- `/resident-loyalty/setup` landlord onboarding and resident lifecycle demo
- `/api/health` API health check
- `/api/resident-loyalty/*` resident loyalty demo/persistence endpoints
- `/api/resident-loyalty/commercial/*` commercial PM pilot persistence endpoints

## Local Development

```bash
npm install
npm run dev
```

The API defaults to demo mode when `DEMO_MODE=1` or when no database is configured.

## Environment Variables

Use `.env.example` as the starting point. Do not commit real secrets.

Frontend public variables:

- `VITE_API_BASE_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Backend secret variables:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_JWT_SECRET`
- `LIVING_REWARDS_SERVICE_TOKEN`

## Deployment Notes

Current MVP resources:

- GitHub: `VialSmasher/living-rewards`
- Vercel frontend: `living-rewards-web`
- Public frontend URL: `https://web-tan-gamma-k3f1gnhc4u.vercel.app`
- Railway API: `https://appsapi-production-1a3d.up.railway.app`
- Supabase project: `living-rewards-mvp`

For the clean split:

1. Create a fresh Supabase project for Living Rewards.
2. Run `drizzle/0013_resident_loyalty_core.sql` against the fresh database.
3. Run `drizzle/0014_commercial_property_ops.sql` against the fresh database.
4. Create a fresh Railway service from `apps/api`.
5. Configure backend secrets only in Railway.
6. Create a fresh Vercel project from `apps/web`.
7. Set `VITE_API_BASE_URL` to the new Railway API base URL.

No LevelCRE Railway, Vercel, or Supabase project should be used for this app.
