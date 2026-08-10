# Class Event Tracker

A lightweight, responsive web app for schools that gives students a rolling **7-day view** of scheduled class events. System **Admins** manage classes and user accounts; **Class Managers** maintain event schedules for their assigned class, tagging events with color badges (exam, homework, announcement, etc.).

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Neon DB (PostgreSQL)**, **Drizzle ORM**, and **Auth.js (NextAuth v5)**.

---

## Features

- **Rolling 7-day schedule** for every class, computed client-side with local dates (timezone-correct)
- **Color-coded events** — blue, red, green, yellow, purple — each with a label + description
- **Public read-only view** — no sign-in required to browse schedules
- **Role-based access control**
  - **Admin** — manage classes, provision users, view/edit any class schedule, preview as a manager
  - **Class Manager** — create/edit/delete events, but **only** for their assigned class
- **Admin dashboard** — Class Management + User Provisioning side by side, Global Event Overview below, with an admin / manager-preview toggle
- **Dark mode** (system + manual toggle)
- **Secure auth** — credentials via Auth.js v5 (JWT sessions), bcrypt-hashed passwords, edge-guarded `/admin` route

---

## Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Framework  | Next.js 16 (App Router), React 19, Turbopack  |
| Language   | TypeScript                                    |
| Styling    | Tailwind CSS v4, `next-themes`                |
| Database   | Neon DB (serverless PostgreSQL)               |
| ORM        | Drizzle ORM (`@neondatabase/serverless`)      |
| Auth       | Auth.js / NextAuth v5 (beta), JWT strategy    |
| Validation | Zod                                           |
| Utilities  | `date-fns`, `clsx`, `tailwind-merge`, `lucide-react` |

> **Note:** This project targets Next.js 16, which has breaking changes vs. earlier versions — notably `proxy.ts` (formerly `middleware.ts`) and async route params. See `node_modules/next/dist/docs/` for the current guides.

---

## Architecture

The app follows a **layered architecture with composition-root dependency injection** so that each layer only depends on interfaces, never on concrete implementations:

```
Route Handlers (src/app/api/**)      → thin HTTP layer
   ↓
Controllers (src/server/controllers) → parse/validate input, translate errors to JSON
   ↓
Managers (src/server/managers)       → business logic + RBAC checks
   ↓
Repositories (src/server/repositories) → Drizzle queries
   ↓
Database (src/db/schema.ts)
```

- **Contracts live in `src/server/interfaces/`** — separate interfaces for every repository and manager.
- **Composition root in `src/server/container.ts`** — wire everything together in one place.
- **Domain types in `src/domain/`** — shared entities (roles, events, DTOs) used across layers.
- **Guards in `src/server/guards.ts` + `src/auth/helpers.ts`** — every mutation re-verifies the actor's role and class ownership server-side (never trust the UI).

### Database schema

- **`users`** — email, password hash, role (`admin` / `class_manager`), assigned class (single FK, nullable)
- **`classes`** — name, description
- **`events`** — title, description, color enum, event date (`YYYY-MM-DD`), FK to class; indexed on `(class_id, event_date)`

---

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- A Neon PostgreSQL database (free tier works)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable        | Description                                              |
| --------------- | -------------------------------------------------------- |
| `DATABASE_URL`  | Neon HTTP connection string (`postgresql://…sslmode=require`) |
| `AUTH_SECRET`   | Auth.js secret — generate with `npx auth secret`         |
| `ADMIN_EMAIL`   | Email of the initial admin (seeded)                      |
| `ADMIN_PASSWORD`| Password of the initial admin (seeded)                   |

### 3. Set up the database

```bash
npm run db:push   # create tables + enums from the schema
npm run db:seed   # idempotently create the initial admin account
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Default admin login** (after seeding): the email/password you set in `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

---

## Scripts

| Command            | Description                                   |
| ------------------ | --------------------------------------------- |
| `npm run dev`      | Start the dev server (Turbopack)              |
| `npm run build`    | Production build                              |
| `npm start`        | Run the production build                      |
| `npm run lint`     | ESLint                                        |
| `npx tsc --noEmit` | Type check                                    |
| `npm run db:push`  | Push Drizzle schema to the database           |
| `npm run db:seed`  | Seed the initial admin (idempotent)           |

---

## API Reference

