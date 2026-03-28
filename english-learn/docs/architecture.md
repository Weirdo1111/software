# Architecture Guide

## Purpose

This document explains how `English Learn` is structured at the engineering level: what lives where, how major product surfaces are organized, and what technical realities a contributor should understand before making substantial changes.

## High-Level Product Shape

The app is not a single-feature language tool. It is a multi-surface learning platform with these major layers:

- learning core
- AI-assisted practice
- retention and review
- community and activity
- planning/schedule support
- game-like demo content

This is why the repository contains both conventional study routes and a more cinematic browser-game module.

## Application Layers

## 1. Route Layer: `app/`

The `app/` directory contains App Router entry points for:

- home and marketing-adjacent pages
- auth routes
- onboarding and placement flows
- learning routes
- activity/discussion/planning routes
- games and quests
- API route handlers

Examples:

- `/app/learn/page.tsx`
- `/app/listening/page.tsx`
- `/app/reading/page.tsx`
- `/app/discussion/page.tsx`
- `/app/games/page.tsx`
- `/app/games/escape-room/page.tsx`
- `/app/quests/escape-room/page.tsx`

The route layer should stay thin where possible. Feature logic belongs in components and `lib/`.

## 2. UI Layer: `components/`

Components are organized by product domain rather than by primitive type.

Main feature folders include:

- `components/home`
- `components/learn`
- `components/listening`
- `components/reading`
- `components/review`
- `components/discussion`
- `components/schedule`
- `components/escape-room`

This structure matters because the product is already broad. Feature-based grouping makes iteration faster and reduces the risk of turning the codebase into a single generic component bucket.

### Escape Room Subsystem

`components/escape-room` is effectively a mini-product inside the product.

It includes:

- game container and routing glue
- scene rendering
- hotspot components
- modal puzzle flows
- dialogue rules
- puzzle state engine
- timer and ranking helpers
- game center stage data

This subsystem is intentionally modular because it mixes UI state, puzzle logic, and scene-level interaction.

## 3. Logic Layer: `lib/`

The `lib/` directory contains reusable domain logic and integration helpers.

Important areas:

- `lib/ai`: AI client and prompt utilities
- listening repositories and materials helpers
- reading repositories and content helpers
- speaking and writing helpers
- schedule import logic and image-template helpers
- SRS helpers
- environment and runtime helpers
- analytics and monitoring utilities
- Supabase and Prisma wrappers

Good rule:

- if code is reusable across routes or features, it probably belongs in `lib/`
- if code is mostly presentation and feature-local, it belongs in `components/`

## Data Layer Reality

This repository currently reflects a product under active evolution, not a fully unified platform.

There are **two persistence tracks**:

### Supabase Track

Used for parts of the application that benefit from:

- auth
- SSR-friendly session flows
- SQL-managed product tables
- storage-style web-app integration

Relevant files:

- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `supabase/migrations/`
- `supabase/seed.sql`

### Prisma + MySQL Track

Used for the Prisma-backed schema currently defined in:

- `prisma/schema.prisma`

At the moment, the Prisma schema clearly covers discussion-style and user-linked relational tables.

This means contributors should not assume the app is purely Supabase-native or purely Prisma-native.

## Engineering Implication

When touching backend logic, confirm first:

1. is this feature Supabase-managed?
2. is this feature Prisma/MySQL-managed?
3. is it currently mock/local and not fully persisted yet?

That check prevents a lot of confusion.

## Feature Domains

## Learning Core

Primary routes:

- `/learn`
- `/lesson/[id]`
- `/listening`
- `/listening/practice`
- `/listening/ted`
- `/reading`
- `/reading/[id]`
- `/review`
- `/progress`

These routes represent the main educational product layer.

## AI-Assisted Practice

The AI layer is built around an OpenAI-compatible client pattern.

This is important because it allows:

- OpenAI usage directly
- compatible providers through alternate base URLs
- rapid switching during experimentation or course-project constraints

Relevant files:

- `lib/ai/client.ts`
- `lib/ai/prompts.ts`
- `lib/speaking-ai.ts`
- `lib/writing-prompts.ts`
- related speaking/writing modules

## Game Center / Quest Layer

The game layer is intentionally separate from the main study flow.

Routes:

- `/games`
- `/games/escape-room`
- `/quests/escape-room`

Design intent:

- keep the main product academically credible
- allow the game layer to have its own stronger visual language
- make demo-day storytelling more memorable

Current game implementation:

- browser-based 2D scene
- no heavy engine
- hotspot + modal architecture
- local puzzle engine
- AI-style librarian dialogue with mock rules
- timer, rewards, and stage selection

## Repository Structure

```text
english-learn/
├── app/
├── components/
│   ├── discussion/
│   ├── escape-room/
│   ├── home/
│   ├── learn/
│   ├── listening/
│   ├── reading/
│   ├── review/
│   └── schedule/
├── data/
├── lib/
├── prisma/
├── public/
├── scripts/
├── supabase/
├── tests/
└── types/
```

## Important Static Assets

Examples already present in `public/`:

- scene art
- game audio
- quest visuals
- standard site assets

The escape room in particular relies on:

- scene backgrounds
- local audio files
- cover art used by the Game Center

## Scripts and Runtime Utilities

Relevant scripts from `package.json`:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run typecheck
npm run prisma:generate
npm run prisma:seed
npm run audio:listening
npm run seed:listening
```

Use these as the baseline quality loop:

1. `npm run lint`
2. `npm run test`
3. `npm run typecheck`

## Testing Strategy

The repository already includes test coverage for multiple domains, not just one feature.

Representative test groups:

- listening libraries and materials
- placement logic
- reading passages
- speaking prompt and attempt helpers
- schedule import utilities
- SRS logic
- WAV/audio helpers
- escape room puzzle engine

This is a useful signal: the codebase is not only UI-driven. There is meaningful logic extracted into testable units.

## Design Principles Visible in the Codebase

Several patterns are worth preserving:

- feature-based component grouping
- extracted domain logic in `lib/`
- pure-function style puzzle logic where possible
- modular UI for game systems instead of giant single-file components
- demo-friendly fallbacks when services are unavailable

## Current Technical Truths

Be honest about these:

- the system is substantial, but still evolving
- persistence is not fully consolidated into one backend model
- some modules are product-polished, others are still infrastructure-forward
- demo-readiness is already strong, but architecture cleanup is still a future opportunity

This is exactly the kind of repo that benefits from clear docs, because clarity is what turns “promising MVP” into “credible product in progress.”

## Recommended Next Technical Docs

If you want the docs set to feel even more professional later, add:

1. `docs/deployment.md`
2. `docs/contributing.md`
3. `docs/env-reference.md`
4. `docs/game-system.md`
5. a simple architecture diagram
