# DeskPilot Concepts Glossary

Each term has a one-line definition and where it appears in this codebase. Snippets are copied from
the cited lines.

## Request handling

**API envelope** — one JSON shape for every response, success or failure.
`src/lib/api.ts:3-5`: `return NextResponse.json({ success: true, data }, init);`
Failures use `fail(code, message, status)` (lines 7-15) → `{ success: false, error: { code, message } }`.

**Route handler** — an exported `GET`/`POST`/`PATCH` function in a `route.ts` file under `src/app/api`.
The folder path is the URL: `src/app/api/tickets/[id]/transition/route.ts` serves
`POST /api/tickets/:id/transition`.

**Dynamic route param** — the `[id]` segment of a path, read from the handler's second argument.
`src/app/api/tickets/[id]/route.ts:12`: `const { id } = await context.params;`

**Authentication guard** — a call that should stop unauthenticated callers. Here it always succeeds,
because `requireUser` (`src/lib/auth.ts:11-17`) returns the seeded admin. See `03-PATTERNS.md`
finding 2.

**Runtime validation** — checking `unknown` input before trusting it. TypeScript types disappear at
runtime; a `payload.priority` typed by a cast can still be any JSON value.
`src/app/api/tickets/route.ts:26`: `const subject = parseNonEmptyString(payload.subject, 3, 200);`

**Type narrowing** — a check after which TypeScript knows a more specific type.
`src/lib/validators.ts:26-28`: `if (typeof value !== "string") { return null; }` — below it, `value` is a
`string`.

**Guard clause** — return early on bad input so the rest of the function handles only the valid case.
`src/app/api/tickets/[id]/transition/route.ts:16-18`:
`if (!nextStatus) { return fail("VALIDATION_ERROR", "nextStatus is invalid."); }`

**HTTP 201 Created** — status for a successful create.
`src/app/api/tickets/route.ts:46`: `return ok({ ticket }, { status: 201 });`

## Domain

**Union type** — a type that allows only listed values.
`src/lib/types.ts:9`: `export type TicketPriority = "low" | "medium" | "high" | "urgent";`

**State machine (rule table)** — a map from each state to its legal next states.
`src/lib/state-machine.ts:4-11`; the single check is line 36.

**Custom error class** — an `Error` subclass so callers can tell expected failures from bugs with
`instanceof`. `TransitionError`, `src/lib/state-machine.ts:13-18`, caught at
`src/app/api/tickets/[id]/transition/route.ts:29`.

**Tenant scoping** — filtering every query by organization so one customer org never sees another's
data. `src/lib/store.ts:77`: `ticket.orgId === orgId && ticket.id === ticketId`.

**Ownership check (object-level authorization)** — checking that *this* caller owns *this* record, not
just that the caller is logged in. Missing ownership checks are called IDOR (insecure direct object
reference). `src/app/api/portal/tickets/[id]/comments/route.ts:33`:
`if (!ticket || ticket.customerId !== customerId)`.

**Portal token** — a per-customer secret string that stands in for a login
(`src/lib/seed-data.ts`, e.g. `portalToken: "portal_alice_token"`). Looked up by exact match in each
portal route's `getPortalCustomerId` (lines 6-12).

## Persistence

**JSON file store** — the whole database is one file, `data/deskpilot.json`, read and written in full.
`src/lib/store.ts:30-38`.

**Seed data** — records written on first run. `src/lib/store.ts:26` writes `seedDb` when the file
cannot be read.

**Read-modify-write** — read current state, change it in memory, write it back. Safe only if nothing
else writes in between. Every store mutation has this shape, e.g. `createTicket`, `store.ts:149-185`.

**Lost update** — the failure of unprotected read-modify-write: two requests read the same state and
the later write discards the earlier one. Reproduce it with `01-LEARNING-PATH.md` exercise 2.2.

**Write queue (promise chain)** — `store.ts:19,42`: `writeQueue = writeQueue.then(() => writeDbInternal(db));`
It orders whole-file writes so bytes from two writes never interleave. It does **not** prevent lost
updates, because each queued `db` was read before the others were written.

**Audit event** — an append-only record of what changed, with old and new values.
`src/lib/store.ts:233-245` pushes `ticket.updated` with `oldValue`/`newValue`.

**Read model** — data reshaped for one screen. `getTimeline` (`store.ts:92-102`) merges comments and
events and sorts by time.

## Next.js and React

**Server Component** — the default in the App Router: an `async` component that runs on the server and
can call `src/lib` directly. `src/app/tickets/page.tsx:5-18`.

**Client Component** — a file starting with `"use client"` that can use state and event handlers.
All five live in `src/components/`.

**Server/client boundary** — props passed from a Server Component to a Client Component are serialized
into the page. Pass only what the browser needs; see `03-PATTERNS.md` finding 10.

**Controlled input** — an input whose value comes from React state.
`src/components/tickets/CommentComposer.tsx`: `value={body}` with
`onChange={(event) => setBody(event.target.value)}`.

**`router.refresh()`** — re-runs the current route's Server Components after a mutation, keeping client
state. `src/components/tickets/TicketActions.tsx:41`.

**`router.push()`** — client-side navigation to a new URL.
`src/components/tickets/NewTicketForm.tsx:44`: ``router.push(`/tickets/${json.data.ticket.id}`);``

**`notFound()`** — throws to render the nearest `not-found.tsx`.
`src/app/tickets/[id]/page.tsx:16-18`.

**Error and loading boundaries** — `src/app/error.tsx` renders when a route segment throws;
`src/app/loading.tsx` renders while a Server Component is still loading.

**Route group** — a folder in parentheses that organizes files without adding a URL segment.
`src/app/(auth)/login/page.tsx` is served at `/login`.

**Server-Sent Events (SSE)** — a one-way stream from server to browser over HTTP.
`src/app/api/events/stream/route.ts` sends a `ready` event and then a `heartbeat` every 15 seconds; no
UI subscribes to it yet.

**CSS custom properties (design tokens)** — shared values defined once.
`src/app/globals.css:11-13`: `--accent: #0077ff;`, `--accent-soft`, `--danger: #d63939;`.

## Placeholders

**Stub endpoint** — a route that keeps an API contract while doing nothing.
`src/app/api/notifications/route.ts:5`: `return ok({ notifications: [] as Array<Record<string, unknown>> });`

**Placeholder infrastructure** — config for systems the app does not run: `docker-compose.yml`
(Postgres, Redis, worker; no `Dockerfile`), `drizzle.config.ts` (schema is a placeholder object), and
the maintained repo's `.env.example`, which this copy lacks (no code reads `process.env` either way).