All endpoints return JSON; errors use `{ "error": { "code", "message" } }`.

### Classes

| Method | Path                 | Auth     | Description                      |
| ------ | -------------------- | -------- | -------------------------------- |
| GET    | `/api/classes`       | Public   | List classes                     |
| POST   | `/api/classes`       | Any user | Create a class                   |
| PATCH  | `/api/classes/[id]`  | Any user | Update a class                   |
| DELETE | `/api/classes/[id]`  | Any user | Delete a class (cascades events) |

### Events

| Method | Path                          | Auth     | Description                        |
| ------ | ----------------------------- | -------- | ---------------------------------- |
| GET    | `/api/classes/[id]/events?from&to` | Public | List events for a date range |
| POST   | `/api/events`                 | Any user | Create an event (manager: own class only) |
| PATCH  | `/api/events/[id]`            | Any user | Update an event (manager: own class only) |
| DELETE | `/api/events/[id]`            | Any user | Delete an event (manager: own class only) |

### Users (admin only)

| Method | Path                      | Auth  | Description            |
| ------ | ------------------------- | ----- | ---------------------- |
| GET    | `/api/admin/users`        | Admin | List users             |
| POST   | `/api/admin/users`        | Admin | Create a user          |
| PATCH  | `/api/admin/users/[id]`   | Admin | Update role / class / password |
| DELETE | `/api/admin/users/[id]`   | Admin | Delete a user          |

### Auth

| Method | Path                     | Description                |
| ------ | ------------------------ | -------------------------- |
| ANY    | `/api/auth/[...nextauth]` | Auth.js endpoints (sign in / session / csrf / callback) |

---

## Roles & Permissions

| Action                     | Public | Class Manager | Admin |
| -------------------------- | :----: | :-----------: | :---: |
| View any class schedule    | ✅     | ✅            | ✅    |
| Create / edit / delete events | ❌   | Own class only| ✅    |
| Create / edit / delete classes | ❌ | ❌            | ✅    |
| Provision users (create/edit/delete) | ❌ | ❌   | ✅    |
| Access `/admin`            | ❌     | ❌            | ✅    |

---

## Project Structure

```
src/
├── app/                    # App Router pages + API routes
│   ├── api/
│   │   ├── admin/users/    # user provisioning endpoints
│   │   ├── auth/[...nextauth]/  # Auth.js route handler
│   │   ├── classes/        # class + events-by-class endpoints
│   │   └── events/         # event CRUD endpoints
│   ├── admin/page.tsx      # admin dashboard
│   ├── login/page.tsx      # sign-in page
│   └── page.tsx            # public / manager home (7-day schedule)
├── auth/                   # Auth.js config, helpers (getCurrentUser, requireAdmin…)
├── components/             # UI primitives, auth, events, admin, theme
├── config/env.ts           # zod-validated environment
├── db/                     # schema, client, seed
├── domain/                 # shared entities + DTOs
├── lib/                    # api client, colors, dates, cn()
├── server/
│   ├── container.ts        # composition root
│   ├── controllers/        # HTTP layer
│   ├── interfaces/         # repository + manager contracts
│   ├── managers/           # business logic + RBAC
│   ├── repositories/       # Drizzle data access
│   ├── validations/        # zod schemas
│   ├── errors.ts           # AppError + factories
│   └── guards.ts           # RBAC assertions
├── types/                  # module augmentation for Auth.js
└── proxy.ts                # edge middleware (guards /admin)
```

---

## Deployment

### Vercel

1. Push this repository to GitHub and import it in Vercel.
2. Add the `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` environment variables.
3. Set the build command to `npm run build`.
4. After first deploy, run `npm run db:push` and `npm run db:seed` against your Neon database (locally, against the same `DATABASE_URL`).

### Database

Neon DB handles the Postgres side; no migration runner is required at runtime — the schema is pushed via Drizzle Kit.

---

## Security Notes

- `.env` is **never committed** — it's ignored by `.gitignore` (`.env*`).
- Passwords are hashed with `bcryptjs`; never stored in plain text.
- Every mutation endpoint re-checks the session role **and** class ownership server-side.
- `/admin` is guarded at the edge (`src/proxy.ts`); unauthenticated requests are redirected to `/login`.

---

## License

Not specified. Contact the repository owner for usage rights.
