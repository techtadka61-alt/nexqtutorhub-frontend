# NexTutorHub — Frontend

Next.js (App Router) frontend for NexTutorHub, a local home-tuition marketplace connecting
students/parents with verified tutors.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind CSS v4 (theme defined in `src/app/globals.css`)

## Getting started

1. Copy the environment file and point it at your running backend:

   ```bash
   cp .env.example .env.local
   ```

2. Install dependencies and start the dev server (the backend runs on port 3000, so the frontend
   defaults to 3001 in local development):

   ```bash
   npm install
   npm run dev -- -p 3001
   ```

3. Open [http://localhost:3001](http://localhost:3001).

The backend must be running (`npm run start:dev` in `../Backend`) for auth, signup, profile and
search features to work.

## Project structure

- `src/app/(marketing)` — public site: home, how it works, for tutors, about, contact
- `src/app/(auth)` — login, signup, email verification, forgot/reset password
- `src/app/(account)` — logged-in area for students and tutors (profile, overview)
- `src/components/ui` — shared design-system primitives (Button, Input, Select, Card, …)
- `src/components/marketing` / `auth` / `account` / `layout` — feature-specific components
- `src/lib/api` — typed API client modules per backend module (auth, profile, tutors)
- `src/context/auth-context.tsx` — client-side auth state, token refresh, route protection

## Notes

- `/dashboard` is reserved for a future admin panel and is not implemented here.
- Google sign-in is shown in the UI for a familiar auth layout but is not wired up — the backend
  has no OAuth endpoint yet.
