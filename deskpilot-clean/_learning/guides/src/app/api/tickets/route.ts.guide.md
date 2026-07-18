# Guide: `src/app/api/tickets/route.ts`

## Purpose
This route handles ticket collection operations:
- `GET /api/tickets` for filtered listing
- `POST /api/tickets` for ticket creation

## Line-by-line walkthrough
- Imports:
  - `NextRequest` for query/body access.
  - `fail/ok` envelope helpers.
  - `requireUser` auth guard.
  - `createTicket`, `listTickets` store operations.
  - validators for request input.
- `GET(request)`:
  - authenticate user.
  - read optional `status`, `priority`, `q` query params.
  - call `listTickets` scoped to `user.orgId`.
  - return `ok({ tickets })`.
- `POST(request)`:
  - authenticate user.
  - parse JSON body as unknown record.
  - validate `subject`, `description`, `priority`, `customerId`.
  - if any invalid, return `fail("VALIDATION_ERROR",...)`.
  - create ticket with default assignee/tags and actor user ID.
  - return `201` success with created ticket.

## Concepts taught by this file
- REST collection route design
- Query param filters
- Body validation + error response
- Tenant-scoped writes

## Common mistakes
- Forgetting org scoping in list/create calls.
- Accepting body fields without validation.
- Returning 200 instead of 201 for create.

## Mini exercises
1. Add pagination params (`cursor`, `limit`) to GET.
2. Add optional `assigneeId` in POST with validation.
3. Reject ticket creation when customer doesn’t belong to org.

## Further reading
- Search: `rest resource collection endpoints`
- Search: `http 201 created semantics`

