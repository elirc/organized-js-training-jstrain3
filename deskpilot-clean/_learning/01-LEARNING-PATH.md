# DeskPilot Learning Path

For a junior developer who knows TypeScript syntax and is new to full-stack web apps. Each chapter
lists what to read, then exercises with a **Goal**, an optional hint, and a **Check** you can verify.
Exercises marked *(lab)* run with Node alone; exercises marked *(dev server)* need `npm install` and
`npm run dev`.

## Lab setup (no install)

The store, state machine, and validators are plain TypeScript whose only non-Node imports use the
`@/` alias. Node 22 can run them directly with type stripping if you teach it the alias. Create a folder
**next to** your clone (not inside it), so the lab's `data/` file never touches the repo:

```text
parent/
  deskpilot-clean/     <- this repository
  deskpilot-lab/       <- create this
    alias.mjs
```

`deskpilot-lab/alias.mjs`:

```js
import { register } from "node:module";

// Resolve the app's "@/..." imports to ../deskpilot-clean/src/....ts
const src = new URL("../deskpilot-clean/src/", import.meta.url).href;
register(
  "data:text/javascript," +
    encodeURIComponent(`
export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) return next(${JSON.stringify(src)} + specifier.slice(2) + ".ts", context);
  return next(specifier, context);
}`),
);
```

Run any lab script from inside `deskpilot-lab/`:

```sh
node --experimental-strip-types --import ./alias.mjs <script>.mts
```

The store writes `deskpilot-lab/data/deskpilot.json`; delete that folder to reset to seed data. Node
prints an experimental-feature warning and a "Reparsing as ES module" notice; both are harmless.

---

## Chapter 0: Big picture
Read: `00-ARCHITECTURE.md`, `_learning/guides/docker-compose.yml.guide.md`,
`_learning/guides/drizzle.config.ts.guide.md`, `_learning/guides/worker/index.js.guide.md`.

**0.1 Separate real from intended infrastructure (easy).**
Goal: decide which of Postgres, Redis, Drizzle, NextAuth, and the worker the running app uses.
**Check:** `git grep -n "process.env" -- src worker` prints nothing, `git ls-files | grep -i dockerfile`
prints nothing, and `src/lib/db/schema.ts` is 4 lines. Your answer: none of them.

**0.2 Draw one request (easy).**
Goal: without looking at section 3 of the architecture guide, list every file a status change passes
through, from the button to the JSON file and back.
**Check:** your list matches `TicketActions.tsx` → `api/tickets/[id]/transition/route.ts` →
`state-machine.ts` → `store.ts` (`setTicketStatus`, then `addTransitionEvent`) → `router.refresh()`.

## Chapter 1: Domain types and rules
Read: `_learning/guides/src/lib/types.ts.guide.md`, `seed-data.ts.guide.md`, `validators.ts.guide.md`,
`state-machine.ts.guide.md` (all under `_learning/guides/src/lib/`).

**1.1 Explore the rule table (easy, lab).**
Goal: print the legal moves from `closed`, then attempt an illegal one. Save as `explore.mts`:

```ts
const sm = await import("@/lib/state-machine");
console.log(sm.allowedTransitions("closed"));
try {
  await sm.transitionTicket({ orgId: "org_acme", ticketId: "t_6", nextStatus: "blocked" });
} catch (e) {
  console.log(e.name + ":", e.message);
}
```

**Check:** output is `[ 'in_progress' ]` then `TransitionError: Cannot transition from closed to blocked.`
(seed ticket `t_6` is `closed`).

**1.2 Find the unreachable status (easy).**
Goal: using only `state-machine.ts:4-11`, name the status that no transition can ever reach.
**Check:** `open` — it appears as a key but in no value list. New tickets start there
(`store.ts:157`) and can never return.

**1.3 Write the first tests (medium, lab).**
Goal: the repo has no tests. Write `state-machine.test.mts` in the lab with `node:test` covering one
illegal transition and the case-sensitivity of `parseTicketStatus`.
Hint: `import { test } from "node:test"; import assert from "node:assert/strict";` then
`await import("@/lib/state-machine")` and `await import("@/lib/validators")`. Use
`assert.rejects(promise, TransitionError)`.
**Check:** `node --experimental-strip-types --import ./alias.mjs --test state-machine.test.mts` reports
`# pass 2` and `# fail 0`.

## Chapter 2: Persistence
Read: `_learning/guides/src/lib/store.ts.guide.md`, `api.ts.guide.md`, `auth.ts.guide.md`,
`db/schema.ts.guide.md`.

**2.1 Trace a write (easy).**
Goal: for `createTicket` (`store.ts:139-187`), write down when the file is read, when the new ticket
exists only in memory, and when it reaches disk.
**Check:** read at line 149, in memory after line 174-184, written at line 185 via `writeDb`.

