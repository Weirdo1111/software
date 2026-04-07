# Deployment Guide

This guide exists to make deployment and demo readiness visible in the repository, not just in chat messages.

## Deployment Goal

Keep `main` stable enough to support:

- preview deployments for feature review
- a demo-ready production deployment
- a repeatable release routine that can be audited in GitHub

## Recommended Environments

- `Preview`: every reviewable feature branch or pull request
- `Production`: the current sprint demo build from `main`

For this stack, a practical setup is:

- frontend/app hosting on Vercel
- managed MySQL for Prisma-backed data
- Supabase for auth/storage features that depend on it

## Required Environment Variables

Set the values documented in [`../README.md`](/tmp/software-kanban-main/english-learn/README.md), especially:

- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY` or the equivalent OpenAI-compatible provider variables
- Stripe, PostHog, and Sentry variables if those features are enabled

## Pre-Deployment Checklist

Before deploying, make sure:

- the issue is linked to a pull request
- the project board status is current
- `npm run lint` passes
- `npm run typecheck` passes
- `npm test` passes
- `npm run build` passes
- database migrations or seed expectations are documented
- any new environment variables are recorded in the README or PR notes

## Preview Deployment Flow

1. Open or update a pull request from a short-lived branch.
2. Confirm the branch has the right environment variables configured in the hosting platform.
3. Trigger the preview deployment.
4. Smoke-test the core routes:
   - `/`
   - `/learn`
   - `/discussion/seminars`
   - `/games`
   - `/games/escape-room`
5. Add the preview URL to the PR description if it is useful for review.

## Production Release Flow

1. Merge only after review and green CI.
2. Deploy from `main`.
3. Run a smoke test on the production/demo URL.
4. Record the release in GitHub with:
   - a release note or sprint demo note
   - the live URL
   - any known limitations or follow-up issues

## Smoke Test Checklist

- home page loads without a runtime error
- login and onboarding entry points render
- at least one learning flow route works
- seminar/discussion entry loads
- game center and escape room routes load
- any feature touched in the merged PR behaves as expected

## Rollback Plan

If a deployment fails:

1. revert the offending PR or redeploy the previous stable commit
2. move the linked issue back to `In progress` or `Ready`
3. open a bug issue with reproduction steps and rollback notes
4. document the incident in the PR or release note so the repo tells the truth

## Evidence To Keep In GitHub

For course assessment, make the deployment trail visible:

- link deployment URLs in PRs or release notes
- keep `Basic Live Deployment` updated on the project board
- create a release or sprint demo note for each demoable milestone
