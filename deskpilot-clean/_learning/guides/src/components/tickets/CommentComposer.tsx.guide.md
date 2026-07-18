# Guide: `src/components/tickets/CommentComposer.tsx`

## Purpose
This client component lets agents post public replies or internal notes to a ticket.

## Line-by-line walkthrough
- `"use client"` enables hooks.
- Imports `useState` and `useRouter`.
- `Props` carries `ticketId`.
- Local state:
  - `body`, `isInternal`, `loading`, `error`.
- `submit(event)`:
  - prevents default form submit navigation.
  - skips empty body.
  - sends POST to `/api/tickets/:id/comments`.
  - handles success/failure via response envelope.
  - clears body and refreshes on success.
- JSX:
  - textarea for message body.
  - checkbox toggling internal note.
  - inline error display.
  - submit button with loading text.

## Concepts taught by this file
- Form + checkbox state handling
- Conditional UX feedback
- Mutations followed by data refresh

## Common mistakes
- Not trimming body before submit.
- Sending internal notes through portal endpoints.
- Forgetting to clear form after successful post.

## Mini exercises
1. Add markdown preview toggle.
2. Add keyboard shortcut `Cmd+Enter` to submit.
3. Disable internal notes for viewer role.

## Further reading
- Search: `react textarea controlled component`
- Search: `form accessibility labels inputs`

