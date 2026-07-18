# Guide: `src/lib/seed-data.ts`

## Purpose
This file creates starter data for first run. If no DB file exists, the store bootstraps from this seed. It gives interns a realistic dataset to explore tickets, comments, events, and portal flows immediately.

## Line-by-line walkthrough
- `import type ...` pulls domain types to keep seed objects valid.
- `const now = new Date()` freezes a baseline timestamp used by helper functions.
- `isoMinutesAgo(minutes)` returns ISO strings relative to `now`.
- `seededTicket(...)` helper:
  - Reduces repeated object boilerplate.
  - Sets derived fields like `resolvedAt` when status is resolved/closed.
- `export const seedDb`:
  - Defines one org, four users, three customers.
  - Defines six tickets across different statuses/priorities.
  - Adds initial comments and audit events.

Why helper + constant pattern matters:
- Helper keeps ticket creation consistent.
- Constant export allows deterministic initialization.

## Concepts taught by this file
- Seed data strategy
- Helper function reuse
- Deterministic test/demo datasets

## Common mistakes
- Using `new Date()` everywhere (creates inconsistent timing).
- Forgetting to seed related entities (ticket references customer/user IDs).
- Seed values not matching type constraints.

## Mini exercises
1. Add two more tickets for Alice and verify customer history page updates.
2. Add one internal note comment and explain where it should/should not show.
3. Make one ticket `isMerged: true` and inspect ticket listing behavior.

## Further reading
- Search: `database seed data best practices`
- Search: `referential integrity examples`

