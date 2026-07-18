# Guide: `src/lib/state-machine.ts`

## Purpose
This file centralizes ticket status transitions. It enforces legal moves between states and ensures every status change gets an audit event.

## Line-by-line walkthrough
- Imports:
  - `TicketStatus` type for strict rule table keys.
  - store functions for fetching/updating ticket and writing transition event.
- `rules` object:
  - maps current status -> allowed next statuses.
  - this is the policy source of truth.
- `TransitionError` class:
  - custom error type used by API route to return domain-specific 400 errors.
- `transitionTicket(input)`:
  1. Load ticket by org + ID.
  2. Guard: missing ticket -> throw.
  3. Guard: merged ticket cannot transition.
  4. Guard: same status -> no-op return.
  5. Guard: illegal transition -> throw.
  6. Save old status.
  7. Persist new status via `setTicketStatus`.
  8. Guard: if update unexpectedly failed, throw.
  9. Append transition event.
  10. Return updated ticket.
- `allowedTransitions(status)`:
  - utility for UI or route consumers to inspect legal targets.

## Concepts taught by this file
- State machine pattern
- Guard clauses
- Domain-specific error classes
- Policy centralization

## Common mistakes
- Updating `ticket.status` directly from routes/components.
- Duplicating transition rules in UI and backend inconsistently.
- Throwing generic `Error` when callers need typed domain failures.

## Mini exercises
1. Add rule: `closed` cannot reopen unless actor is admin.
2. Add transition metadata field (`reason`) and store it in event metadata.
3. Expose a `canTransition(from,to)` helper and use it in UI component.

## Further reading
- Search: `finite state machine backend workflow`
- Search: `guard clauses clean code`

