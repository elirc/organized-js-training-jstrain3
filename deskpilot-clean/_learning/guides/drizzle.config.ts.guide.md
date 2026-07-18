# Guide: `drizzle.config.ts`

## Purpose
This config tells Drizzle where schema definitions live, where SQL migrations should be generated, and how to connect to Postgres. It is a bridge between TypeScript schema code and DB migration files.

## Line-by-line walkthrough
- `const drizzleConfig = { ... }` defines a plain config object.
- `schema: "./src/lib/db/schema.ts"` points to schema source.
- `out: "./src/lib/db/migrations"` is migration output folder.
- `dialect: "postgresql"` selects SQL dialect.
- `dbCredentials.url` pulls `DATABASE_URL` from env with empty fallback.
- `export default drizzleConfig` exports for Drizzle CLI to consume.

## Concepts taught by this file
- Tooling configuration
- Environment-driven configuration
- Migration generation pipeline

## Common mistakes
- Using wrong schema path so migrations generate nothing.
- Missing `DATABASE_URL` and silently connecting nowhere.
- Assuming this file means DB is already wired at runtime (it is not).

## Mini exercises
1. Point `out` to `./drizzle` and explain what else must change.
2. Add a runtime guard that throws if `DATABASE_URL` is empty.
3. Change dialect to mysql and list what in this project would break.

## Further reading
- Search: `drizzle orm config schema out`
- Search: `database migrations why`

