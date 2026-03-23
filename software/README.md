# EnglishSoftware

Course project repository for an academic English learning platform.

## Repository Layout

```text
EnglishSoftware/
|-- english-learn/              # Next.js application source code
|-- docs/
|   |-- course-materials/       # Course PDFs and reference materials
|   |-- planning/               # Project plans, checklists, and team docs
|   |-- design/
|   |   |-- ui-prototypes/      # UI mockups and prototype notes
|   |   `-- module-design/      # Speaking and writing module materials
|   `-- archive/                # Kept for reference, not part of the main structure
`-- README.md
```

## Where The Code Is

The application code is in [english-learn](./english-learn).

Main tech stack:

- Next.js 16
- TypeScript
- Tailwind CSS
- Supabase
- OpenAI API
- Stripe

## How To Run The Project

1. Open a terminal in the project root.
2. Enter the app directory:

```powershell
cd english-learn
```

3. Install dependencies:

```powershell
npm install
```

4. Create a local environment file:

```powershell
New-Item .env.local -ItemType File
```

At minimum, you can set:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

If you want full functionality, also configure Supabase, OpenAI, Stripe, PostHog, and Sentry keys in `.env.local`.

5. Start the development server:

```powershell
npm run dev
```

6. Open:

```text
http://localhost:3000
```

## Useful Commands

Run these inside `english-learn/`:

```powershell
npm run test
npm run lint
npm run typecheck
```

## Notes

- The app can still demonstrate many pages and flows without full backend configuration.
- Some API routes fall back to mock data when external services are not configured.
- Detailed app-specific notes are in [english-learn/README.md](./english-learn/README.md).
