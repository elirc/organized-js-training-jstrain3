# Guide: `src/components/portal/PortalReplyForm.tsx`

## Purpose
This client component lets portal users post replies to their ticket thread.

## Line-by-line walkthrough
- `"use client"` and imports (`useState`, `useRouter`).
- `Props` require `ticketId` and `portalToken`.
- State:
  - `body`, `loading`, `error`.
- `submit(event)`:
  - guard empty body.
  - POST to `/api/portal/tickets/:id/comments`.
  - send token and body.
  - refresh page on success.
  - handle failure/network errors.
- JSX:
  - textarea
  - conditional error text
  - submit button with loading state.

## Concepts taught by this file
- Child mutation component pattern
- Controlled text input with async write flow

## Common mistakes
- Forgetting to send token with request.
- Not clearing body after success.

## Mini exercises
1. Add remaining character counter.
2. Add optimistic comment preview before refresh.
3. Add `Cmd+Enter` shortcut.

## Further reading
- Search: `react optimistic ui basic`

