# English Learn

> AI-assisted English learning platform for non-native university students, combining four-skill practice, study planning, seminar collaboration, and browser-based quest learning in one cohesive product.

`Final submission` · `Primary app: english-learn` · `Main branch protected` · `CI: lint + build + typecheck + test`

This repository is designed to show both the product and the team's delivery process. The main application lives in [`english-learn`](./english-learn), while the surrounding docs, templates, workflows, and project board preserve the engineering and agile evidence behind the final submission.

## Project Links

| Link | Purpose |
| --- | --- |
| [`english-learn/README.md`](./english-learn/README.md) | App overview, routes, environment setup, and feature notes |
| [`english-learn/docs/architecture.md`](./english-learn/docs/architecture.md) | System structure, module boundaries, and implementation notes |
| [`english-learn/docs/demo-guide.md`](./english-learn/docs/demo-guide.md) | Recommended walkthrough for demos and presentations |
| [`english-learn/docs/deployment.md`](./english-learn/docs/deployment.md) | Deployment, release, rollback, and submission evidence |
| [`english-learn/docs/release-notes.md`](./english-learn/docs/release-notes.md) | Final release summary and suggested review path |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Team workflow, PR expectations, and Definition of Done |
| [`docs/SM_work/final-retrospective.md`](./docs/SM_work/final-retrospective.md) | Closing retrospective on process, evidence, and lessons learned |
| <https://github.com/users/Weirdo1111/projects/2> | Public GitHub project board |

## Project Status

| Item | Current state |
| --- | --- |
| Course phase | Final hand-in snapshot |
| Product scope | Academic English learning, feedback, planning, discussion, and game-based practice |
| Workflow evidence | Issues, project board, PR process, CI, deployment guide, and contribution policy |
| Quality gate | `lint`, `build`, `typecheck`, and `test` documented at repository level |
| Default application | [`english-learn`](./english-learn) |

## Product Snapshot

| Item | Details |
| --- | --- |
| Product focus | Academic English practice, study guidance, and engagement-driven learning |
| Primary experience | Listening, speaking, reading, writing, review, progress, discussion, and quests |
| Delivery evidence | GitHub project board, issue templates, PR workflow, CI, and deployment guide |
| Team workflow | [`CONTRIBUTING.md`](./CONTRIBUTING.md) |

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Application | TypeScript, App Router, server/client hybrid flows |
| Data | Prisma, MySQL, Supabase |
| AI | OpenAI-compatible APIs, AI-assisted feedback features |
| Realtime | Local Python bridge for dialogue and speaking flows |
| Payments and analytics | Stripe, PostHog, Sentry |
| Quality | Vitest, ESLint, TypeScript, GitHub Actions |

## Core Experience

- onboarding and placement-based entry flows
- listening, speaking, reading, and writing practice
- review, progress, dashboard, and scheduling features
- discussion and seminar-style collaboration routes
- browser-based educational game and quest content

## Quick Start

```bash
cd english-learn
npm install
cp .env.example .env.local
npm run dev
```

Open:

- <http://localhost:3000>

## Quality Gate

Run these inside [`english-learn`](./english-learn):

```bash
npm run lint
npm run build
npm run typecheck
npm test
```

## Repository At A Glance

```text
software/
├── english-learn/          # Main Next.js application
├── docs/                   # Planning, design, PO/SM work, archive
├── .github/                # CI, issue templates, PR template
├── CONTRIBUTING.md         # Team workflow and Definition of Done
└── README.md               # Repository homepage
```

## Documentation

- [`english-learn/README.md`](./english-learn/README.md): product overview, routes, env vars, app-level setup
- [`english-learn/docs/architecture.md`](./english-learn/docs/architecture.md): system structure and engineering notes
- [`english-learn/docs/demo-guide.md`](./english-learn/docs/demo-guide.md): recommended demo path and presentation highlights
- [`english-learn/docs/deployment.md`](./english-learn/docs/deployment.md): deployment, release, rollback, and demo evidence
- [`english-learn/docs/release-notes.md`](./english-learn/docs/release-notes.md): final release summary, scope, and review path
- [`english-learn/docs/seminar-rooms.md`](./english-learn/docs/seminar-rooms.md): seminar-room data flow and extension notes
- [`docs/SM_work/final-retrospective.md`](./docs/SM_work/final-retrospective.md): final retrospective and process reflections
- [`docs/planning`](./docs/planning), [`docs/design`](./docs/design), [`docs/PO_work`](./docs/PO_work), [`docs/SM_work`](./docs/SM_work): project-process materials

## Contributing

We use the repository as both a product codebase and an agile delivery record.

1. Create or refine an issue first.
2. Move the issue on the GitHub project board.
3. Work on a short-lived branch and open a PR.
4. Pass CI before merge.
5. Merge through PRs instead of pushing feature work directly to `main`.

Full workflow expectations live in [`CONTRIBUTING.md`](./CONTRIBUTING.md).
