# Guide: `src/app/portal/page.tsx`

## Purpose
This server page is the public customer portal home: it shows token-based ticket list and includes the portal ticket creation form.

## Line-by-line walkthrough
- Imports:
  - `Link` for detail navigation.
  - `PortalTicketCreateForm` client component.
  - `readDb` for lookup.
- Flow:
  1. Read `token` query param (default demo token).
  2. Load DB and resolve customer by portal token.
  3. If customer exists, filter tickets by customer ownership and not merged.
- Render:
  - page title + token display.
  - ticket submit form.
  - conditional area:
    - valid token => list tickets.
    - invalid token => guidance message.

## Concepts taught by this file
- Public page token scoping
- Server + client composition
- Conditional rendering by authorization result

## Common mistakes
- Exposing unrelated tickets on invalid token.
- Treating token as trusted without DB lookup.

## Mini exercises
1. Move token display behind a debug flag.
2. Add portal search over customer’s tickets.
3. Add status filter tabs.

## Further reading
- Search: `public portal token auth patterns`

