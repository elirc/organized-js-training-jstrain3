# Guide: `src/app/customers/page.tsx`

## Purpose
This server page lists customers and shows each customer’s ticket count.

## Line-by-line walkthrough
- Imports auth guard and store methods.
- Flow:
  - load user, customers, and tickets.
  - build `countByCustomer` map by iterating tickets.
- Render:
  - page title
  - customer cards linking to detail pages
  - each card displays email/company and ticket count badge.

## Concepts taught by this file
- Server-side aggregation with `Map`
- List/detail navigation pattern

## Common mistakes
- Recomputing counts inside render loop (slower).
- Not guarding by org before listing.

## Mini exercises
1. Sort customers by ticket count descending.
2. Add search field by name/email.
3. Show last ticket update date per customer.

## Further reading
- Search: `javascript map counting pattern`

