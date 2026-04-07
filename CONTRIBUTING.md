# Contributing

This repository is assessed on both product progress and agile delivery evidence. Every meaningful change should leave a clear GitHub trail:

`Issue -> Project status -> branch -> commits -> pull request -> review + CI -> merge`

## Working Agreement

1. Start with an issue.
   - Capture the goal, why it matters, acceptance criteria, owner, priority, and estimate.
   - Put the issue on the project board before coding.
2. Keep the project board truthful.
   - `Backlog`: not ready for the current sprint.
   - `Ready`: refined and ready to start.
   - `In progress`: an owner is actively implementing it.
   - `In review`: PR is open and waiting on review or fixes.
   - `Done`: merged, verified, and demo-ready.
3. Use one short-lived branch per issue.
   - Recommended naming: `feat/123-short-name`, `fix/123-short-name`, `chore/123-short-name`.
4. Prefer small, readable commits.
   - Good: `feat(reading): add progress summary card`
   - Avoid: `fix`, `debug`, `UI change`, `Add files via upload`
5. Open a draft PR early.
   - Link the issue in the PR body with `Closes #123` or `Refs #123`.
   - Keep the PR summary, testing notes, and risk notes up to date.
6. Merge through PRs.
   - Do not push normal feature work directly to `main`.

## Definition Of Done

An item should only move to `Done` when all of the following are true:

- the issue is linked to the implementation PR
- the project board status is current
- `npm run lint` passes
- `npm run typecheck` passes
- `npm test` passes
- `npm run build` passes
- the PR has been reviewed
- any user-facing doc or demo note impacted by the change is updated
- the change is merged through a pull request

## Local Quality Checks

Run these inside [`english-learn`](/tmp/software-kanban-main/english-learn):

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Sprint Rhythm

- Before a sprint: refine issues, split large stories, set owner and estimate, fill in board status.
- During the sprint: branch from the issue, commit in small steps, keep the board updated, open draft PRs early.
- Before merge: request review, wait for CI, respond to feedback, verify the acceptance criteria.
- End of sprint: close delivered issues, update the project board, publish a demo or release note, and record follow-up work as new issues.

## Deployment And Demo Evidence

- Keep deployment steps in [deployment.md](/tmp/software-kanban-main/english-learn/docs/deployment.md).
- When a public demo is available, add the URL to the relevant issue, PR, release note, and sprint demo material.
