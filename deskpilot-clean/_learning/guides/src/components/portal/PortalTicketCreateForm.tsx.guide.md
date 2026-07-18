# Guide: `src/components/portal/PortalTicketCreateForm.tsx`

## Purpose
Client-side form that lets a customer create a portal ticket with token + subject + description + priority.

## Line-by-line walkthrough
- `"use client"` for hooks.
- State variables:
  - `portalToken`, `subject`, `description`, `priority`
  - `error`, `loading`
- `submit(event)`:
  - prevents default.
  - sends POST `/api/portal/tickets`.
  - parses response envelope.
  - on success routes to portal ticket detail with token in query string.
  - on failure sets error.
- JSX:
  - controlled fields + required inputs.
  - error display and loading-aware submit button.

## Concepts taught by this file
- Public form handling
- Token propagation in client navigation

## Common mistakes
- Leaking token in logs/analytics.
- Not handling failed token validation gracefully.

## Mini exercises
1. Read token from URL and prefill automatically.
2. Add client-side minimum length checks.
3. Disable submit until token format passes regex.

## Further reading
- Search: `react form validation patterns`

