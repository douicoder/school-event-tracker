# Complete Product Requirement Document (PRD)

## Project Title: Class Event Tracker

**Target Deployment Platform:** Vercel (Free Tier)

**Primary Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Neon DB (PostgreSQL), Drizzle ORM, Auth.js (NextAuth v5)

---

## 1. Executive Summary & Architecture Strategy

The **Class Event Tracker** is a lightweight, responsive web application hosted on **Vercel (Free Tier)**. It provides students with a rolling 7-day view of scheduled class events while empowering a single **System Admin** to manage classes and user accounts, and designated **Class Managers** to maintain event schedules for their assigned classes—including assigning **color badges/tags** to differentiate event types (e.g., exams, homework, announcements).

The application uses **Next.js (App Router)** with **Neon DB** (Serverless PostgreSQL) and **Drizzle ORM** to ensure full type-safety, rapid edge rendering, and zero-cost serverless operation.

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Free Tier)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Next.js 14+ App Router (TypeScript + Tailwind CSS)    │  │
│  │                                                       │  │
│  │  • Auth.js (NextAuth v5): Admin & Manager Auth        │  │
│  │  • Drizzle ORM: Type-safe SQL client                   │  │
│  └───────────────────────────┬───────────────────────────┘  │
└──────────────────────────────│──────────────────────────────┘
                               │ HTTP Driver (@neondatabase/serverless)
┌──────────────────────────────▼──────────────────────────────┐
│                    NEON DB (PostgreSQL)                     │
│   • users table (email, password_hash, role, class_id)     │
│   • classes table (id, name)                                │
│   • events table (id, class_id, event_date, title, color)   │
└─────────────────────────────────────────────────────────────┘

```

---

## 2. Tech Stack Specification

| Layer | Technology | Purpose & Vercel Free-Tier Compatibility |
| --- | --- | --- |
| **Framework** | **Next.js 14+ (App Router)** | Full-stack React framework with serverless API routes and edge compatibility. |
| **Language** | **TypeScript** | Strict end-to-end type safety for models, API responses, and DB queries. |
| **Styling** | **Tailwind CSS** | Utility-first CSS framework for clean, responsive layout design and color badge variants. |
| **Database** | **Neon DB (PostgreSQL)** | Serverless Postgres with HTTP driver; auto-scales to zero ($0/month). |
| **ORM** | **Drizzle ORM** | Lightweight, type-safe SQL builder with zero runtime overhead. |
| **Authentication** | **Auth.js / NextAuth v5** | Credentials-based auth handling session tokens and Role-Based Access Control (RBAC). |
| **Hosting** | **Vercel** | Git-integrated continuous integration with global edge distribution. |

---

## 3. User Roles & Permission Matrix

The application strictly enforces three distinct operational tiers.

| Capability / Action | System Admin *(Single Account)* | Class Manager | Student / Viewer *(No Login)* |
| --- | --- | --- | --- |
| Select class & view 7-day schedule | ✅ | ✅ | ✅ |
| Access Admin Management Dashboard (`/admin`) | ✅ | ❌ | ❌ |
| Switch view modes on demand (Admin / Manager / Viewer) | ✅ | ❌ | ❌ |
| Create new classes | ✅ | ❌ | ❌ |
| Provision user accounts (Managers / Viewers) | ✅ | ❌ | ❌ |
| Assign manager rights to specific classes | ✅ | ❌ | ❌ |
| Add / Edit / Delete events & select color tag | ✅ *(Any class)* | ✅ *(Assigned class only)* | ❌ |

---

## 4. Database Schema (Drizzle ORM Definitions)

```typescript
import { pgTable, text, timestamp, uuid, date, pgEnum } from 'drizzle-orm/pg-core';

// 1. Role Enum
export const roleEnum = pgEnum('role', ['admin', 'class_manager', 'viewer']);

// 2. Event Color Enum (Preset palette for UI consistency)
export const eventColorEnum = pgEnum('event_color', [
  'blue',    // General / Default
  'red',     // Exam / Urgent
  'green',   // Assignment / Due Date
  'yellow',  // Quiz / Lab
  'purple'   // Announcement / Event
]);

