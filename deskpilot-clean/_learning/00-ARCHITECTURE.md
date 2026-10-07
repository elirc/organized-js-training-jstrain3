# DeskPilot Architecture Guide

## 1) What This App Is
DeskPilot is a support-ticket web app. Agents create tickets, change status, post public replies or
internal notes, and read a per-ticket timeline. Customers use a portal token to submit tickets and
reply, without an account.

Stack, from `package.json`: Next.js 14.2.28 (App Router), React 18, TypeScript, Tailwind. There are
**no other runtime dependencies**: no database driver, no Drizzle, no auth library, no test runner.
`npm run lint` is the only quality script.

What exists today:
- Ticket list with status/priority/text filters, ticket detail, new-ticket form
- Status transitions guarded by a rule table
- Comments (public or internal) and a merged comment/event timeline
- Customer list and profile
- Reports page with counts by status/priority
- Customer portal (token in the URL) for listing, creating, and replying to tickets

What is a stub: login (`src/app/(auth)/login/page.tsx` just links to `/tickets`), settings
(`src/app/settings/page.tsx` shows badges only), notifications (`src/app/api/notifications/route.ts`
returns `[]`; `.../read/route.ts` returns `{ updated: true }`), the event stream (heartbeat only), and
the worker (`worker/index.js` is one `console.log`).

---

## 2) High-Level Data Flow
All data lives in one JSON file, `data/deskpilot.json`, created from `src/lib/seed-data.ts` on first
read (`src/lib/store.ts:21-28`). `/data/` is gitignored.

```text
Browser
  -> Server Component page (reads the store directly)      e.g. src/app/tickets/[id]/page.tsx
  -> Client Component (fetch to /api/*)                     e.g. src/components/tickets/TicketActions.tsx
       -> Route handler: requireUser + parse/validate      e.g. src/app/api/tickets/[id]/transition/route.ts
       -> Domain/store function                             src/lib/state-machine.ts, src/lib/store.ts
            -> readDb(): read + JSON.parse the whole file
            -> mutate the in-memory object
            -> writeDb(): JSON.stringify + write the whole file
       <- { success: true, data } or { success: false, error: { code, message } }
  <- router.refresh() re-renders the Server Component
```

Two read paths exist side by side. Pages call `src/lib/store.ts` directly (they never go through
`/api/*`), while client components mutate through `/api/*`. The UI only calls five endpoints, all mutations: POST `/api/tickets`,
POST `/api/tickets/:id/comments`, POST `/api/tickets/:id/transition`, POST `/api/portal/tickets`,
and POST `/api/portal/tickets/:id/comments`. Every GET route, both PATCH routes, and POST
`/api/customers` have no caller in `src/`; exercise them with `curl`.

---

## 3) Request Lifecycle: an agent changes a ticket's status

1. `src/app/tickets/[id]/page.tsx:8-24` renders the ticket. It calls `requireUser`,
   `getTicketById`, `getCustomerById`, `getTimeline`, and `readDb` — five full reads and parses of
   the JSON file for one page view.
2. It renders `<TicketActions ticketId status>` (line 87).
3. `TicketActions` lists allowed targets from its **own copy** of the rule table
   (`src/components/tickets/TicketActions.tsx:12-19`).
4. On click it POSTs `{ nextStatus }` to `/api/tickets/:id/transition` (lines 31-35).
5. The route (`src/app/api/tickets/[id]/transition/route.ts`) calls `requireUser` (line 11), reads
   the body with `request.json()` (line 13), and validates with `parseTicketStatus` (line 14), returning
   `VALIDATION_ERROR` 400 on failure.
6. `transitionTicket` (`src/lib/state-machine.ts:20-60`) loads the ticket, rejects merged tickets,
   returns early if the status is unchanged, and checks `rules[ticket.status]` (line 36).
7. It then performs **two separate read-modify-write cycles**: `setTicketStatus` (store.ts:332-349)
   writes the status, then `addTransitionEvent` (store.ts:310-330) appends `ticket.status_changed`.
8. `TransitionError` becomes `TRANSITION_ERROR` 400; anything else becomes `INTERNAL_ERROR` 500
   (route lines 28-33).
9. The client calls `router.refresh()` (TicketActions.tsx:41), which re-runs step 1.

Route handlers and pages declare `params: Promise<{ id: string }>` and `await` it. That is the
Next.js 15 convention; on 14.2.28 `params` is a plain object, and `await` on a non-promise simply
returns it, so the code works either way.

---

## 4) Key Design Decisions

**Next.js App Router.** Pages and API routes in one codebase. The cost: you must know which code runs
on the server (`async` page components, everything in `src/lib`) and which ships to the browser
(files starting with `"use client"`, all in `src/components`).

