# Guide: `worker/index.js`

## Purpose
This is a placeholder worker entrypoint. It marks where background jobs (email sending, SLA checks, indexing) would run in a separate process from the web app.

## Line-by-line walkthrough
- `console.log(...)` prints startup confirmation.
- There are no imports or job loops yet, so this file is intentionally incomplete.

## Concepts taught by this file
- Background process separation
- Worker vs web process architecture

## Common mistakes
- Running heavy background work inside API routes instead of workers.
- Assuming this placeholder already executes queues.

## Mini exercises
1. Add a timer that logs every 30 seconds and explain why timers are usually not enough for production jobs.
2. Add graceful shutdown handling (`SIGTERM`) and explain why containerized apps need it.

## Further reading
- Search: `node worker process architecture`
- Search: `bullmq worker basics`

