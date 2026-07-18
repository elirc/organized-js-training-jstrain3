# Guide: `src/components/tickets/TicketActions.tsx`

## Purpose
This client component provides status transition controls for a ticket detail page.

## Line-by-line walkthrough
- `"use client"` for interactive hooks.
- Imports `useRouter`, `useState`, and `TicketStatus` type.
- `Props` specify `ticketId` + current `status`.
- `transitions` constant mirrors state-machine rules for UI options.
- Component state:
  - `nextStatus` initialized from first allowed transition.
  - `loading`, `error`.
- `handleTransition()`:
  - sets loading.
  - POSTs to `/api/tickets/:id/transition`.
  - handles envelope error or refreshes on success.
  - catches network issues.
  - clears loading in finally.
- Render:
  - shows current status badge.
  - if transitions available, show select + action button.
  - else show “No transitions available.”
  - show error text when present.

## Concepts taught by this file
- Action command UI
- API-driven state updates
- Local mirror of backend business rules

## Common mistakes
- Letting UI rules drift from backend rules.
- Not handling invalid transition errors from API.
- Unsafe cast from select value without parser.

## Mini exercises
1. Fetch allowed transitions from API instead of local constant.
2. Add confirmation modal before closing/resolving.
3. Disable illegal transitions by role.

## Further reading
- Search: `ui policy mirror backend validation`
- Search: `react command components`