// 3. Classes Table
export const classes = pgTable('classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(), // e.g. "CS-101", "Class 10-A"
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Users Table (Admin & Managers)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').default('viewer').notNull(),
  assignedClassId: uuid('assigned_class_id').references(() => classes.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Events Table
export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  classId: uuid('class_id').references(() => classes.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  color: eventColorEnum('color').default('blue').notNull(), // Color category badge
  eventDate: date('event_date').notNull(), // ISO Date string: YYYY-MM-DD
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

```

---

## 5. Detailed Feature Specifications

### 5.1. Student / Public View (`/`)

* **No Authentication Required:** Anyone can access this view without logging in.
* **Class Dropdown Selector:** Fetches all registered classes from Neon DB.
* **Rolling 7-Day Grid:** Automatically generates 7 cards representing $Day_0$ (Today) through $Day_6$.
* **Color-Coded Event Display:** Renders events with their designated color badges (`blue`, `red`, `green`, `yellow`, `purple`).

### 5.2. Class Manager Workspace

* **Authenticated Access:** Login via `/login` using credentials provisioned by the Admin.
* **Class Boundary:** Automatically locked to their `assignedClassId` (or selectable if assigned to multiple).
* **Event Creation & Editing:** Action button **"+ Add Event"** present on day cards, opening a modal to set Title, Description, and Color Badge.

### 5.3. Admin Luxury Suite (`/admin`) & Role Switcher

* **Single Admin System:** Seeded via environment execution (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).
* **View Mode Switcher:** Admin toolbar with a toggle/dropdown allowing the Admin to switch active preview modes:
* `[ Mode: Admin Control ]` – Full management power.
* `[ Preview As: Class Manager ]` – Test manager capabilities for any selected class.
* `[ Preview As: Student ]` – See the exact read-only experience public users see.


* **Class Management Module:** Interface to create, rename, or delete academic classes.
* **User Provisioning Engine:** Form to register accounts, set initial passwords, select roles, and bind managers to specific classes.

---

## 6. App Layout Wireframes

### 6.1. Student / Public View Wireframe (No Login Required)

```
+-----------------------------------------------------------------------------------+
|  🎓 Class Event Tracker          [ Select Class: CS-101 v ]       [ Manager Login ] |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|   Viewing schedule for: CS-101                                                    |
|                                                                                   |
|  +------------+  +------------+  +------------+  ...  +------------+             |
|  |   TODAY    |  |  TOMORROW  |  |   AUG 12   |       |   AUG 16   |             |
|  |   Mon 10   |  |   Tue 11   |  |   Wed 12   |       |   Sun 16   |             |
|  |------------|  |------------|  |------------|       |------------|             |
|  | 🔴 EXAM    |  | NO EVENTS  |  | 🟢 DUE     |       | NO EVENTS  |             |
|  | Midterm    |  |   ---      |  | Lab #3     |       |   ---      |             |
|  | Chapter 1-4|  |            |  | Submit online      |            |             |
|  |            |  |            |  |            |       |            |             |
|  | 🔵 EVENT   |  |            |  |            |       |            |             |
|  | Review Session          |  |            |       |            |             |
|  +------------+  +------------+  +------------+       +------------+             |
|                                                                                   |
|  *(Read-only view. Click on any event card to view full description modal)*       |
+-----------------------------------------------------------------------------------+

```

---

### 6.2. Class Manager View Wireframe (Logged In)

```
+-----------------------------------------------------------------------------------+
|  🎓 Class Event Tracker    [ Class: CS-101 (Assigned) ]   [ Manager: alex@app ] [Logout]|
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +------------+  +------------+  +------------+  ...  +------------+             |
|  |   TODAY    |  |  TOMORROW  |  |   AUG 12   |       |   AUG 16   |             |
|  |   Mon 10   |  |   Tue 11   |  |   Wed 12   |       |   Sun 16   |             |
|  |------------|  |------------|  |------------|       |------------|             |
|  | 🔴 EXAM    |  | NO EVENTS  |  | 🟢 DUE     |       | NO EVENTS  |             |
|  | Midterm    |  |   ---      |  | Lab #3     |       |   ---      |             |
|  | [Edit][x]  |  |            |  | [Edit][x]  |       |            |             |
|  |            |  |            |  |            |       |            |             |
|  | + Add Event|  | + Add Event|  | + Add Event|       | + Add Event|             |
|  +------------+  +------------+  +------------+       +------------+             |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  MODAL: Add Event to Mon Aug 10 (CS-101)                                          |
|  -------------------------------------------------------------------------------  |
|  Title:       [ Midterm Exam                       ]                              |
|  Description: [ Chapters 1 through 4 covered           ]                              |
|  Color Tag:   (🔵 Blue)  (🔴 Red)  (🟢 Green)  (🟡 Yellow)  (🟣 Purple)           |
|  [ Cancel ]                                                    [ Save Event ]     |
+-----------------------------------------------------------------------------------+

```

---

### 6.3. System Admin View Wireframe (With Role Switcher)

```
+-----------------------------------------------------------------------------------+
|  ⚡ ADMIN PANEL  |  [ Active View Mode: ⚙️ Admin Control v ]  [ admin@app ] [Logout] |
|                  |  | ⚙️ Admin Control                   |                        |
|                  |  | 👁️ Preview as Class Manager       |                        |
|                  |  | 🌐 Preview as Public Student       |                        |
|                  +---------------------------------------+                        |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +-------------------------------------+  +------------------------------------+  |
|  | 📁 Class Management                 |  | 👤 User Provisioning               |  |
|  |-------------------------------------|  |------------------------------------|  |
|  | Add New Class:                      |  | Create User Account:               |  |
|  | [ Class Name (e.g., CS-102) ]       |  | Email:    [ manager2@app.com    ] |  |
|  | [ Description (optional)  ]       |  | Password: [ ****************    ] |  |
|  | [ + Create Class ]                  |  | Role:     [ Class Manager     v ]  |  |
|  |                                     |  | Assign to:[ CS-101             v ]  |  |
|  | Existing Classes:                   |  | [ + Create & Assign User ]         |  |
|  | • CS-101 (Manager: alex@app) [Edit] |  |                                    |  |
|  | • MATH-201 (Unassigned)      [Edit] |  | Existing Users:                    |  |
|  | • PHYS-101 (Manager: sam@app)  [Edit] |  | • alex@app (Manager -> CS-101)     |  |
|  +-------------------------------------+  +------------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | 🗓️ Global Event Overview (Select Class: [ CS-101 v ])                         |  |
|  |-----------------------------------------------------------------------------|  |
|  | [7-Day Schedule Grid rendered here with full override privileges for Admin] |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+

```

---

## 7. TypeScript Interfaces & Color Map

```typescript
export type UserRole = 'admin' | 'class_manager' | 'viewer';
export type EventColor = 'blue' | 'red' | 'green' | 'yellow' | 'purple';

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  assignedClassId?: string | null;
}

export interface DaySchedule {
  date: Date;
  dateKey: string; // "YYYY-MM-DD"
  dayName: string; // e.g., "Monday"
  isToday: boolean;
  events: Array<{
    id: string;
    title: string;
    description?: string;
    color: EventColor;
  }>;
}

// Tailwind Color Utility Mapping
export const COLOR_VARIANTS: Record<EventColor, { bg: string; text: string; border: string }> = {
  blue:   { bg: 'bg-blue-100 dark:bg-blue-950',   text: 'text-blue-800 dark:text-blue-200',   border: 'border-blue-500' },
  red:    { bg: 'bg-red-100 dark:bg-red-950',     text: 'text-red-800 dark:text-red-200',     border: 'border-red-500' },
  green:  { bg: 'bg-green-100 dark:bg-green-950', text: 'text-green-800 dark:text-green-200', border: 'border-green-500' },
  yellow: { bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-800 dark:text-amber-200', border: 'border-amber-500' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-500' },
};

```

---

## 8. Deployment & Environment Variable Checklist

Configure the following variables in your **Vercel Project Settings**:

```env
# Neon Database HTTP Connection String
DATABASE_URL="postgres://user:password@ep-cool-db-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Auth.js / NextAuth Configuration
NEXTAUTH_SECRET="your-generated-32-byte-secret"
NEXTAUTH_URL="https://your-app.vercel.app"

# Initial Admin Seeding (Used during initial migration)
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="super-secure-password"

```