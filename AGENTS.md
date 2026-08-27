<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Class Event Tracker — agent notes

## Commands

- `npm run dev` — dev server (Turbopack).
- `npm run typecheck` — `tsc --noEmit`. **There is no test script.** Verify with `typecheck` + `lint` + `build`.
- `LayoutProps` / `PageProps` are generated types (`next typegen`, run automatically by `next build`/`next dev`). If `tsc` reports them missing, run `npx next typegen` first.
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`).
- `npm run db:push` — push Drizzle schema to DB. `npm run db:seed` — idempotent admin seeding. `npm run db:studio` — Drizzle Studio.

## Next.js 16 quirks (already a breaking-change repo)

- Edge middleware lives in **`src/proxy.ts`**, not `middleware.ts`. Guarding `/admin` is done there.
- Route handlers receive `params` as a **Promise** (await it). This differs from older Next.js — check `node_modules/next/dist/docs/`.
- Tailwind is **v4** (`@tailwindcss/postcss`, no `tailwind.config.js`); styling is via `@import` in `src/app/globals.css`.

## Environment & DB gotchas

- There is **no `.env.example`** despite the README telling you to `cp .env.example .env`. You must create `.env` yourself with `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- `npm run db:seed` loads env via the `tsx --env-file=.env` flag (not dotenv). A `.env` file must exist for it to run.
- `drizzle.config.ts` calls `getEnv()` and validates **all** env vars via zod. So even `db:push` needs a complete `.env`, not just `DATABASE_URL`.
- `src/config/env.ts` (`getEnv()`) is the single source of truth for env shape; reuse it instead of reading `process.env` directly.

## Architecture (follow this layered pattern)

```
app/api/** (route handlers) → server/controllers → server/managers (RBAC) → server/repositories (Drizzle) → db/schema.ts
```

- **Composition root: `src/server/container.ts`** wires every layer. Add new dependencies there, not inline.
- **Contracts live in `src/server/interfaces/`** — one interface per repository and manager. Implement against the interface.
- **`src/server/guards.ts` + `src/auth/helpers.ts`** enforce RBAC server-side on every mutation; never trust the UI. `getCurrentUser` / `requireAdmin` come from `src/auth/helpers.ts`.
- **`src/domain/`** holds shared types/DTOs. **`src/server/validations/`** holds the zod (v4) schemas.
- Auth is Auth.js v5 (beta), JWT strategy; config in `src/auth/config.ts`.

## Other

- Events pass through `src/lib/content-filter.ts`; flagged content is stored via `flagged-events` repository/manager (moderation flow).
- Product spec: `PRD.md`. Dev quickstart + API reference: `README.md`.
- `CLAUDE.md` simply `@AGENTS.md` — keep guidance here, not there.
