# Guide: `src/lib/validators.ts`

## Purpose
This file contains minimal input parsing helpers used by API routes. It turns unknown request payload values into trusted domain types (or `null` when invalid).

## Line-by-line walkthrough
- Imports `TicketPriority` and `TicketStatus` type unions.
- `ticketPriorities`, `ticketStatuses` arrays:
  - canonical allowed values.
- `parseTicketPriority(value)`:
  - checks type + membership.
  - returns typed priority or `null`.
- `parseTicketStatus(value)`:
  - same pattern for statuses.
- `parseNonEmptyString(value,min,max)`:
  - rejects non-strings.
  - trims whitespace.
  - enforces length bounds.
  - returns cleaned string or `null`.

## Concepts taught by this file
- Runtime validation
- Type narrowing from `unknown`
- Defensive programming at API boundaries

## Common mistakes
- Trusting request JSON shape without validation.
- Returning raw input without trim/sanitization.
- Throwing for every validation miss instead of returning explicit null for caller control.

## Mini exercises
1. Add `parseBoolean` helper for route flags.
2. Add email format validation helper and use it in customer routes.
3. Change `parseNonEmptyString` to return detailed error codes.

## Further reading
- Search: `runtime validation typescript unknown`
- Search: `input validation api best practices`

