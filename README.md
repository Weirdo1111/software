# EnglishSoftware

Course project repository for an academic English learning platform.

## Repository Layout

```text
EnglishSoftware/
|-- english-learn/              # Next.js application source code
|-- docs/                       # Planning, design, and team documents
`-- README.md
```

## Where The Code Is

Main application code is in [english-learn](./english-learn).

## How To Run

1. Open terminal at repository root.
2. Enter app directory:

```powershell
cd english-learn
```

3. Install dependencies:

```powershell
npm install
```

4. Create env file:

```powershell
New-Item .env.local -ItemType File
```

Minimum:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Start dev server:

```powershell
npm run dev
```

6. Open <http://localhost:3000>

## Useful Commands

Run inside `english-learn/`:

```powershell
npm run test
npm run lint
npm run typecheck
```

## App Notes

- Stack: Next.js 16, TypeScript, Tailwind CSS, Supabase, OpenAI API, Stripe
- App-specific docs are in [english-learn/README.md](./english-learn/README.md)
- Listening MVP route: `/lesson/A2-listening-starter`
