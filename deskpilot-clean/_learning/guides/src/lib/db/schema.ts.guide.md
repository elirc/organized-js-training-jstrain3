# Guide: `src/lib/db/schema.ts`

## Purpose
This file is a placeholder for future Drizzle schema definitions. It currently documents that runtime persistence still uses JSON instead of SQL tables.

## Line-by-line walkthrough
- `export const schema = { note: ... }` exports a marker object.
- No table definitions exist yet.
- The value communicates project state to maintainers.

## Concepts taught by this file
- Incremental architecture migration
- Technical debt signaling in code

## Common mistakes
- Assuming Drizzle schema is complete because config exists.
- Forgetting to update this file when DB migration work begins.

## Mini exercises
1. Replace placeholder with one `tickets` table draft.
2. Add comment block with migration plan milestones.

## Further reading
- Search: `drizzle orm pgTable example`
- Search: `strangler pattern legacy migration`

