# Guide: `src/app/api/customers/[id]/route.ts`

## Purpose
This route provides single-customer read and update:
- `GET /api/customers/:id`
- `PATCH /api/customers/:id`

## Line-by-line walkthrough
- Imports auth, response helpers, store read/write functions, and validator.
- `GET`:
  - auth user.
  - read customer by org + id.
  - 404 if missing.
- `PATCH`:
  - auth user.
  - parse optional `name`, `email`, `company`.
  - load DB and find customer scoped to org.
  - update fields only when provided.
  - persist with `writeDb`.
  - return updated object.

## Concepts taught by this file
- Single-resource update flow
- Partial field patching
- Scoped lookup with in-memory persistence

## Common mistakes
- Updating all fields blindly and wiping existing values.
- Failing to 404 on tenant mismatch.

## Mini exercises
1. Add immutable field rule (email cannot change once set).
2. Add validation for max company length 100.
3. Append a `customer.updated` event to timeline model.

## Further reading
- Search: `patch endpoint partial update best practices`
- Search: `multitenant authorization patterns`

