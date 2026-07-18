# Guide: `src/app/portal/[id]/page.tsx`

## Purpose
This page shows a single portal ticket conversation and allows customer replies.

## Line-by-line walkthrough
- Imports:
  - `Link`, `notFound`.
  - `PortalReplyForm` client component.
  - store read helpers.
- Flow:
  1. resolve ticket ID and token from route/query.
  2. load customer by token; 404 if invalid token.
  3. load ticket and verify it belongs to that customer; 404 otherwise.
  4. load comments and filter out internal notes.
- Render:
  - header with ticket summary + back link.
  - conversation timeline of public comments only.
  - reply form with ticket ID + token props.

## Concepts taught by this file
- Object-level authorization in page rendering
- Data redaction (hide internal notes)
- Dynamic route + query token combination

## Common mistakes
- Showing internal comments to customer.
- Authorizing only by token presence, not ticket ownership.

## Mini exercises
1. Display “author role” badge for each comment.
2. Add portal SLA status message block.
3. Add attachment list placeholder per comment.

## Further reading
- Search: `idor prevention by ownership checks`
- Search: `secure customer support portals`

