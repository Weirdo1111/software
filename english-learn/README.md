# English Learn MVP

English learning web app for non-native speakers (CEFR A1-B2), implemented with Next.js + Supabase + OpenAI + Stripe.
The onboarding flow is skill-first: listening/speaking/reading/writing sessions come before optional placement test.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth, Postgres, Storage, RLS)
- OpenAI Responses API for speaking/writing feedback
- Stripe Checkout + webhook for subscription
- PostHog analytics + Sentry monitoring
- Vitest for unit testing

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Configure env

```bash
cp .env.example .env.local
```

Fill required keys in `.env.local`.

3. Run dev server

```bash
npm run dev
```

4. Run tests/lint/typecheck

```bash
npm run test
npm run lint
npm run typecheck
```

## Supabase SQL

1. Apply migration from [supabase/migrations/001_init.sql](supabase/migrations/001_init.sql)
2. Optional seed data from [supabase/seed.sql](supabase/seed.sql)

## Routes

- `/` Home
- `/learn` Four-skill learning hub
- `/auth/sign-in`, `/auth/sign-up`
- `/onboarding`
- `/placement-test`
- `/dashboard`
- `/lesson/[id]`
- `/review`
- `/progress`
- `/pricing`
- `/settings`
- `/admin`

## API Endpoints

- `POST /api/onboarding`
- `POST /api/placement/start`
- `POST /api/placement/submit`
- `GET /api/plan/today`
- `POST /api/attempts`
- `POST /api/ai/feedback/speaking`
- `POST /api/ai/feedback/writing`
- `GET /api/progress/summary?range=7d|30d`
- `POST /api/subscription/checkout`
- `POST /api/webhooks/stripe`
- `POST /api/auth/sign-up`
- `POST /api/auth/sign-in`

## Notes

- If env keys are missing, APIs return mock fallback values to keep local demo runnable.
- Stripe webhook endpoint validates signature only when `STRIPE_WEBHOOK_SECRET` is configured.
- Supabase RLS is enabled for user-owned tables.
