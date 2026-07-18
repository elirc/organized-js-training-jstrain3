# Guide: `src/app/api/tickets/[id]/comments/route.ts`

## Purpose
This route manages comments for one ticket:
- `GET` list comments
- `POST` add an agent comment/internal note

## Line-by-line walkthrough
- Imports:
  - response helpers, auth guard, comment store methods, string validator.
- `GET(..., context)`:
  - requires user.
  - gets ticket ID from route params.
  - returns comment list from store.
- `POST(..., context)`:
  - requires user.
  - validates `body`.
  - coerces `isInternal` to boolean.
  - calls `addComment` with `authorType: "agent"`.
  - if store returns `null`, route returns 404 (ticket missing).
  - success returns 201 with comment.

## Concepts taught by this file
- Child resource routing (`tickets/:id/comments`)
- Input sanitation path (delegated to store for HTML escaping)
- Internal vs public comment flags

## Common mistakes
- Forgetting internal notes should be hidden from portal views.
- Accepting empty comment bodies.
- Not refreshing ticket `updatedAt` on comment write (handled in store).

## Mini exercises
1. Add endpoint support for editing comment text with audit event.
2. Add max body length guard in route before store call.
3. Add `GET` query to hide internal comments for viewer role.

## Further reading
- Search: `nested rest resources`
- Search: `audit trails comments systems`