**2.2 Reproduce the lost-update race (medium, lab).**
Goal: show that concurrent writes lose data. Save as `race.mts`:

```ts
const store = await import("@/lib/store");
const before = (await store.readDb()).tickets.length;
const created = await Promise.all(
  [1, 2, 3, 4, 5].map((i) =>
    store.createTicket({ orgId: "org_acme", subject: `race ${i}`, description: "x", priority: "low", customerId: "c_alice" }),
  ),
);
const after = (await store.readDb()).tickets.length;
console.log({ before, after, returnedNumbers: created.map((t) => t.ticketNumber) });
```

**Check:** with a fresh `data/` folder it prints `before: 6, after: 7` and five identical
`ticketNumber`s (`1007`). Explain why `writeQueue` (`store.ts:19,40-44`) did not prevent it.

**2.3 Fix the race (hard, lab).**
Goal: add a `mutateDb(fn)` to `store.ts` that runs read, mutate, and write inside the queue, and use it
in `createTicket`. Work on a branch.
**Check:** `race.mts` prints `after: 11` and five different ticket numbers, and your Chapter 1 tests
still pass.

## Chapter 3: Internal API routes
Read the route guides under `_learning/guides/src/app/api/`: `tickets/route.ts.guide.md`,
`tickets/[id]/route.ts.guide.md`, `tickets/[id]/comments/route.ts.guide.md`,
`tickets/[id]/transition/route.ts.guide.md`, `tickets/[id]/timeline/route.ts.guide.md`,
`customers/route.ts.guide.md`, `customers/[id]/route.ts.guide.md`,
`customers/[id]/tickets/route.ts.guide.md`, `search/route.ts.guide.md`,
`reports/overview/route.ts.guide.md`, `notifications/route.ts.guide.md`,
`notifications/read/route.ts.guide.md`, `events/stream/route.ts.guide.md`.

**3.1 Map errors to status codes (easy).**
Goal: for `POST /api/tickets/:id/transition`, list each response code and what triggers it.
**Check:** 400 `VALIDATION_ERROR` (bad `nextStatus`, line 16-18), 400 `TRANSITION_ERROR` (including
"Ticket not found." — a missing ticket is reported as 400, not 404), 500 `INTERNAL_ERROR`, 200 on
success. A non-JSON body is a fifth case: Next's default 500, outside the envelope.

**3.2 Confirm the unchecked customer (easy, lab).**
Goal: show the store accepts a ticket for a customer that does not exist.
**Check:** in the lab, `await store.createTicket({ orgId: "org_acme", subject: "ghost", description: "x", priority: "low", customerId: "nobody" })`
returns a ticket whose `customerId` is `"nobody"`.

**3.3 Validate references (medium, dev server).**
Goal: make `POST /api/tickets` return `fail("VALIDATION_ERROR", ...)` when `customerId` is not a
customer in the user's org (use `getCustomerById`, `store.ts:87-90`).
**Check:**
`curl -s -X POST http://localhost:3000/api/tickets -H "content-type: application/json" -d "{\"subject\":\"abc\",\"description\":\"abc\",\"priority\":\"low\",\"customerId\":\"nobody\"}"`
returns `"success":false` with status 400 (before your change it returns 201). The same call with
`"customerId":"c_alice"` still returns 201.

**3.4 Keep malformed JSON inside the envelope (medium, dev server).**
Goal: add a helper that wraps `request.json()` and returns `fail("VALIDATION_ERROR", ...)` when the body
is not a JSON object; use it in the five POST/PATCH internal routes.
**Check:** `curl -s -i -X POST http://localhost:3000/api/tickets -H "content-type: application/json" -d "not json"`
returns `HTTP/1.1 400` and a body starting `{"success":false`.

**3.5 The PATCH that unassigns (medium, dev server).**
Goal: explain why `PATCH /api/tickets/t_1` with only `{"priority":"urgent"}` also removes the assignee,
then fix it. Read `src/app/api/tickets/[id]/route.ts:32-47` and `src/lib/store.ts:217-221` side by side
(`03-PATTERNS.md` finding 13).
**Check:** before the fix,
`curl -s -X PATCH http://localhost:3000/api/tickets/t_1 -H "content-type: application/json" -d "{\"priority\":\"urgent\"}"`
returns a ticket with `"assigneeId":null` (the seed assigns `t_1` to `u_mike`). After the fix the same
call returns `"assigneeId":"u_mike"`, and the new `ticket.updated` event's `newValue` contains only
`priority`. Delete `data/deskpilot.json` between runs to start from seed data.

## Chapter 4: Portal (public) routes
Read: `_learning/guides/src/app/api/portal/tickets/route.ts.guide.md`,
`_learning/guides/src/app/api/portal/tickets/[id]/comments/route.ts.guide.md`.

