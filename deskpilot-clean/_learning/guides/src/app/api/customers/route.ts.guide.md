# Guide: `src/app/api/customers/route.ts`

## Purpose
This route manages customer collection operations:
- `GET` list customers for current org
- `POST` create a new customer with portal token

## Line-by-line walkthrough
- Imports include Node `randomUUID` for IDs/tokens.
- `GET`:
  - requires user.
  - returns org-scoped customers from store helper.
- `POST`:
  - requires user and parses payload.
  - validates `name` and `email`; optional `company`.
  - returns validation error if required fields missing.
  - loads DB, appends new customer object.
  - generates `portalToken` as `portal_${uuid}`.
  - writes DB and returns 201.

## Concepts taught by this file
- Entity creation endpoint
- ID/token generation
- Optional field parsing

## Common mistakes
- Not normalizing email (`toLowerCase()`).
- Creating portal token with predictable/random-weak method.
- Missing org scoping on write.

## Mini exercises
1. Reject duplicate email per org.
2. Add email format validation.
3. Move customer creation into a store helper for consistency.

## Further reading
- Search: `uuid collision probability`
- Search: `api idempotent create patterns`

