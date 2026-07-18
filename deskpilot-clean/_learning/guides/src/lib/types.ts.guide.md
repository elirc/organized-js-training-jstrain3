# Guide: `src/lib/types.ts`

## Purpose
This file defines the shared domain vocabulary for the entire app: ticket statuses, priorities, users, customers, comments, events, and DB shape. It is the type contract that keeps UI, API routes, and store logic aligned.

## Line-by-line walkthrough
- Imports: none; this file is pure type definitions.
- `TicketStatus`, `TicketPriority`, `UserRole`, `CommentAuthorType`:
  - Union string types lock values to allowed options.
  - This prevents typos like `"inprogress"` or `"Urgent"`.
- `Organization`, `User`, `Customer`, `Ticket`, `Comment`, `TicketEvent` interfaces:
  - Define exact fields each entity must carry.
  - Nullable fields (`string | null`) express optional lifecycle data.
- `DeskPilotDb` interface:
  - Models persistence shape as arrays of entities.
- `TicketTimelineEntry`:
  - Tagged union style (`kind`) for interleaving comments and events.

## Concepts taught by this file
- Domain modeling
- Type safety with discriminated/tagged unions
- Nullability as lifecycle signal

## Common mistakes
- Replacing union types with plain `string`, losing validation power.
- Using optional (`?`) when value is really “known but currently empty” (`null`).
- Diverging route payload shapes from these core types.

## Mini exercises
1. Add a `channel` field to `Ticket` and update every place that creates tickets.
2. Add `role: "customer"` to `CommentAuthorType`; list affected files.
3. Convert `TicketEvent.eventType` to a union and see what breaks.

## Further reading
- Search: `typescript union types practical`
- Search: `domain driven design ubiquitous language`

