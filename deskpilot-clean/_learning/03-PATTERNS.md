# DeskPilot Patterns & Anti-Patterns

This document is intentionally honest: it covers what is done well and what is still a workaround.

## Patterns used well

## 1) Thin Route, Thick Domain
Pattern:
- Route handlers do auth + validation + response mapping.
- Business logic lives in `src/lib/store.ts` and `src/lib/state-machine.ts`.

Example:
- `src/app/api/tickets/[id]/transition/route.ts`
- Delegates to `transitionTicket(...)`.

Why it helps:
- Easier testing and reuse.
- Cleaner separation of concerns.

Mini-example:
- A future `/api/tickets/:id/assign` route should call `assignTicket(...)` domain function, not mutate DB inline.

## 2) Centralized Response Envelope
Pattern:
- Use `ok()` and `fail()` from `src/lib/api.ts` everywhere.

Why it helps:
- Frontend can parse all responses uniformly.
- Error handling is predictable.

## 3) State Machine for Workflow Integrity
Pattern:
- Transition rules are centralized in `src/lib/state-machine.ts`.

Why it helps:
- Prevents illegal status jumps from random routes/components.

## 4) Append-Only Audit Log
Pattern:
- Ticket changes append events in `ticketEvents` array.

Why it helps:
- Good traceability.
- Timeline can explain “what changed.”

## 5) Tenant Scoping
Pattern:
- Most reads/writes include `orgId`.

Why it helps:
- Prevents cross-tenant data leaks.

## 6) Server/Client Component Split
Pattern:
- Data-heavy pages are server components.
- Interactive forms are client components.

Why it helps:
- Clearer data loading + interaction responsibilities.

## 7) Reusable Styling Primitives
Pattern:
- Shared classes (`surface`, `stack`, `row`, `badge`) in global CSS.

Why it helps:
- Fast UI consistency with less duplication.

---

## Anti-patterns / technical debt (current project)

## 1) JSON File as “Database”
Reality:
- `src/lib/store.ts` reads/writes a single file.

Risk:
- Not safe for scale/high concurrency/distributed deployment.
- Hard to query/filter efficiently.

Better:
- Move to Postgres + Drizzle repository implementation.

## 2) Placeholder Auth
Reality:
- `src/lib/auth.ts` hardcodes user email.

Risk:
- Not real authentication/authorization.

Better:
- Implement NextAuth session validation + role guards.

## 3) Duplicated Transition Rules
Reality:
- Transition map exists in both `state-machine.ts` and `TicketActions.tsx`.

Risk:
- UI can drift from backend truth.

Better:
- Expose allowed transitions from backend and render from server-provided values.

## 4) Hardcoded Org in Portal Comment Route
Reality:
- `getTicketById("org_acme", id)` in portal comment route.

Risk:
- Breaks multi-org correctness.

Better:
- Derive org from token customer and pass that through.

## 5) Partial Infrastructure Mismatch
Reality:
- Docker/Drizzle env implies Postgres/Redis, but runtime uses JSON.

Risk:
- Onboarding confusion and operational mismatch.

Better:
- Document migration state clearly (this curriculum does that) and prioritize persistence migration.

## 6) Minimal Sanitization
Reality:
- HTML escaping is done with simple replace in `addComment`.

Risk:
- Not a full sanitizer for rich text scenarios.

Better:
- Use robust sanitizer library (already planned in original spec).

---

## Patterns to add next (recommended)

1. Repository interface abstraction
- Define `TicketRepository` interface and implement JSON + Postgres versions.

2. Error class hierarchy
- Add `AuthError`, `ValidationError`, `PermissionError`, etc.

3. Shared route schema validators
- Replace ad-hoc parsing with centralized schemas (e.g., Zod objects).

4. Pagination everywhere
- Return `{ items, cursor, hasMore }` for list endpoints.

5. Observability hooks
- Add structured logger wrapper and request correlation IDs.

---

## One extra mini-example

Good pattern extension:
- When adding “assign ticket” feature:
  - API route validates payload.
  - Domain service checks role and current status.
  - Store persists assignee + appends `ticket.updated` event.
  - API returns standard envelope.

Bad pattern to avoid:
- API route directly edits JSON object fields inline without event log and without org checks.

