# EnglishSoftware

Course project repository for an AI-assisted English learning platform.

This repository contains the main product application, product/design documents, planning materials, and demo-oriented feature work. The primary codebase is the `english-learn` app, which includes both the core study experience and the browser-based Game Center.

## What This Repository Contains

At a high level, this repo combines:

- a full Next.js application for English learning
- onboarding, placement, and four-skill learning flows
- AI-assisted practice features
- review, progress, discussion, and schedule-related modules
- a separate Game Center with quest-style educational gameplay
- product, design, and planning documentation used during development

## Main Application

The main product lives in:

- [english-learn](./english-learn)

That subdirectory is the application you should open if you want to:

- run the product locally
- inspect the app architecture
- work on frontend or backend features
- explore the game/quest module

## Documentation Map

### Application Docs

Start here for the actual product:

- [english-learn/README.md](./english-learn/README.md)
- [english-learn/docs/architecture.md](./english-learn/docs/architecture.md)
- [english-learn/docs/demo-guide.md](./english-learn/docs/demo-guide.md)

### Repository-Level Working Docs

Project-support materials live under:

- [docs/planning](./docs/planning)
- [docs/design](./docs/design)
- [docs/PO_work](./docs/PO_work)
- [docs/SM_work](./docs/SM_work)
- [docs/archive](./docs/archive)

These folders are useful for team process, design iteration, and historical reference. They are not the main product runtime.

## Repository Structure

```text
software/
├── english-learn/          # Main Next.js application
├── docs/                   # Planning, design, PO/SM work, archive
├── README.md               # Repository entry point
└── ...
```

## Main Tech Stack

Inside `english-learn/`, the primary stack includes:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Prisma + MySQL
- OpenAI-compatible AI integration
- Stripe
- PostHog
- Sentry

## Quick Start

From the repository root:

```bash
cd english-learn
npm install
cp .env.example .env.local
npm run dev
```

Then open:

- [http://localhost:3000](http://localhost:3000)

## Useful Commands

Run these inside [`english-learn`](./english-learn):

```bash
npm run dev
npm run test
npm run lint
npm run typecheck
```

## Recommended Reading Order

If you are new to the repository:

1. Read [english-learn/README.md](./english-learn/README.md)
2. Read [english-learn/docs/architecture.md](./english-learn/docs/architecture.md)
3. Read [english-learn/docs/demo-guide.md](./english-learn/docs/demo-guide.md)

## Notes

- The main GitHub homepage README is this file.
- The detailed app documentation now lives inside [`english-learn`](./english-learn).
- If you were previously looking for the updated long-form README on the repo homepage, it is now linked above and split into app-specific documents.
