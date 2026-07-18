# Guide: `src/app/tickets/page.tsx`

## Purpose
This server page renders the main ticket inbox: filters + ticket list + navigation to details and creation.

## Line-by-line walkthrough
- Imports:
  - `Link` for navigation.
  - `listTickets`, `readDb` for data.
  - `requireUser` for auth guard.
- Page signature includes `searchParams` promise from App Router.
- Flow:
  1. Resolve current user.
  2. Resolve query params.
  3. Call `listTickets` with status/priority/q filters.
  4. Build `customerMap` from DB for display labels.
- JSX:
  - header with “Tickets” + “New Ticket” button.
  - filter form using GET query params.
  - list of ticket cards linking to `/tickets/:id`.
  - empty state when no matches.

## State management and control flow
- This is server-rendered state, not React client state.
- Control flow is simple:
  - compute data first,
  - then render from data.

## Concepts taught by this file
- Server component data loading
- Query-string-driven filtering
- Display model mapping (customer ID -> name)

## Common mistakes
- Doing this filtering on client only (worse for large datasets).
- Forgetting to preserve query params in form default values.
- N+1 lookups for customer names; map avoids repeated searches.

## Mini exercises
1. Add sort selector (updated desc/created asc/priority).
2. Add assignee filter.
3. Add pagination controls.

## Further reading
- Search: `nextjs server components searchParams`
- Search: `server side filtering vs client side filtering`

