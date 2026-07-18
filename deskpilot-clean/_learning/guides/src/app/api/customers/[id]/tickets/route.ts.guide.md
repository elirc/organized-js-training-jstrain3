# Guide: `src/app/api/customers/[id]/tickets/route.ts`

## Purpose
This route fetches all tickets for one customer within the current org. It powers customer profile ticket history.

## Line-by-line walkthrough
- Imports auth, envelope helper, and `listTickets`.
- `GET(..., context)`:
  - requires user.
  - reads `id` from params.
  - loads org tickets.
  - filters in-memory by `ticket.customerId === id`.
  - returns filtered list.

## Concepts taught by this file
- Derived endpoint from existing repository method
- Post-query filtering

## Common mistakes
- Returning tickets without org filtering first.
- Duplicating list logic instead of reusing repository function.

## Mini exercises
1. Sort customer tickets by `createdAt` descending.
2. Add optional `status` query filter.
3. Replace post-filter with dedicated store query for efficiency.

## Further reading
- Search: `backend filtering vs query optimization`
- Search: `api endpoint composition`

