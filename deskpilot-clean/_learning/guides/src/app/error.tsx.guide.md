# Guide: `src/app/error.tsx`

## Purpose
This is the App Router error boundary UI for runtime rendering errors. It gives users a retry action instead of a crash screen.

## Line-by-line walkthrough
- `"use client"` is required because error boundaries are client components.
- Component props:
  - `error: Error` message from thrown exception.
  - `reset()` function to retry rendering.
- Renders error heading/message and “Try Again” button bound to `reset`.

## Concepts taught by this file
- Error boundaries in Next.js App Router
- Recovery UX

## Common mistakes
- Forgetting `"use client"` in error boundary.
- Showing sensitive internal stack traces to users.

## Mini exercises
1. Log error to a monitoring endpoint before rendering message.
2. Add route-specific friendly messages by checking `error.message`.

## Further reading
- Search: `nextjs app router error.js reset`

