# Guide: `src/app/api/portal/tickets/[id]/comments/route.ts`

## Purpose
This route lets a portal customer post a reply to one of their tickets. It enforces token ownership and blocks access to unrelated tickets.

## Line-by-line walkthrough
- Imports:
  - response helpers
  - store functions `addComment`, `getTicketById`, `readDb`
  - text validator
- `getPortalCustomerId` helper:
  - same token -> customer ID lookup pattern.
- `POST(..., context)` flow:
  1. Parse payload, read token from body or header.
  2. Validate `body` non-empty.
  3. Resolve customer from token; 401 if invalid.
  4. Resolve ticket by ID.
  5. Authorization check: ticket must belong to token customer.
  6. Add customer comment (`authorType: "customer"`, `isInternal: false`).
  7. Return 201 or 404 if add failed.

## Concepts taught by this file
- Object-level authorization (row ownership checks)
- Public write endpoint hardening
- Comment author typing

## Common mistakes
- Looking up ticket by hardcoded org (`"org_acme"` is currently a known workaround).
- Missing ownership check after ticket lookup.
- Allowing internal notes from portal user.

## Mini exercises
1. Remove hardcoded org lookup and infer from token customer.
2. Add auto-transition behavior after customer reply.
3. Add anti-spam cooldown (e.g., one reply per 10 seconds).

## Further reading
- Search: `object level authorization api`
- Search: `insecure direct object reference idor`

