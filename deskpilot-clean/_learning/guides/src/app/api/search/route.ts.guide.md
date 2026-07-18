# Guide: `src/app/api/search/route.ts`

## Purpose
This route provides a lightweight search endpoint over tickets using the existing list filter mechanism.

## Line-by-line walkthrough
- Imports auth, `ok`, and `listTickets`.
- `GET(request)`:
  - auth user.
  - reads `q` from query string.
  - calls `listTickets(user.orgId, { q })`.
  - returns matched tickets plus echo of query.

## Concepts taught by this file
- Search endpoint pattern
- Query string extraction
- Reusing repository filters

## Common mistakes
- Returning all tickets without auth.
- Not trimming or sanitizing search terms (handled inside store).

## Mini exercises
1. Reject 1-character queries like `q=a`.
2. Add `status:` structured filter parsing.
3. Add highlight snippet support in response.

## Further reading
- Search: `full text search api design`
- Search: `query parser structured filters`

