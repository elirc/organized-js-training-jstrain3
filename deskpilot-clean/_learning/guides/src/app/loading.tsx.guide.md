# Guide: `src/app/loading.tsx`

## Purpose
This file renders a loading fallback while server components are fetching data.

## Line-by-line walkthrough
- Exports `LoadingPage()` with simple skeleton-like text.
- Uses shared classes for consistent appearance.

## Concepts taught by this file
- Route segment loading states

## Common mistakes
- Doing data fetching inside loading component.
- Forgetting loading states, causing blank delays.

## Mini exercises
1. Replace text with shimmer placeholders matching ticket list shape.
2. Add different loading UIs for nested route segments.

## Further reading
- Search: `nextjs loading.js app router`

