# Guide: `src/app/api/tickets/[id]/route.ts`

## Purpose
This route handles single-ticket operations:
- `GET /api/tickets/:id` fetches one ticket
- `PATCH /api/tickets/:id` updates editable ticket fields

## Line-by-line walkthrough
- Imports include auth, store, response helpers, and validators.
- `GET(..., context)`:
  - reads dynamic route param `id` from `context.params`.
  - loads ticket by org + ID.
  - returns 404 with `fail(...)` if missing.
  - returns ticket envelope if found.
- `PATCH(..., context)`:
  - authenticates and parses payload.
  - parses optional fields:
    - `subject`
    - `priority`
    - `assigneeId` (supports explicit `null`)
    - `tags` array filtered to strings
  - calls `updateTicketFields` with actor ID.
  - returns 404 if ticket missing.
  - returns updated ticket on success.

## Concepts taught by this file
- Dynamic route params
- Partial updates (PATCH semantics)
- Null vs undefined meaning
- Audit-friendly update delegation

## Common mistakes
- Treating missing and `null` assignee as same thing. This file makes exactly that mistake: a missing
  `assigneeId` becomes `undefined` (lines 32-37) but is still passed as a key (line 46), and the store's
  `hasOwnProperty` check (`src/lib/store.ts:217`) then writes `null`. See `_learning/03-PATTERNS.md`,
  finding 13.
- Patching fields directly in route instead of store helper.
- Allowing unsafe types in tags array.

## Mini exercises
1. Add validation to cap tags at 10 items.
2. Add `priority` downgrade restriction for non-admin users.
3. Return changed-field diff in response.

## Further reading
- Search: `patch vs put http`
- Search: `typescript null vs undefined api design`

