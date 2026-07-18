# Guide: `src/app/api/events/stream/route.ts`

## Purpose
This route provides Server-Sent Events (SSE) stream plumbing. It currently emits a `ready` event once and periodic `heartbeat` events.

## Line-by-line walkthrough
- Import `NextResponse`.
- `GET()`:
  - declares `interval` in outer function scope so `cancel()` can clear it.
  - creates `ReadableStream` with:
    - `start(controller)`:
      - instantiate `TextEncoder`.
      - enqueue initial `ready` event payload.
      - start interval that enqueues heartbeat event every 15s.
    - `cancel()`:
      - clears interval to prevent leak.
  - returns `NextResponse(stream, headers)` with SSE headers:
    - `Content-Type: text/event-stream`
    - `Cache-Control: no-cache, no-transform`
    - `Connection: keep-alive`

## Scope/closure detail
- `interval` lives in closure shared by `start` and `cancel`.
- This is why cancel can stop the timer created in start.

## Concepts taught by this file
- SSE protocol basics
- Streams API
- Resource cleanup on cancellation

## Common mistakes
- Forgetting cleanup and leaking intervals.
- Sending JSON without `event:` and `data:` SSE formatting.
- Missing SSE headers so browser treats response as normal HTTP.

## Mini exercises
1. Add `ticket.updated` event push function.
2. Add `retry: 5000` SSE directive.
3. Scope stream to org/user and explain auth implications.

## Further reading
- Search: `server sent events nextjs route handlers`
- Search: `readablestream textencoder example`

