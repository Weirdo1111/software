# English Learn

An AI-assisted English learning platform for non-native speakers, designed to feel more like a real product than a worksheet app.

This repository combines structured study flows, AI-powered practice, review systems, progress tracking, community discussion, and lightweight game-like quests such as **Midnight Library Escape**. The target experience is practical, demo-friendly, and flexible enough for rapid iteration.

## What This Project Is

`English Learn` is a Next.js application for learners in roughly the **CEFR A1-B2** range.

The core product direction is:

- help users study through the four major skills: listening, speaking, reading, and writing
- personalize the journey through onboarding and placement
- provide AI-assisted feedback where it actually matters
- keep motivation high with review systems, progress views, discussion, and playful quest content

This repo is not only a lesson app. It already includes:

- a four-skill learning hub
- onboarding and placement-test flows
- AI speaking and writing support
- listening and reading practice libraries
- review cards and spaced repetition style flows
- schedule/import tools
- discussion and context-comment features
- pricing, auth, settings, dashboard, and admin entry points
- a separate **Game Center** with a browser-based 2D educational escape room

## Why It Feels Different

Instead of treating English learning as a single linear course, this project mixes:

- structured curriculum
- guided practice
- authentic-content style activities
- AI feedback loops
- light game mechanics for demo-day engagement

That is why the repo contains both serious learning routes and more playful modules like `/games` and `/quests/escape-room`.

## Product Experience Map

Typical user journey:

1. Sign up or sign in
2. Finish onboarding
3. Take an optional placement test
4. Enter the learning hub
5. Practice through listening, reading, speaking, and writing
6. Review mistakes and cards
7. Track progress and plan
8. Join discussion and activity spaces
9. Explore the Game Center for quest-style English challenges

## Current Feature Areas

### Learning Core

- `/learn`: central hub for the four-skill experience
- `/listening`, `/listening/practice`, `/listening/ted`: listening-focused routes
- `/reading`, `/reading/[id]`: reading library and article views
- `/lesson/[id]`: lesson detail route
- `/review`: review and practice follow-up
- `/progress`: progress and performance summary

### AI-Assisted Practice

- speaking feedback flows
- writing prompt and language-bank support
- AI prompt logic and client wrappers in [`lib/ai`](./lib/ai)
- OpenAI-compatible provider integration with configurable base URL and model

### Platform & Retention

- onboarding flow
- placement-test flow
- pricing and subscription setup
- dashboard, settings, admin
- activity and discussion routes
- context comments and schedule-related features

### Game / Demo Layer

- `/games`: Game Center
- `/games/escape-room`: immersive game route
- `/quests/escape-room`: quest entry route
- `components/escape-room`: modular browser-game implementation with scene hotspots, modals, clue logic, dialogue rules, timer, rewards, and stage data

## Tech Stack

### Frontend

- **Next.js 16** with App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**

### AI / Content

- **OpenAI-compatible API** client support
- configurable AI model and base URL
- local prompt utilities and domain-specific prompt builders

### Data & Backend

- **Supabase**
  - auth
  - SSR helpers
  - SQL migrations for several app domains
- **Prisma + MySQL**
  - currently used in the Prisma schema for discussion-related and local-auth style tables

### Payments / Analytics / Monitoring

- **Stripe**
- **PostHog**
- **Sentry**

### Quality

- **Vitest**
- **ESLint**
- **TypeScript noEmit typecheck**

## Architecture Overview

This codebase is organized around feature modules rather than a single monolithic service layer.

### App Router UI Layer

The `app/` directory contains route-level entry points for:

- home, auth, dashboard, pricing, settings
- learning experiences
- reading and listening routes
- API routes
- games and quest pages

### Reusable Component Layer

The `components/` directory is split by feature:

- `components/home`
- `components/learn`
- `components/listening`
- `components/reading`
- `components/review`
- `components/discussion`
- `components/schedule`
- `components/escape-room`

This keeps product-specific UI close to the domain it serves.

### Domain Logic Layer

The `lib/` directory contains the project’s reusable business logic:

- AI clients and prompts
- listening/reading content repositories
- speaking and writing helpers
- schedule import and image template logic
- SRS helpers
- auth helpers
- Supabase and Prisma utilities

### Data Layer Reality

This repo currently reflects an evolving product, so there are **two persistence tracks**:

- `supabase/` migrations and seed files for parts of the app that are tied to Supabase-managed flows
- `prisma/` schema and seed logic for MySQL-backed features currently represented in Prisma

That means the README should be honest: this is not a perfectly unified backend yet. It is a product-in-progress with real features shipped in parallel.

## Project Structure

