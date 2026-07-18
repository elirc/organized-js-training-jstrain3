# Guide: `src/app/(auth)/login/page.tsx`

## Purpose
This is a placeholder login page. It explains that real auth is scaffolded but currently bypassed using seeded user lookup.

## Line-by-line walkthrough
- Imports `Link`.
- Component renders title, explanatory text, and CTA to `/tickets`.
- No auth form submission exists yet.

## Concepts taught by this file
- Placeholder UX for incomplete auth
- Route groups (`(auth)`) organization

## Common mistakes
- Assuming this page actually authenticates users.
- Shipping placeholder auth in production.

## Mini exercises
1. Add email/password form with no-op submit validation.
2. Wire this page to NextAuth once auth is implemented.

## Further reading
- Search: `nextjs route groups app router`
- Search: `nextauth credentials provider`

