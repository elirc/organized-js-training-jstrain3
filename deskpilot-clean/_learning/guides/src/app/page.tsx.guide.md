# Guide: `src/app/page.tsx`

## Purpose
This root page redirects `/` to `/tickets`, making tickets the default landing screen.

## Line-by-line walkthrough
- Import `redirect` from `next/navigation`.
- `Home()` function executes `redirect("/tickets")`.
- No JSX render occurs because redirect short-circuits response.

## Concepts taught by this file
- Server-side redirects in App Router

## Common mistakes
- Returning JSX after `redirect()` (it won’t run).
- Using client-side router push for default route redirects when server redirect is cleaner.

## Mini exercises
1. Redirect admins to `/reports` and others to `/tickets`.
2. Add query param passthrough from `/` to destination.

## Further reading
- Search: `nextjs redirect server component`

