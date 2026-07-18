# DeskPilot Architecture Guide

## 1) What This App Is
DeskPilot is a support-ticket web app for internal support teams and end customers. Agents use it to create tickets, update status, post comments, and track ticket history. Customers use a portal token to submit tickets and reply without a full user account flow.

### Who it is for
- Support agents/admins (internal app)
- Customers (portal pages + portal API routes)

### What it does
- Ticket lifecycle management
- Comment thread per ticket
- Basic state-machine transitions
- Customer profiles and ticket history
- Reporting overview (basic KPIs)
- Portal submission and replies

---

## 2) High-Level Data Flow
This project currently uses a JSON file store (`data/deskpilot.json`) instead of a real database runtime. The app is still structured as if it were a standard layered web system:

1. UI page/component triggers request
2. Next.js route handler validates + authorizes
3. Route calls domain/store logic in `src/lib/*`
4. Store reads/writes JSON file and returns typed objects
5. Route returns standard API envelope
6. UI updates (server refresh or navigation)

---

## 3) Architecture Diagram

```mermaid
flowchart TD
  U[Browser User] --> P[Next.js App Router Pages]
  P --> C[Client Components]
  C -->|fetch| R[Route Handlers /api/*]
  P -->|server call| R

  R --> A[Auth Helper requireUser]
  R --> V[Validators]
  R --> S[State Machine]
  R --> D[Store Layer]
  S --> D

  D --> J[(data/deskpilot.json)]
  D --> Seed[Seed Data bootstrap]

  R --> Resp[JSON Response {success,data|error}]
  Resp --> C
  Resp --> P
```

ASCII alternative:

```text
Browser
  -> Next.js Page / Client Component
  -> /api route
     -> auth + validation
     -> state-machine/store
     -> JSON file data store
  <- API envelope response
  <- UI render/refresh
```

---

## 4) Typical Request Lifecycle (Example: “Agent transitions ticket status”)

Example path:
- UI: `src/components/tickets/TicketActions.tsx`
- API: `src/app/api/tickets/[id]/transition/route.ts`
- Domain: `src/lib/state-machine.ts`
- Store: `src/lib/store.ts`

Step-by-step:
1. Agent opens ticket detail page.
2. `TicketActions` renders allowed target statuses.
3. Agent clicks “Apply Transition.”
4. Component `fetch()` sends `POST /api/tickets/:id/transition` with `{ nextStatus }`.
5. Route reads JSON body and validates status via `parseTicketStatus`.
6. Route calls `transitionTicket(...)`.
7. State machine:
   - loads ticket,
   - verifies transition rule,
   - writes new status through store,
   - appends `ticket.status_changed` event.
8. Route returns `{ success: true, data: { ticket } }`.
9. Component calls `router.refresh()` to reload server data.
10. Ticket detail page re-renders with new status + updated timeline.

---

## 5) Key Design Decisions

## Decision: Next.js App Router
- Why: unified server rendering + API handlers in one codebase.
- Tradeoff: boundaries between server/client components can confuse juniors at first.

## Decision: “lib” as domain layer
- Why: keeps business logic (`store`, `state-machine`, `validators`) away from UI.
- Tradeoff: currently no strict service/repository interfaces; direct imports are simple but coupled.

## Decision: JSON file store for MVP
- Why: fast iteration without DB setup friction.
- Tradeoff: not production-safe under high concurrency, limited query power, weak migration story.
- Better later: move to Drizzle + Postgres runtime (scaffold exists).

## Decision: Standard API envelope
- Why: frontend can always parse same shape.
- Pattern:
  - success => `{ success: true, data }`
  - error => `{ success: false, error: { code, message } }`

## Decision: Lightweight state machine
- Why: central place for status transition rules.
- Tradeoff: small scope now; missing advanced guards and automatic transition orchestration.

---

## 6) Dependency Map

Core dependencies by layer:

1. Presentation
- `src/app/*` pages depend on:
  - `src/lib/auth`
  - `src/lib/store`
  - local client components

2. Client components
- `src/components/*` depend on:
  - browser `fetch()`
  - `next/navigation`
  - API route contracts

3. API routes (`src/app/api/*`)
- depend on:
  - `src/lib/api` (response helpers)
  - `src/lib/auth` (internal routes)
  - `src/lib/validators` (input checks)
  - `src/lib/store` / `src/lib/state-machine`

4. Domain/data layer
- `src/lib/state-machine` depends on `src/lib/store`
- `src/lib/store` depends on:
  - Node fs/path/crypto
  - `src/lib/seed-data`
  - `src/lib/types`

5. Types/config
- `src/lib/types` is foundational; most modules depend on it.

Why this matters:
- It keeps UI ignorant of persistence details.
- It lets you swap store implementation later with lower UI/API churn.

---

## 7) Folder Structure Rationale

## `src/app`
- Next.js route tree for pages and route handlers.
- Mirrors URL shape and API surface directly.

## `src/components`
- Reusable client-side interaction components.
- Keeps page files focused on data orchestration.

## `src/lib`
- Domain + infrastructure helpers.
- Most business logic lives here.

## `worker/`
- Placeholder for background jobs (future BullMQ workers).

## `_learning/`
- Documentation curriculum generated for onboarding.

---

## 8) Environment & Infrastructure

## Development
- Command: `npm run dev`
- Next.js app serves pages and API routes.
- Data persists to `data/deskpilot.json`.
- “Auth” is currently seeded user lookup (`sarah@acme.dev`), not full NextAuth runtime.

## Production intent (not fully implemented yet)
- `docker-compose.yml` defines:
  - `app`
  - `worker`
  - `postgres`
  - `redis`
- `.env.example` includes DB, Redis, SMTP, and auth secrets.
- `drizzle.config.ts` is present for future DB migrations.

## Important honesty note
- Current runtime does **not** actually use Postgres/Redis/Drizzle for live data.
- This is an MVP workaround. A production-ready evolution should migrate `store.ts` to a DB-backed repository layer.

---

## 9) Quality Snapshot

Strengths:
- Clear API envelope consistency
- Good type modeling in `types.ts`
- Centralized transition rules
- Clean route/page/component separation

Current weaknesses:
- JSON file persistence limits scale/reliability
- Placeholder auth and worker
- Some text encoding artifacts in a few strings
- Lint/build environment issues from local package state (documented earlier)

---

## 10) One Extra Mini-Example (for understanding layers)

If you add a “priority escalation” button:
1. Client component sends `PATCH /api/tickets/:id` with `{ priority: "urgent" }`
2. Route validates and calls `updateTicketFields`
3. Store updates ticket and appends `ticket.updated` event
4. UI refreshes and timeline shows the change

This is the same pattern repeated everywhere in the app: **UI -> Route -> Domain/Store -> Response -> UI**.

