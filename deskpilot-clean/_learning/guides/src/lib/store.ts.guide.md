# Guide: `src/lib/store.ts`

## Purpose
This is the project’s current persistence and repository layer. It handles reading/writing the JSON data file, querying entities, creating/updating tickets, adding comments, and recording timeline events. Most business actions eventually pass through this file.

## Line-by-line walkthrough
- Imports:
  - `fs/promises`, `path`, `crypto` for file persistence + IDs.
  - `seedDb` for first-run bootstrap.
  - types from `types.ts` for strict return/input contracts.
- `DATA_DIR` and `DB_PATH`:
  - resolved from `process.cwd()` so runtime location is predictable.
- `writeQueue`:
  - Promise chain used as a simple write lock to serialize writes.
  - Prevents two writes from interleaving bytes in the file.
  - Does **not** prevent lost updates: each caller reads the file *before* queueing its write, so
    concurrent callers overwrite each other (see `_learning/03-PATTERNS.md`, finding 1).
- `ensureDbFile()`:
  - creates data directory if missing.
  - attempts reading DB file.
  - if read fails, writes seed data.
- `readDb()`:
  - ensures file exists.
  - reads file text and parses into `DeskPilotDb`.
- `writeDbInternal()` and `writeDb()`:
  - internal writer does raw write.
  - public writer chains writes via `writeQueue`.
- `TicketListFilters` interface:
  - typed filter object shared by list function callers.
- `listTickets(orgId, filters)`:
  - loads DB.
  - filters by tenant (`orgId`) and excludes merged tickets.
  - optional status/priority/search filtering.
  - sorts descending by `updatedAt`.
- `getTicketById`, `getCustomers`, `getCustomerById`:
  - scoped lookup helpers.
- `getTimeline()`:
  - combines comment stream + event stream into one chronological list.
- `nextTicketNumber()`:
  - computes max per-org ticket number + 1.
  - not safe even in one process: concurrent creates read the same max and get the same number.
- `nowIso()`:
  - centralized timestamp creation.
- `buildEvent(...)`:
  - helper to enforce consistent event structure.
- `createTicket(...)`:
  - creates ticket object.
  - pushes ticket and corresponding `ticket.created` event.
  - persists and returns created ticket.
- `updateTicketFields(...)`:
  - loads ticket.
  - tracks `oldValue`/`newValue` only for changed fields.
  - updates timestamp.
  - appends `ticket.updated` event when something changed.
- `addComment(...)`:
  - validates ticket exists and body not empty.
  - stores escaped HTML + plain text.
  - updates ticket `updatedAt`.
  - sets `firstResponseAt` for first agent public reply.
  - appends `comment.added` event.
- `getTicketComments(...)`:
  - filtered chronological comments.
- `addTransitionEvent(...)`:
  - appends explicit status change event.
- `setTicketStatus(...)`:
  - updates status.
  - sets `resolvedAt` for resolved/closed, but never clears it when a ticket is reopened.
  - updates timestamp and persists.

## State management, scope, closures
- Persistent state: JSON file on disk.
- In-memory coordination state: `writeQueue`.
- Function-scoped temp state:
  - `oldValue/newValue` in updates,
  - local `db` snapshots.
- Closure behavior:
  - `writeQueue` is module-scoped and survives across calls.

## Control flow and error handling
- Control flow is mostly guard-driven:
  - return early on missing ticket/invalid input.
- Initialization uses `try/catch` in `ensureDbFile` to trigger seeding fallback.
- Most methods return `null` instead of throwing for “not found,” leaving routes to choose HTTP response.

## Side effects
- Disk I/O (read/write)
- Timestamp generation
- UUID generation

## Concepts taught by this file
- Repository pattern (lightweight)
- Append-only audit events
- Tenant scoping
- Serialization queue (orders writes; does not make read-modify-write atomic)
- Derived timeline composition

## Common mistakes
- Forgetting org filter, causing cross-tenant leakage.
- Updating ticket fields without writing an event.
- Bypassing `writeDb` and breaking write ordering guarantees.
- Treating `nextTicketNumber` as safe under concurrent requests.
- Assuming `writeQueue` makes read-modify-write atomic.
- Using `hasOwnProperty` to mean "the client sent this field". In `updateTicketFields` (line 217) it is
  true for a key whose value is `undefined`, and the PATCH route always passes `assigneeId`, so every
  PATCH clears the assignee (see `_learning/03-PATTERNS.md`, finding 13).

## Mini exercises
1. Add `listTicketsByCustomer(orgId, customerId)` and update one page to use it.
2. Extend `addComment` to auto-transition:
   - customer reply on resolved -> in_progress.
3. Add pagination (`cursor`, `limit`) to `listTickets`.

## Further reading
- Search: `repository pattern node typescript`
- Search: `event sourcing vs audit log`
- Search: `concurrency control file writes`

