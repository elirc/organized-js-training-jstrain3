# Guide: `src/app/not-found.tsx`

## Purpose
This file defines the UI shown when route handlers/pages call `notFound()` or a path does not exist.

## Line-by-line walkthrough
- Imports `Link` for recovery navigation.
- `NotFound()` component renders:
  - title,
  - explanation,
  - button back to tickets.

## Concepts taught by this file
- 404 user experience in App Router
- Recovery-first navigation

## Common mistakes
- Returning generic 500 UI for missing records.
- Not giving user a clear way back into app flow.

## Mini exercises
1. Add contextual message for missing ticket vs missing customer.
2. Add recent-ticket links as recovery options.

## Further reading
- Search: `nextjs not-found app router`