**`src/lib` as the domain layer.** `store.ts`, `state-machine.ts`, and `validators.ts` hold the logic.
There is no repository interface; pages and routes import store functions directly. Some routes skip
the store functions entirely and edit `readDb()` output inline (`src/app/api/customers/route.ts:25-35`,
`src/app/api/customers/[id]/route.ts:32-47`).

**JSON file store.** No setup needed. The cost is correctness, not just scale: every mutation reads the
whole file, changes a copy, and writes the whole file back. `writeDb` serializes the *writes*
(store.ts:40-44) but not the *read-modify-write*, so concurrent requests lose updates. See
`03-PATTERNS.md`, finding 1, for a reproduction.

**Standard API envelope.** `ok(data, init)` and `fail(code, message, status = 400)` in
`src/lib/api.ts:3-15`. Every route uses them, with one gap: a malformed JSON body makes
`request.json()` throw before any `fail()` call, so the client gets Next's default 500 instead of the
envelope.

**Rule-table state machine.** `src/lib/state-machine.ts:4-11`. Every status except `closed` can move to
`closed`, `closed` can only reopen to `in_progress`, and no rule targets `open`, so a ticket can never
return to `open`.

---

## 5) Dependency Map

```text
src/app/**/page.tsx ──> src/lib/auth.ts ──> src/lib/store.ts ──> node:fs, src/lib/seed-data.ts
        │                                         ▲
        └──> src/components/** ──fetch──> src/app/api/** ──> src/lib/validators.ts
                                                     └──> src/lib/state-machine.ts ──┘
src/lib/types.ts is imported (type-only) by almost everything.
src/lib/api.ts is imported by every route handler.
```

`auth.ts` depends on `store.ts` because "the current user" is a lookup in the JSON file
(`src/lib/auth.ts:4-9`).

---

## 6) Folder Structure

- `src/app` — pages and route handlers; the folder tree is the URL tree. `(auth)` is a route group,
  so the login page is served at `/login`.
- `src/components/tickets`, `src/components/portal` — the five client components (forms and the
  transition picker).
- `src/lib` — types, seed data, store, state machine, validators, auth, API helpers.
- `src/lib/db/schema.ts` — a 4-line placeholder object, not a Drizzle schema.
- `worker/index.js` — a 2-line placeholder.
- `_learning/` — this curriculum; `_learning/guides/` has one guide per source file.

---

## 7) Environment & Infrastructure

**Development.** `npm install`, then `npm run dev`, then open `http://localhost:3000` (redirects to
`/tickets`, `src/app/page.tsx:3-5`). Delete `data/deskpilot.json` to reset to seed data.

**"Auth".** `requireUser()` always returns the seeded admin `sarah@acme.dev`
(`src/lib/auth.ts:4-17`). There is no session, cookie, or role check anywhere.

**Infrastructure files that are not wired up:**
- `docker-compose.yml` defines `app`, `worker`, `postgres`, and `redis`, but `app` and `worker` use
  `build: .` and the repository has no `Dockerfile`, so `docker compose up` cannot build them.
- `drizzle.config.ts` points at `./src/lib/db/schema.ts`, which exports a placeholder note, and
  `drizzle-kit` is not in `package.json`.
- This copy has no `.env.example` (the maintained repo's lists `DATABASE_URL`, `REDIS_URL`, `NEXTAUTH_*`, Google OAuth, and SMTP variables).
  Nothing in `src/` reads `process.env`.

Treat these as a description of an intended future architecture, not of the running app.

---

## 8) Quality Snapshot

Strengths (verified):
- One response envelope everywhere (`src/lib/api.ts`).
- String-literal unions for status, priority, and role (`src/lib/types.ts:1-13`), with runtime
  validators that mirror them (`src/lib/validators.ts`).
- Internal routes scope reads and writes by `orgId`.
- Comments are rendered as `bodyText` through React, which escapes it; nothing uses
  `dangerouslySetInnerHTML`.

Weaknesses (verified, details and file:line evidence in `03-PATTERNS.md`):
- Lost updates under concurrent requests (JSON read-modify-write).
- No authentication or authorization; `viewer` role exists but is never checked.
- Body validation gaps: unchecked `customerId` and `assigneeId`, unbounded `tags`, silent ignores in
  customer PATCH, unguarded `request.json()`.
- Portal trust-boundary issues: default demo token, token in URLs, hard-coded org, full internal
  ticket objects returned.
- Duplicated logic: the transition table, the portal-token lookup (three copies), and the report KPIs.
- No tests.
