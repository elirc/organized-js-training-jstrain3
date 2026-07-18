# Guide: `docker-compose.yml`

## Purpose
This file describes the intended production-like local environment: app server, worker process, PostgreSQL, and Redis. Even though the current MVP data layer is JSON-based, this file shows where the project is headed architecturally.

## Line-by-line walkthrough
- `services:` starts the top-level map of containers.
- `app` service:
  - `build: .` builds from this repo’s Dockerfile context.
  - `ports: "3000:3000"` exposes Next.js app.
  - `env_file: .env` injects runtime env vars.
  - `depends_on` ensures DB/cache start first.
- `worker` service:
  - same image build as app.
  - `command: node worker/index.js` runs background worker entrypoint.
  - same env and dependency setup as app.
- `postgres` service:
  - official `postgres:16-alpine` image.
  - environment creates DB/user/password.
  - `5432:5432` for local DB access.
  - persistent volume `pgdata`.
- `redis` service:
  - `redis:7-alpine` image.
  - `6379:6379` exposed.
- `volumes: pgdata` declares named persistent storage.

## Concepts taught by this file
- Container orchestration
- Service dependency ordering
- Stateful volumes
- Environment injection

## Common mistakes
- Thinking `depends_on` means “service is ready” (it only means “started”).
- Hardcoding secrets in compose instead of env file.
- Forgetting persistent volume for Postgres data.

## Mini exercises
1. Add a `healthcheck` for `postgres` and make `app` wait for health.
2. Change Redis port mapping to `6380:6379` and update app env accordingly.
3. Add a dedicated `test-db` service and explain when you’d use it.

## Further reading
- Search: `docker compose depends_on healthcheck`
- Search: `postgres docker persistent volume`
- Search: `12 factor app config`

