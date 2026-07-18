# Guide: `src/app/api/tickets/[id]/timeline/route.ts`

## Purpose
This route returns a combined, chronological timeline for one ticket (comments + events). It is used by the ticket detail page to show “what happened and when.”

## Line-by-line walkthrough
- Imports auth, envelope helper, and `getTimeline` store function.
- `GET(..., context)`:
  - authenticates user.
  - resolves ticket ID from params.
  - loads merged timeline entries from store.
  - returns timeline payload.

## Concepts taught by this file
- Aggregated read model endpoint
- Thin route handlers

## Common mistakes
- Sorting only comments or only events instead of merged stream.
- Forgetting tenant scope when fetching timeline data.

## Mini exercises
1. Add `kind` filter query param (only comments/events).
2. Add cursor pagination for long timelines.

## Further reading
- Search: `read model cqrs timeline`
- Search: `event feed pagination`