**4.1 Find the ownership check (easy).**
Goal: explain why knowing another customer's ticket ID is not enough to reply to it.
**Check:** you cite `src/app/api/portal/tickets/[id]/comments/route.ts:33`
(`ticket.customerId !== customerId` → 404).

**4.2 List what the portal leaks (medium).**
Goal: compare the fields `GET /api/portal/tickets` returns (line 22-23) with what a customer needs.
**Check:** your list includes `assigneeId`, `tags`, `orgId`, and the SLA fields. Then read
`03-PATTERNS.md` finding 5 and compare: did you also spot the default token and the hard-coded org?

**4.3 Portal DTO (hard, dev server).**
Goal: return only `id`, `ticketNumber`, `subject`, `status`, `priority`, `createdAt`, `updatedAt` from
the portal list route.
**Check:** `curl -s "http://localhost:3000/api/portal/tickets?token=portal_alice_token"` returns tickets
with exactly those seven keys, and `/portal?token=portal_alice_token` still renders.

## Chapter 5: Application shell
Read: `_learning/guides/src/app/layout.tsx.guide.md`, `globals.css.guide.md`, `page.tsx.guide.md`,
`loading.tsx.guide.md`, `error.tsx.guide.md`, `not-found.tsx.guide.md`,
`(auth)/login/page.tsx.guide.md` (all under `_learning/guides/src/app/`).

**5.1 Which boundary renders? (easy).**
Goal: predict what `/tickets/does-not-exist` shows.
**Check:** `src/app/tickets/[id]/page.tsx:16-18` calls `notFound()`, so `src/app/not-found.tsx` renders.
Confirm in the dev server.

## Chapter 6: Agent pages
Read the page guides under `_learning/guides/src/app/`: `tickets/page.tsx.guide.md`,
`tickets/new/page.tsx.guide.md`, `tickets/[id]/page.tsx.guide.md`, `customers/page.tsx.guide.md`,
`customers/[id]/page.tsx.guide.md`, `reports/page.tsx.guide.md`, `settings/page.tsx.guide.md`.

**6.1 Count the reads (medium).**
Goal: count how many times one render of `/tickets/t_1` reads and parses `data/deskpilot.json`.
**Check:** five — `requireUser`, `getTicketById`, `getCustomerById`, `getTimeline`, `readDb`
(`src/app/tickets/[id]/page.tsx:13-22`). Explain why this is the JSON-file version of an N+1 query.

**6.2 Stop shipping tokens to the browser (medium, dev server).**
Goal: in `src/app/tickets/new/page.tsx`, map customers to `{ id, name, email }` before passing them to
`NewTicketForm`.
**Check:** view the page source of `/tickets/new` (or the RSC payload in DevTools) and search for
`portal_alice_token`: present before the change, absent after.

## Chapter 7: Agent client components
Read: `_learning/guides/src/components/tickets/NewTicketForm.tsx.guide.md`,
`TicketActions.tsx.guide.md`, `CommentComposer.tsx.guide.md`.

**7.1 One source of truth for transitions (medium).**
Goal: delete the `transitions` table in `TicketActions.tsx:12-19`; have the server page pass
`allowedTransitions(ticket.status)` as a prop instead.
**Check:** `git grep -n -F "in_progress: [" -- src` matches only
`src/lib/state-machine.ts` (today it also matches `TicketActions.tsx:14`), and the dropdown on `/tickets/t_1` still lists five targets.

**7.2 `push` vs `refresh` (easy).**
Goal: explain why `NewTicketForm` calls both `router.push` and `router.refresh`
(`NewTicketForm.tsx:44-45`) while `TicketActions` calls only `refresh`.
**Check:** your answer says the new ticket needs navigation to a new URL, while a transition stays on
the same URL and only needs its server data re-fetched.

## Chapter 8: Portal pages and components
Read: `_learning/guides/src/app/portal/page.tsx.guide.md`, `portal/[id]/page.tsx.guide.md`,
`_learning/guides/src/components/portal/PortalTicketCreateForm.tsx.guide.md`,
`PortalReplyForm.tsx.guide.md`.

**8.1 Remove the demo default (easy, dev server).**
Goal: make `/portal` without a token show the "Invalid token" message instead of Alice's tickets.
**Check:** before: `/portal` lists Alice's tickets (`src/app/portal/page.tsx:11` defaults the token).
After: it shows "Invalid token. Use a valid portal token from a customer profile."

## Capstone
Replace the JSON file with a real database behind the same store function signatures.
**Check:** every Chapter 1 and 2 lab test passes against the new store (2.2's race script prints
`after: 11`), and every page in Chapters 6 and 8 still renders. Write a short migration note covering
which findings in `03-PATTERNS.md` the change closes and which it does not (auth, portal DTOs).
