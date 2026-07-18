# Guide: `src/app/tickets/new/page.tsx`

## Purpose
This server page prepares data for ticket creation and renders the `NewTicketForm` client component.

## Line-by-line walkthrough
- Imports:
  - `Link` for back navigation.
  - auth guard and `getCustomers` for dropdown options.
  - `NewTicketForm` component.
- `NewTicketPage()`:
  - requires current user.
  - loads org customers.
  - renders page header and form component with `customers` prop.

## Concepts taught by this file
- Server-to-client prop handoff
- Composition of data-fetching page + interactive form component

## Common mistakes
- Fetching customers again in client component (duplicate work).
- Letting unauthenticated users reach create form.

## Mini exercises
1. Preselect customer from query param (`?customerId=`).
2. Add breadcrumb navigation.

## Further reading
- Search: `nextjs server component passing props to client component`

