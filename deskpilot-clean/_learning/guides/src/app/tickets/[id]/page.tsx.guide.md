# Guide: `src/app/tickets/[id]/page.tsx`

## Purpose
This is the most feature-rich page in the app. It shows one ticket’s details, timeline, comment composer, status actions, and customer panel.

## Line-by-line walkthrough
- Imports:
  - navigation helpers (`Link`, `notFound`).
  - interactive components (`CommentComposer`, `TicketActions`).
  - auth + store queries.
- `TicketDetailPage({ params })`:
  1. Authenticate user.
  2. Resolve `id`.
  3. Load ticket scoped by org; call `notFound()` if missing.
  4. Load related customer and timeline.
  5. Load DB to create `userMap` and `customerMap` for author names.
- JSX sections:
  - Header (ticket number/subject/status/priority).
  - Ticket details card (description + tags).
  - Two-column body:
    - Left: timeline + comment composer.
    - Right: status transition actions + customer summary card.
- Timeline rendering:
  - branches on `entry.kind` to render comment vs event.
  - comment author label logic switches agent/customer and internal note tag.

## State, scope, closures
- Server component uses request-time data only.
- No client state here; interactive state is delegated to child client components.
- Maps (`userMap`, `customerMap`) are local cached lookups for this render.

## Concepts taught by this file
- Record detail page orchestration
- Merged timeline rendering
- Server/client boundary design

## Common mistakes
- Rendering timeline without stable keys.
- Querying for user/customer names repeatedly inside map loop.
- Exposing internal notes in portal context (handled in portal page separately).

## Mini exercises
1. Add timeline filter toggle (comments/events/all).
2. Show assignee name and allow reassignment dropdown.
3. Add merged-ticket banner when `ticket.isMerged === true`.

## Further reading
- Search: `nextjs dynamic route server components`
- Search: `master detail ui patterns`

