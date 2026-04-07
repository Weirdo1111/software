# English Learn

An AI-assisted English learning platform for non-native speakers, built to feel like a real product rather than a worksheet app.

This repository combines structured learning flows, AI-powered practice, review systems, progress tracking, community features, and lightweight game-like quests such as **Midnight Library Escape**.

Authorship note: parts of the 2026 Buddy Campus home refresh were drafted with AI assistance and then reviewed, edited, and integrated by the project team.

## Overview

`English Learn` is designed for learners in roughly the **CEFR A1-B2** range and aims to balance:

- four-skill learning: listening, speaking, reading, writing
- onboarding and placement-based personalization
- practical AI feedback where it adds real value
- review, progress, and retention loops
- a more memorable demo layer through playful quest content

The product already includes:

- a learning hub
- listening and reading practice routes
- speaking and writing support
- onboarding and placement flows
- review and progress modules
- discussion and activity features
- pricing, auth, settings, dashboard, and admin routes
- a dedicated **Game Center** with a browser-based educational escape room

## Documentation Map

For a cleaner structure, detailed documentation now lives in `docs/`:

- [docs/architecture.md](./docs/architecture.md): system structure, feature organization, data layers, and engineering notes
- [docs/demo-guide.md](./docs/demo-guide.md): recommended demo flows, stage highlights, audience-specific storytelling, and presentation tips
- [docs/deployment.md](./docs/deployment.md): deployment, release, rollback, and demo evidence workflow
- [docs/seminar-rooms.md](./docs/seminar-rooms.md): seminar-room chat + live-call schema, routes, storage behavior, and extension notes

## Quick Start

### Prerequisites

- Node.js 20+
- npm
- a MySQL database if you want Prisma-backed flows locally
- Supabase credentials if you want Supabase-backed flows fully enabled

### Install

```bash
npm install
```

### Configure environment variables

```bash
cp .env.example .env.local
```

Then set env files like this:

- put team-shared development keys in `.env.development` and commit that file to GitHub if your team wants zero-manual-setup development
- put personal overrides in `.env.local`, which stays untracked

For this repo, `.env.development` is the right place for shared realtime bridge keys if you want teammates to clone and run `npm run dev` without adding them manually.

### Start the app

```bash
npm run dev
```

This command now starts both:

- the Next.js dev server
- the local realtime bridge used by AI dialogue and speaking test

Local URL:

- [http://localhost:3000](http://localhost:3000)

### Realtime bridge for AI dialogue and speaking test

`AI dialogue` and `Speaking Test` do not connect directly from Next.js to the upstream realtime provider. They require a separate local Python WebSocket bridge on each developer machine.

One-time setup:

```bash
npm run roleplay:bridge:setup
```

Then make sure the required realtime bridge keys exist in either `.env.development` or `.env.local`:

```bash
ROLEPLAY_DIALOG_APP_ID=
ROLEPLAY_DIALOG_ACCESS_KEY=
ROLEPLAY_DIALOG_APP_KEY=
```

If you want to run the bridge manually instead of using `npm run dev`:

```bash
npm run roleplay:bridge
```

Expected local bridge address:

- `ws://127.0.0.1:8877`

If `npm run dev` still cannot bring up realtime Connect on a teammate machine, the usual causes are:

- Python is not installed or the `py` launcher is unavailable
- `websockets` is not installed yet
- `ROLEPLAY_DIALOG_APP_ID`, `ROLEPLAY_DIALOG_ACCESS_KEY`, or `ROLEPLAY_DIALOG_APP_KEY` are missing in that machine's `.env.development` or `.env.local`

### Quality checks

```bash
npm run test
npm run lint
npm run typecheck
```

## Main Routes

### Product

- `/`
- `/learn`
- `/listening`
- `/reading`
- `/review`
- `/progress`
- `/dashboard`
- `/pricing`
- `/settings`

### Auth & Entry

- `/auth/sign-in`
- `/auth/sign-up`
- `/onboarding`
- `/placement-test`

### Community & Planning

- `/discussion`
- `/discussion/seminars`
- `/activity`
- `/schedule`

### Game Layer

- `/games`
- `/games/escape-room`
- `/quests/escape-room`

## Environment Variables

Key groups from `.env.example`:

### App

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database

```bash
DATABASE_URL="mysql://root:password@127.0.0.1:3306/english_learn"
```

### Supabase

```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET_SEMINARS=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Seminar Call Networking

```bash
NEXT_PUBLIC_SEMINAR_ICE_SERVERS=
```

Use a JSON array of ICE server entries when deploying seminar video calls outside local development, especially for Tencent Cloud or mainland-China traffic.

### AI Provider

```bash
AI_API_KEY=
AI_BASE_URL=
AI_MODEL=

OPENAI_API_KEY=
```

The app uses an **OpenAI-compatible** integration pattern, so you can swap compatible providers by changing the base URL and model.

### Stripe

```bash
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_MONTHLY=
STRIPE_PRICE_YEARLY=
```

### Analytics & Monitoring

```bash
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

SENTRY_ORG=
SENTRY_PROJECT=
```

## Core Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
npm run typecheck
npm run prisma:generate
npm run prisma:seed
npm run roleplay:bridge:setup
npm run roleplay:bridge
npm run audio:listening
npm run seed:listening
```

## Testing

The `tests/` directory already covers multiple domains, including:

- listening content
- reading content
- placement logic
- speaking prompt logic
- schedule import and image-template logic
- SRS helpers
- audio helpers
- escape-room puzzle logic

Run everything:

```bash
npm run test
```

Run one file:

```bash
npm test -- tests/escape-room-engine.test.ts
```

## Notes

- If external service keys are missing, some flows fall back to mock/demo-friendly behavior.
- Stripe webhook verification only works when `STRIPE_WEBHOOK_SECRET` is configured.
- The repository currently includes both **Supabase-backed** and **Prisma/MySQL-backed** pieces; see [docs/architecture.md](./docs/architecture.md) for the exact explanation.

## Recommended Reading Order

1. Start here in `README.md`
2. Read [docs/architecture.md](./docs/architecture.md) for technical understanding
3. Read [docs/demo-guide.md](./docs/demo-guide.md) if you want to present the product professionally
