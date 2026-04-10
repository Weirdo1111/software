# Final Release Notes

## Release Summary

`English Learn` is the final submission snapshot of an AI-assisted English learning platform for non-native university students. The product is designed to combine core language practice with planning, discussion, progress tracking, and lightweight quest-based engagement in a single web application.

This release should be read together with:

- [`../README.md`](../README.md)
- [`architecture.md`](./architecture.md)
- [`demo-guide.md`](./demo-guide.md)
- [`deployment.md`](./deployment.md)

## Delivered Product Areas

The repository currently includes evidence of the following product areas in the main application:

- onboarding and placement-oriented entry flows
- listening, reading, speaking, and writing practice routes
- review, progress, and dashboard experiences
- discussion and seminar-room collaboration features
- browser-based game and quest content, including the escape-room flow
- pricing, authentication, settings, and admin-facing routes

## Delivery Evidence In This Repository

This repository preserves both code and process evidence. Reviewers can inspect:

- the application in [`../`](../)
- workflow guidance in [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md)
- issue and PR templates in [`../../.github`](../../.github)
- CI checks in [`../../.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- project tracking via the public GitHub project board

## Quality Expectations

The repository-level workflow is set up so that changes to the main application are expected to pass:

- `npm run lint`
- `npm run build`
- `npm run typecheck`
- `npm test`

These commands run inside [`english-learn`](../).

## Operational Notes

- Local development expects a standard Next.js + Node.js workflow.
- Some product areas depend on external configuration such as database credentials, Supabase keys, Stripe keys, analytics keys, and AI provider keys.
- AI dialogue and speaking-test flows also rely on the local realtime bridge documented in [`../README.md`](../README.md).

## Known Scope Boundaries

- This release note describes the repository state and documented handoff materials, not a promise that every optional integration is configured on every machine by default.
- Demo readiness still depends on the environment setup described in the app README and deployment guide.

## Suggested Review Path

For a fast walkthrough, review in this order:

1. [`../README.md`](../README.md)
2. [`demo-guide.md`](./demo-guide.md)
3. [`architecture.md`](./architecture.md)
4. [`deployment.md`](./deployment.md)
