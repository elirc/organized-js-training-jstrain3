# Guide: `src/lib/api.ts`

## Purpose
This file standardizes HTTP JSON response format for all route handlers. It prevents each route from inventing its own response shape.

## Line-by-line walkthrough
- Import `NextResponse` from `next/server`.
- `ok<T>(data, init?)`:
  - generic helper for success responses.
  - returns `{ success: true, data }` with optional status/headers.
- `fail(code, message, status=400)`:
  - helper for error responses.
  - returns `{ success: false, error: { code, message } }`.
  - default status `400`.

## Concepts taught by this file
- Response envelope pattern
- Generic function typing
- API consistency

## Common mistakes
- Returning raw objects from routes (inconsistent contract).
- Returning HTTP 200 for error body without status code.
- Forgetting machine-readable `code` for frontend branching.

## Mini exercises
1. Add `okPaginated(data, pageInfo)` helper.
2. Add correlation ID header to both helpers.
3. Add typed error code union to reduce typo risk.

## Further reading
- Search: `api response envelope design`
- Search: `http status code semantics`

