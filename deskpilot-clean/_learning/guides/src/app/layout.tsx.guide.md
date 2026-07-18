# Guide: `src/app/layout.tsx`

## Purpose
This is the root App Router layout that wraps every page. It defines metadata, global shell structure, and sidebar navigation links.

## Line-by-line walkthrough
- Imports:
  - `Metadata` type for SEO metadata typing.
  - `Link` for client-side route navigation.
  - global CSS.
- `metadata` object:
  - sets app title/description once for all routes.
- `RootLayout({ children })`:
  - returns HTML root with `<body>`.
  - defines shell structure:
    - `aside.sidebar` with brand and nav.
    - `main.content` where current route page renders via `children`.
- Nav links map to route groups:
  - tickets, customers, reports, settings, portal.

## Concepts taught by this file
- Next.js root layout composition
- Shared shell UI pattern
- Route navigation with `Link`

## Common mistakes
- Putting page-specific data fetching in root layout.
- Forgetting to render `{children}`, causing blank routes.

## Mini exercises
1. Highlight active nav link based on current pathname.
2. Add top bar user menu component.
3. Split portal into a separate minimal layout.

## Further reading
- Search: `nextjs app router layout patterns`
- Search: `shared layout ui architecture`

