# Guide: `src/app/api/tickets/[id]/transition/route.ts`

## Purpose
This route is the API boundary for status transitions. It validates desired status and delegates policy enforcement to the state machine.

## Line-by-line walkthrough
- Imports:
  - `transitionTicket` and `TransitionError` from domain layer.
  - auth guard + response helpers + status parser.
- `POST(..., context)` flow:
  1. Authenticated user retrieved.
  2. Ticket ID loaded from dynamic params.
  3. Body parsed and `nextStatus` validated.
  4. Invalid status => 400 validation failure.
  5. Try transition:
     - calls `transitionTicket` with org/ticket/user.
  6. Catch:
     - `TransitionError` => 400 business error.
     - unknown error => 500 internal error.

## Concepts taught by this file
- Domain error mapping to HTTP
- Command-style endpoint (`transition`)
- Guard-then-delegate architecture

## Common mistakes
- Implementing transition rules directly in route.
- Returning internal exception text to clients.
- Treating invalid transition as 500 instead of 400 domain error.

## Mini exercises
1. Return allowed transitions when transition fails.
2. Add optional transition reason payload and persist in event metadata.
3. Add rate limit check for repeated transitions.

## Further reading
- Search: `error handling api boundaries`
- Search: `domain errors vs transport errors`

