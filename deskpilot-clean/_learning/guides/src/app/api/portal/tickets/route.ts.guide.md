# Guide: `src/app/api/portal/tickets/route.ts`

## Purpose
This route powers customer portal ticket list and ticket creation using a portal token instead of session auth.

## Line-by-line walkthrough
- Imports:
  - response helpers
  - store functions (`createTicket`, `readDb`)
  - validators
- `getPortalCustomerId(db, token)` helper:
  - returns customer ID when token matches.
  - returns `null` when token missing/invalid.
- `GET(request)`:
  - token from header `x-portal-token` or query `token`.
  - validates token via helper.
  - unauthorized => 401.
  - filters tickets by matching `customerId` and non-merged.
  - returns ticket list.
- `POST(request)`:
  - token from body.
  - validate token and payload (`subject`, `description`, `priority`).
  - ensure customer exists.
  - create ticket under customer org with `actorUserId: null`.
  - return 201.

## Concepts taught by this file
- Token-based public API auth
- Public endpoint validation flow
- Customer-scoped data access

## Common mistakes
- Accepting token without scoping resulting data.
- Exposing merged/internal records in portal views.
- Using weak token generation schemes.

## Mini exercises
1. Add request rate limiting by token.
2. Move token extraction to middleware/helper shared by portal routes.
3. Add explicit `channel: "portal"` field on created tickets.

## Further reading
- Search: `bearer token vs magic link auth`
- Search: `public api security checklist`