```text
english-learn/
├── app/                    # App Router pages, layouts, API routes
├── components/             # Feature-based UI modules
│   ├── escape-room/        # Game Center + educational escape room system
│   ├── listening/
│   ├── reading/
│   ├── discussion/
│   ├── review/
│   └── ...
├── lib/                    # Domain logic, AI utilities, repositories, helpers
├── prisma/                 # Prisma schema and seed
├── public/                 # Static assets, game art, audio, images
├── scripts/                # One-off content and media generation scripts
├── supabase/               # SQL migrations and seed files
├── tests/                  # Vitest test suites
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+
- npm
- a MySQL database if you want Prisma-backed flows to work locally
- Supabase project credentials if you want auth/storage-backed flows to work fully

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Then fill in `.env.local`.

Important:

- replace demo/shared values with your own credentials before using the project seriously
- do not rely on checked-in sample values for production or team distribution

### 3. Start the dev server

```bash
npm run dev
```

The app runs at:

- [http://localhost:3000](http://localhost:3000)

### 4. Run quality checks

```bash
npm run test
npm run lint
npm run typecheck
```

## Environment Variables

The repository already includes an `.env.example`. These are the main groups you should understand.

### App / Runtime

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database / Prisma

```bash
DATABASE_URL="mysql://root:password@127.0.0.1:3306/english_learn"
```

### Supabase

```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### AI Provider

```bash
AI_API_KEY=
AI_BASE_URL=
AI_MODEL=

OPENAI_API_KEY=
```

The app is built around an **OpenAI-compatible** setup, so you can point it at compatible providers by changing the base URL and model.

### Stripe

```bash
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_MONTHLY=
STRIPE_PRICE_YEARLY=
```

### Analytics / Monitoring

```bash
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

SENTRY_ORG=
SENTRY_PROJECT=
```

## Database Setup Notes

### Supabase SQL

Apply the SQL migrations in:

- [`supabase/migrations`](./supabase/migrations)

Optional seed data:

- [`supabase/seed.sql`](./supabase/seed.sql)

### Prisma

Prisma is configured against MySQL in:

- [`prisma/schema.prisma`](./prisma/schema.prisma)

Generate Prisma client:

```bash
npm run prisma:generate
```

Seed Prisma-backed data:

```bash
npm run prisma:seed
```

## Scripts You Will Actually Use

### Core

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
npm run typecheck
```

### Prisma

```bash
npm run prisma:generate
npm run prisma:seed
```

### Listening Content Utilities

```bash
npm run audio:listening
npm run seed:listening
```

## Key Routes

### Core Product

- `/` Home
- `/dashboard`
- `/pricing`
- `/settings`
- `/admin`

### Auth & Entry

- `/auth/sign-in`
- `/auth/sign-up`
- `/login`
- `/register`
- `/onboarding`
- `/placement-test`

### Learning

- `/learn`
- `/lesson/[id]`
- `/listening`
- `/listening/practice`
- `/listening/ted`
- `/reading`
- `/reading/[id]`
- `/review`
- `/progress`

### Community / Activity

- `/discussion`
- `/activity`
- `/schedule`
- `/posts/[id]`

### Game / Quest

- `/games`
- `/games/escape-room`
- `/quests/escape-room`

## API Surface

Current visible routes include:

- `POST /api/onboarding`
- `POST /api/attempts`
- `POST /api/review-cards`
- `POST /api/context-comments`
- `POST /api/auth/sign-up`
- `POST /api/auth/sign-in`

The app also contains additional route handlers under `app/api/` that can be extended per feature.

## Demo Paths Worth Showing First

If you are demoing the project to a reviewer, teacher, investor, or teammate, start with these:

### Product Story Demo

1. `/`
2. `/learn`
3. `/listening/practice`
4. `/reading`
5. `/progress`

### Engagement / Retention Demo

1. `/discussion`
2. `/schedule`
3. `/review`

### Demo Day / Fun Layer

1. `/games`
2. `/games/escape-room`

That last route is especially useful when you want to show the project is not just academically functional, but also memorable and interactive.

## Testing

The `tests/` directory already covers multiple domains, including:

- listening libraries and materials
- placement logic
- reading content
- speaking prompts and AI-related helpers
- schedule import and image-template logic
- SRS logic
- audio helpers
- escape-room puzzle engine

Run the full suite:

```bash
npm run test
```

Run a single file:

```bash
npm test -- tests/escape-room-engine.test.ts
```

## Operational Notes

- If required external keys are missing, parts of the app fall back to mock or demo-friendly behavior so local development can continue.
- Stripe webhook signature validation only works when `STRIPE_WEBHOOK_SECRET` is configured.
- PostHog and Sentry are integrated but should be configured explicitly per environment.
- Some product areas are already polished for demos, while others are still infrastructure-forward.

## Honest Repository Notes

This repo is already interesting, but it also clearly shows an MVP growing in real time. That means:

- some features are highly productized
- some backend pieces evolved in parallel
- not every system is fully unified yet

That is not a weakness if documented clearly. In fact, it helps collaborators understand where the project is:

- **strong enough to demo**
- **modular enough to extend**
- **still open to cleanup and consolidation**

## Suggested Next README Improvements

If you want to make this repo look even more polished later, the next upgrades should be:

1. add screenshots or GIFs for the home page, learning hub, and Game Center
2. add an architecture diagram for frontend, AI services, Supabase, Prisma, Stripe, and analytics
3. add a contributor section with branching, PR, and environment conventions
4. add deployment instructions for Vercel + Supabase + Stripe webhooks
5. add a short roadmap for listening, speaking, quests, and community features

---

If you want, I can do the next step too:

- add a **much more polished README with screenshots sections and badges**
- or write a **Chinese + English bilingual README**
- or split this into `README.md` + `docs/architecture.md` + `docs/demo-guide.md`
