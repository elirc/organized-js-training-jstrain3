# Guide: `src/components/tickets/NewTicketForm.tsx`

## Purpose
This client component handles ticket creation form state and submits to `POST /api/tickets`.

## Line-by-line walkthrough
- `"use client"` enables hooks/events.
- Imports:
  - `useState` for local form state.
  - `useRouter` for navigation + refresh after creation.
- Local interfaces:
  - `CustomerOption` shapes dropdown data.
  - `Props` defines incoming `customers`.
- Component state:
  - `subject`, `description`, `priority`, `customerId`
  - `error`, `loading` for UX feedback.
- `handleSubmit(event)`:
  - `preventDefault` avoids full page reload.
  - sets loading and clears old errors.
  - sends JSON POST to `/api/tickets`.
  - parses response envelope.
  - error branch updates `error` state.
  - success branch navigates to new ticket detail page and refreshes data.
  - `finally` toggles loading off.
- JSX:
  - controlled inputs for all fields.
  - required constraints.
  - conditional error message.
  - submit button with loading label.

## Scope/closure notes
- `handleSubmit` closes over all form state values.
- Each `setX` triggers re-render with latest state.

## Concepts taught by this file
- Controlled forms
- Async submit lifecycle (`try/catch/finally`)
- Optimistic UX messaging

## Common mistakes
- Not disabling submit during request (duplicate submissions).
- Forgetting to parse response envelope.
- Not initializing customer selection safely when list is empty.

## Mini exercises
1. Add client-side min length validation before fetch.
2. Disable submit unless all fields are valid.
3. Preserve draft in `localStorage`.

## Further reading
- Search: `react controlled form best practices`
- Search: `async form submission patterns`

