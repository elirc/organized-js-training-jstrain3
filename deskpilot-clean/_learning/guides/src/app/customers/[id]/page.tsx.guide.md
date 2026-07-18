# Guide: `src/app/customers/[id]/page.tsx`

## Purpose
This page shows one customer profile and their ticket history.

## Line-by-line walkthrough
- Imports `Link`, `notFound`, auth and store helpers.
- Flow:
  - authenticate user.
  - load customer by ID + org; `notFound()` if missing.
  - load tickets and filter by customer ID.
- Render sections:
  - header with back button.
  - profile card (email/company/portal token).
  - ticket history list with status/priority badges.

## Concepts taught by this file
- Dynamic route record lookup
- Related-data filtering
- Displaying sensitive support metadata (portal token)

## Common mistakes
- Exposing portal token to unauthorized users.
- Forgetting 404 for invalid customer IDs.

## Mini exercises
1. Mask portal token by default with reveal toggle.
2. Add copy-to-clipboard token button.
3. Show customer lifetime ticket stats card.

## Further reading
- Search: `record detail page best practices`

