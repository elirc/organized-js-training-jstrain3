# DeskPilot Patterns, Anti-Patterns, and Review Findings

Part 1 shows patterns the code uses, with the real code. Part 2 is a senior-reviewer chapter: every
finding was checked against the source. The ones marked **Reproducible** come with a no-install lab
script in `01-LEARNING-PATH.md` ("Lab setup"); the outputs quoted below are what the code implies for
fresh seed data, so run the script yourself to confirm them.

---

# Part 1 — Patterns in use

## 1) Response envelope helpers
`src/lib/api.ts:3-15`:

```ts
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(code: string, message: string, status = 400) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}
```

Every client component parses the same shape, e.g. `src/components/tickets/TicketActions.tsx:36-40`
checks `json.success` and shows `json.error?.message`. The pattern breaks only when a handler throws
before reaching `fail()` (Part 2, finding 4).

## 2) Parse `unknown` input into domain types
`src/lib/validators.ts:19-23` turns an untrusted value into a union member or `null`:

```ts
export function parseTicketStatus(value: unknown): TicketStatus | null {
  return typeof value === "string" && ticketStatuses.includes(value as TicketStatus)
    ? (value as TicketStatus)
    : null;
}
```

The route then guards on `null` (`src/app/api/tickets/[id]/transition/route.ts:14-18`). This is the
"parse, don't validate" idea in miniature: after line 18, `nextStatus` is a `TicketStatus`, not a
string. Note the validator list duplicates the union in `types.ts:1-7`; adding a status means editing
both.

## 3) Thin route over a domain function
The transition route only authenticates, parses, delegates, and maps errors:

```ts
// src/app/api/tickets/[id]/transition/route.ts:20-33
try {
  const ticket = await transitionTicket({ orgId: user.orgId, ticketId: id, nextStatus, actorUserId: user.id });
  return ok({ ticket });
} catch (error) {
  if (error instanceof TransitionError) {
    return fail("TRANSITION_ERROR", error.message, 400);
  }
  return fail("INTERNAL_ERROR", "Unexpected transition failure.", 500);
}
```

A custom error class (`state-machine.ts:13-18`) lets the route tell expected domain failures from bugs.
Counter-example in the same codebase: `src/app/api/customers/[id]/route.ts:32-47` reads the whole DB,
edits a customer inline, and writes it back, with no domain function and no audit event.

## 4) Rule table instead of `if` chains
`src/lib/state-machine.ts:4-11` maps each status to its legal targets, and line 36 is the only check:

```ts
if (!rules[ticket.status].includes(input.nextStatus)) {
  throw new TransitionError(`Cannot transition from ${ticket.status} to ${input.nextStatus}.`);
}
```

The table is data, so it can be listed (`allowedTransitions`, line 62) — but the UI does not use that
function; `TicketActions.tsx:12-19` keeps its own identical copy. The server still enforces the rule,
so drift would only show wrong options, not allow illegal moves.

