# DeskPilot Learning Path

This path is optimized for a junior developer who knows syntax but is new to full-stack web apps.

## Chapter 0: Big Picture First
Read:
- `00-ARCHITECTURE.md`
- `_learning/guides/docker-compose.yml.guide.md`
- `_learning/guides/drizzle.config.ts.guide.md`
- `_learning/guides/worker/index.js.guide.md`

Checkpoint after Chapter 0:
- You can explain what the app does.
- You understand intended runtime pieces (app/worker/db/redis).
- You know this MVP currently uses JSON persistence as a temporary tradeoff.

## Chapter 1: Core Domain Types and Rules
Read:
- `_learning/guides/src/lib/types.ts.guide.md`
- `_learning/guides/src/lib/seed-data.ts.guide.md`
- `_learning/guides/src/lib/validators.ts.guide.md`
- `_learning/guides/src/lib/state-machine.ts.guide.md`

Checkpoint after Chapter 1:
- You can list all ticket statuses/priorities and why unions are used.
- You understand legal state transitions and domain guards.
- You can explain runtime validation vs TypeScript compile-time typing.

## Chapter 2: Persistence and Business Operations
Read:
- `_learning/guides/src/lib/store.ts.guide.md`
- `_learning/guides/src/lib/api.ts.guide.md`
- `_learning/guides/src/lib/auth.ts.guide.md`
- `_learning/guides/src/lib/db/schema.ts.guide.md`

Checkpoint after Chapter 2:
- You can trace how data is read/written to `data/deskpilot.json`.
- You understand the write queue and append-only event logging.
- You can explain the standard API response envelope.

## Chapter 3: API Layer (Internal Agent Flows)
Read in order:
1. `_learning/guides/src/app/api/tickets/route.ts.guide.md`
2. `_learning/guides/src/app/api/tickets/[id]/route.ts.guide.md`
3. `_learning/guides/src/app/api/tickets/[id]/comments/route.ts.guide.md`
4. `_learning/guides/src/app/api/tickets/[id]/transition/route.ts.guide.md`
5. `_learning/guides/src/app/api/tickets/[id]/timeline/route.ts.guide.md`
6. `_learning/guides/src/app/api/customers/route.ts.guide.md`
7. `_learning/guides/src/app/api/customers/[id]/route.ts.guide.md`
8. `_learning/guides/src/app/api/customers/[id]/tickets/route.ts.guide.md`
9. `_learning/guides/src/app/api/search/route.ts.guide.md`
10. `_learning/guides/src/app/api/reports/overview/route.ts.guide.md`
11. `_learning/guides/src/app/api/notifications/route.ts.guide.md`
12. `_learning/guides/src/app/api/notifications/read/route.ts.guide.md`
13. `_learning/guides/src/app/api/events/stream/route.ts.guide.md`

Checkpoint after Chapter 3:
- You can design a new route using existing envelope + validation patterns.
- You can explain how status transitions map domain errors to HTTP responses.
- You understand where placeholders exist and what production-ready versions need.

## Chapter 4: API Layer (Portal/Public Flows)
Read:
- `_learning/guides/src/app/api/portal/tickets/route.ts.guide.md`
- `_learning/guides/src/app/api/portal/tickets/[id]/comments/route.ts.guide.md`

Checkpoint after Chapter 4:
- You can explain token-based auth and object-level ownership checks.
- You can identify IDOR risks and how this code mitigates them.

## Chapter 5: Application Shell and Shared UX States
Read:
- `_learning/guides/src/app/layout.tsx.guide.md`
- `_learning/guides/src/app/globals.css.guide.md`
- `_learning/guides/src/app/page.tsx.guide.md`
- `_learning/guides/src/app/loading.tsx.guide.md`
- `_learning/guides/src/app/error.tsx.guide.md`
- `_learning/guides/src/app/not-found.tsx.guide.md`
- `_learning/guides/src/app/(auth)/login/page.tsx.guide.md`

Checkpoint after Chapter 5:
- You understand how App Router layouts/fallback files work.
- You can update global styles and not break page-level structure.

## Chapter 6: Agent UI Pages
Read:
- `_learning/guides/src/app/tickets/page.tsx.guide.md`
- `_learning/guides/src/app/tickets/new/page.tsx.guide.md`
- `_learning/guides/src/app/tickets/[id]/page.tsx.guide.md`
- `_learning/guides/src/app/customers/page.tsx.guide.md`
- `_learning/guides/src/app/customers/[id]/page.tsx.guide.md`
- `_learning/guides/src/app/reports/page.tsx.guide.md`
- `_learning/guides/src/app/settings/page.tsx.guide.md`

Checkpoint after Chapter 6:
- You can trace server-component data fetching patterns.
- You can explain list/detail page composition and UI aggregation logic.

## Chapter 7: Interactive Client Components
Read:
- `_learning/guides/src/components/tickets/NewTicketForm.tsx.guide.md`
- `_learning/guides/src/components/tickets/TicketActions.tsx.guide.md`
- `_learning/guides/src/components/tickets/CommentComposer.tsx.guide.md`

Checkpoint after Chapter 7:
- You can implement controlled forms and mutation flows with loading/error UX.
- You understand when to use `router.push` vs `router.refresh`.

## Chapter 8: Portal UI Components and Pages
Read:
- `_learning/guides/src/app/portal/page.tsx.guide.md`
- `_learning/guides/src/app/portal/[id]/page.tsx.guide.md`
- `_learning/guides/src/components/portal/PortalTicketCreateForm.tsx.guide.md`
- `_learning/guides/src/components/portal/PortalReplyForm.tsx.guide.md`

Checkpoint after Chapter 8:
- You can build secure public-facing flows with token checks.
- You can separate internal and portal-safe data presentation.

## Suggested capstone
After finishing all chapters:
1. Implement real DB persistence for tickets/comments/events in `store.ts`.
2. Keep API contracts unchanged so UI still works.
3. Write a migration note describing what changed and why.

