# Guide: `src/lib/auth.ts`

## Purpose
This file is a temporary authentication adapter. It simulates a logged-in user by loading a seeded email and provides a `requireUser()` guard for protected routes/pages.

## Line-by-line walkthrough
- Imports:
  - `User` type for return safety.
  - `readDb` to resolve current user from data store.
- `DEFAULT_USER_EMAIL`:
  - hardcoded “session user” stand-in.
- `getCurrentUser()`:
  - reads DB and finds user with default email.
  - returns `User | null`.
- `requireUser()`:
  - calls `getCurrentUser`.
  - throws if null.
  - returns guaranteed `User`.

## Concepts taught by this file
- Authentication guard pattern
- Null-check narrowing
- Temporary scaffolding vs production auth

## Common mistakes
- Assuming this is secure auth.
- Forgetting to call `requireUser` in new internal routes.
- Catching and suppressing auth errors, causing hidden security bugs.

## Mini exercises
1. Replace hardcoded email with a request header for local testing.
2. Return a custom `AuthError` instead of generic `Error`.
3. Add role-check helper: `requireRole("admin")`.

## Further reading
- Search: `nextjs auth guard server components`
- Search: `authorization vs authentication`