## 5) Audit events with old/new values
`updateTicketFields` records only fields that actually changed (`src/lib/store.ts:204-229`) and skips
the event when nothing changed (the guard on line 233). In this copy it does **not** skip the write: an
empty or unchanged patch still bumps `updatedAt` (line 231) and rewrites the file (line 247). The
maintained [elirc/deskpilot-clean](https://github.com/elirc/deskpilot-clean) later added an early
`return ticket` before line 231 so a no-op patch changes nothing. `getTimeline` (lines 92-102) merges comments
and events into one list sorted by ISO timestamp — a small read model.

## 6) Tenant scoping on internal reads
Internal store lookups filter by `orgId` and ID together, e.g.
`db.tickets.find((ticket) => ticket.orgId === orgId && ticket.id === ticketId)` (`store.ts:77`).
A ticket ID from another org returns `null`, which routes map to 404, so the response does not reveal
that the ID exists. Exceptions are listed in Part 2, finding 6.

## 7) Ownership check on the portal
`src/app/api/portal/tickets/[id]/comments/route.ts:33`:

```ts
if (!ticket || ticket.customerId !== customerId) {
  return fail("NOT_FOUND", "Ticket not found.", 404);
}
```

Knowing a ticket ID is not enough; the token's customer must own it. `src/app/portal/[id]/page.tsx:22-24`
does the same, and also filters out internal notes (line 26).

## 8) Server page + client island
Pages are `async` Server Components that read the store directly; only forms are client components.
`src/app/tickets/new/page.tsx` loads customers on the server and passes them to `NewTicketForm`, which
owns form state and calls `router.push` then `router.refresh` after a successful POST
(`src/components/tickets/NewTicketForm.tsx:44-45`).

---

# Part 2 — Senior review findings

Each finding has: evidence (file:line), impact, and a direction for the fix. They are ordered roughly by
severity.

## Finding 1 — Lost updates in the JSON store (Reproducible)
**Evidence.** Every mutation is `readDb()` → mutate → `writeDb(db)`, e.g. `createTicket`
(`src/lib/store.ts:149-186`). `writeDb` queues writes (lines 40-44) but each queued write is a full
snapshot taken *before* the other requests' changes:

```ts
export async function writeDb(db: DeskPilotDb): Promise<void> {
  await ensureDbFile();
  writeQueue = writeQueue.then(() => writeDbInternal(db));
  await writeQueue;
}
```

**Impact.** Five concurrent `createTicket` calls all return success with `ticketNumber: 1007`, and only
one ticket is persisted. With fresh seed data (six tickets, highest number 1006, `seed-data.ts:87-92`)
exercise 2.2 should print `{ before: 6, after: 7, returnedNumbers: [1007, 1007, 1007, 1007, 1007] }`.
The same race affects comments, transitions, and customer edits. The guide comment "prevents overlapping
writes from corrupting file contents" is true about bytes, not about data.

**Related.** `transitionTicket` writes status and event in two separate cycles
(`state-machine.ts:41-57`), so a crash or a concurrent write between them leaves a status change with
no `ticket.status_changed` event. `writeDbInternal` (line 36-38) writes in place, without a temp file
and rename, so a crash mid-write can leave truncated JSON that `JSON.parse` (line 33) rejects on every
later request.

**Fix direction.** Run the whole read-modify-write inside the queue (a `mutateDb(fn)` helper), or move
to a database transaction. Ticket numbers need a per-org sequence or a unique constraint.

## Finding 2 — No authentication or authorization
**Evidence.** `src/lib/auth.ts:4-9` returns the user with a hard-coded email. `UserRole` includes
`"viewer"` (`types.ts:11`) and the seed has a viewer (`seed-data.ts`, user `u_tom`), but no file checks
`role`. `src/app/api/events/stream/route.ts` and both notification routes do not even call
`requireUser`.

**Impact.** Anyone who can reach the server can read and change every ticket and customer in
`org_acme`. This is a known MVP shortcut; the review point is that the code *looks* guarded
(`requireUser()` at the top of each handler) when it is not.

**Fix direction.** Real session lookup in `requireUser`, plus a `requireRole("agent")` helper used by
every mutating route.

## Finding 3 — Unchecked foreign keys and unbounded input (Reproducible)
**Evidence.**
- `POST /api/tickets` accepts any non-empty `customerId` string (`src/app/api/tickets/route.ts:29`)
  and `createTicket` never looks it up, so `createTicket({ customerId: "nobody", ... })` succeeds (exercise 3.2).
  The ticket list then shows "Customer: Unknown".
- `PATCH /api/tickets/:id` accepts any `assigneeId` string up to 120 chars without checking it is a
  user in the org (`src/app/api/tickets/[id]/route.ts:32-37`).
- `tags` has no count or length limit (`src/app/api/tickets/[id]/route.ts:38`; `store.ts:222-229` only trims and dedupes).
- Invalid PATCH fields are silently dropped, not rejected: `subject: "x"` fails
  `parseNonEmptyString(..., 3, 200)` and becomes `undefined` (line 30), and the route returns 200. The
  ticket is not unchanged, though: `updatedAt` is bumped (section 5) and the assignee is cleared (finding 13). `src/app/api/customers/[id]/route.ts:28-29` does the same for `name` and
  `email`, and unlike POST (line 30 of `customers/route.ts`) it does not lowercase the email.

**Fix direction.** Validate references against the store (and return 400/404), add explicit limits, and
reject unknown or invalid fields instead of ignoring them. A schema library would centralise this.

## Finding 4 — Malformed JSON escapes the envelope
**Evidence.** Every POST/PATCH handler does `(await request.json()) as Record<string, unknown>` with no
`try` (e.g. `src/app/api/tickets/route.ts:24`). A body that is not JSON throws, and Next returns its
generic 500. A body that is valid JSON but not an object (`null`) makes `payload.subject` throw a
`TypeError`, also a 500.

**Impact.** Clients get a non-envelope error, and a client mistake is reported as a server fault.

**Fix direction.** A `readJsonObject(request)` helper that returns `fail("VALIDATION_ERROR", ...)`.

## Finding 5 — Portal trust boundary
**Evidence.**
- `/portal` with no `token` falls back to `"portal_alice_token"` (`src/app/portal/page.tsx:11`), so any
  visitor sees Alice's tickets. `PortalTicketCreateForm` pre-fills the same token
  (`src/components/portal/PortalTicketCreateForm.tsx:8`).
- Tokens travel in URLs (`?token=` in `portal/page.tsx:29`, `portal/[id]/page.tsx` links, and the
  `GET /api/portal/tickets` query fallback at `src/app/api/portal/tickets/route.ts:15`), so they land in
  browser history, logs, and `Referer` headers. They never expire.
- `GET /api/portal/tickets` returns whole `Ticket` objects (line 22-23), including `assigneeId`, `tags`,
  and SLA fields meant for agents.
- The portal comment route looks up the ticket in a hard-coded org:
  `getTicketById("org_acme", id)` (`src/app/api/portal/tickets/[id]/comments/route.ts:32`). A customer
  of any other org always gets 404. The token lookup itself (line 10) searches customers across all orgs.

**Fix direction.** Remove the default token, send the token in a header or an HTTP-only cookie, derive
the org from the token's customer, and map tickets to a portal DTO.

## Finding 6 — Tenant-scope leaks in display code
**Evidence.** `src/app/tickets/page.tsx:17-18` and `src/app/tickets/[id]/page.tsx:22-24` build name
maps from `db.customers` and `db.users` for **all** orgs. `GET /api/customers/:id/tickets` returns `[]`
for a customer ID that does not exist instead of 404
(`src/app/api/customers/[id]/tickets/route.ts:12-14`), and `GET /api/tickets/:id/comments` does the same
for an unknown ticket.

**Impact.** With one seeded org there is no visible leak, but these are the lines that would leak names
the day a second org exists.

## Finding 7 — Repeated full-file reads (the JSON-store N+1)
**Evidence.** Rendering one ticket reads and parses the entire file five times: `requireUser`
(`auth.ts:7`), `getTicketById`, `getCustomerById`, `getTimeline`, and `readDb`
(`src/app/tickets/[id]/page.tsx:13-22`). Each store function calls `readDb()` independently.

**Impact.** Cost grows with *total* data size × calls per request, not with the size of the answer.
This is the same shape as an N+1 query: the fix is to load once per request and pass data down, or
to query only what is needed once a database exists.

## Finding 8 — `resolvedAt` survives a reopen (Reproducible)
**Evidence.** `setTicketStatus` sets `resolvedAt` on resolve/close but never clears it
(`src/lib/store.ts:342-345`). Seeded ticket `t_5` is `resolved` with a `resolvedAt`
(`seed-data.ts:37,91`); in the lab, `transitionTicket({ orgId: "org_acme", ticketId: "t_5", nextStatus: "in_progress" })`
returns a ticket whose `status` is `in_progress` and whose `resolvedAt` is still set.

**Impact.** Any future "time to resolution" or SLA metric would count reopened tickets as resolved.

## Finding 9 — Duplicated logic
- Transition table: `state-machine.ts:4-11` and `TicketActions.tsx:12-19`.
- Portal token lookup: `getPortalCustomerId` in both portal route files (lines 6-12 of each) plus an
  inline copy in each portal page.
- KPI counting: `src/app/reports/page.tsx:8-11` and `src/app/api/reports/overview/route.ts:9-12`.

## Finding 10 — Entity objects passed to the browser
`src/app/tickets/new/page.tsx:8,18` passes full `Customer` records, including `portalToken`, to the
client component `NewTicketForm`, whose prop type only declares `id`, `name`, `email`
(`NewTicketForm.tsx:6-10`). TypeScript does not strip extra fields at runtime, so every token is
serialized into the page payload. Map to the declared shape before crossing the server/client boundary.

## Finding 11 — Incomplete escaping in a field nobody renders
`addComment` builds `bodyHtml` by replacing only `<` and `>` (`store.ts:279`); `&` and quotes pass
through. No component renders `bodyHtml` (pages use `bodyText`), so this is not exploitable today, but a
future rich-text view that trusts `bodyHtml` would inherit the gap.

## Finding 12 — No tests
There is no test runner in `package.json` and no test files. The state machine, validators, and store
are plain functions that could be tested with Node's built-in `node:test` using the lab's import hook.

## Finding 13 — Every PATCH clears the assignee
**Evidence.** The PATCH route always passes an `assigneeId` key to the store, even when the body has
none: lines 32-37 of `src/app/api/tickets/[id]/route.ts` set `assigneeId` to `undefined` when
`payload.assigneeId` is missing, and line 46 passes it in the object literal `{ ..., assigneeId, ... }`.
`updateTicketFields` decides whether to touch the assignee with
`Object.prototype.hasOwnProperty.call(input, "assigneeId")` (`src/lib/store.ts:217`). An object literal
key whose value is `undefined` still exists, so that check is true, `undefined !== ticket.assigneeId` is
true, and line 219 stores `input.assigneeId ?? null`, which is `null`.

**Impact.** `PATCH /api/tickets/t_1` with body `{"priority":"urgent"}` changes the priority *and*
unassigns Mike (seed `t_1` is assigned to `u_mike`, `seed-data.ts:87`), and the `ticket.updated` event
records `assigneeId: "u_mike" -> null` as if someone chose to unassign. For a ticket that is already
unassigned, `undefined !== null` is also true, so even an empty `{}` body writes a `ticket.updated`
event whose old and new `assigneeId` are both `null`. No UI calls this route today
(`00-ARCHITECTURE.md` section 2), which is why nobody has noticed.

**Fix direction.** Build the store input with only the keys the client sent (for example
`...(payload.assigneeId !== undefined && { assigneeId })`), or compare against `undefined` in the store
instead of using `hasOwnProperty`. Add a test that PATCHes only `priority` and asserts the assignee is
unchanged.

---

## How to use these findings in a review
Write each review comment in three parts: the invariant ("five concurrent creates should persist five
tickets"), the evidence (file:line plus a reproduction), and a suggested direction. Avoid comments
that only say "use a database"; say which invariant the current code breaks and how you showed it.
