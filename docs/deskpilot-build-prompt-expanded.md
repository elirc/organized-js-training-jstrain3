# DeskPilot - Build Prompt (Expanded, Agent-Ready)

Use this prompt with a coding LLM/agent to build DeskPilot in phases.
This version is cleaned up, implementation-focused, and optimized for iterative execution in a local repo.

---

## How To Use This Prompt

1. Paste this entire prompt into your coding LLM.
2. Ask it to start at **Phase 1**.
3. Require a checkpoint after each phase:
   - what was built
   - files changed
   - commands run
   - known issues
   - explicit request for your approval before next phase
4. Continue phase-by-phase until complete.

---

## Prompt Starts Below

You are building **DeskPilot**, a production-grade support ticket system with:

- ticket lifecycle state machine
- SLA tracking and breach detection
- assignments and automation rules
- full-text search
- canned replies
- notifications (in-app + email)
- reports dashboards
- customer portal
- real-time updates via SSE

Build it as a **full-stack Next.js app** and keep the app runnable after each phase.

## Operating Rules

- Use **TypeScript strict mode**.
- Keep code modular and production-oriented.
- No `any` except unavoidable generic `catch (err: unknown)`.
- Validate all API inputs with Zod.
- Use a consistent API response envelope:
  - success: `{ success: true, data }`
  - error: `{ success: false, error: { code, message } }`
- Every agent API route must enforce:
  - authenticated user
  - organization membership
  - tenant scoping (`org_id`) on all queries
- Portal routes authenticate by `portal_token` and must never leak internal notes.
- Never update `tickets.status` directly; all status changes go through the state machine.
- Keep an append-only audit trail.

## Tech Stack

- Frontend: Next.js 14 App Router, React 18, TypeScript
- UI: shadcn/ui + Tailwind
- Server state: TanStack Query
- Local UI state: Zustand
- API: Next.js Route Handlers (`src/app/api/...`)
- DB: PostgreSQL 16
- ORM: Drizzle ORM
- Jobs: BullMQ + Redis
- Auth: NextAuth/Auth.js v5 (credentials + Google OAuth)
- Email: Nodemailer + React Email
- Realtime: Server-Sent Events (SSE)
- Editor: Tiptap
- Validation: Zod
- Tests: Vitest + Playwright
- Runtime packaging: Docker Compose

## Recommended Project Structure

Use the structure from the original DeskPilot prompt (tickets/customers/reports/settings/portal + matching API routes + `/src/lib` domain modules + components/hooks/stores).
If a folder does not exist yet, create it when first needed by the current phase.

## Data Model (Core)

Implement at minimum these entities with proper relations, indexes, and tenant scoping:

- organizations
- users
- sessions/accounts/verification tokens (for auth)
- customers
- tickets
- comments
- ticket_events (append-only audit log)
- tags
- ticket_tags (many-to-many)
- canned_replies
- notifications
- sla_policies
- assignment_rules
- assignment_cursors (for round-robin)
- search support columns/indexes (`tsvector` + GIN)

Ticket fields should include:

- `id`, `org_id`, `ticket_number` (per-org sequential), `subject`
- `status`, `priority`, `channel`
- `customer_id`, `assignee_id`, `created_by_user_id`
- SLA fields:
  - `sla_policy_id`
  - `first_response_due_at`
  - `resolution_due_at`
  - `first_response_at`
  - `resolved_at`
  - `sla_first_response_breached`
  - `sla_resolution_breached`
- merge fields:
  - `is_merged`
  - `merged_into_id`
- search fields:
  - `search_vector`
  - optional `last_activity_at`
- timestamps (`created_at`, `updated_at`)

Comments should include:

- `ticket_id`, `org_id`
- `author_type` (`agent` | `customer` | `system`)
- `author_user_id` and/or `author_customer_id`
- `is_internal`
- `body_html`, `body_text`
- timestamps

Ticket events should include:

- `ticket_id`, `org_id`, `actor_type`, `actor_user_id` (nullable for system)
- `event_type`
- `old_value` JSONB, `new_value` JSONB
- metadata JSONB
- `created_at`

## Status State Machine

States:

- `open`
- `in_progress`
- `waiting_on_customer`
- `blocked`
- `resolved`
- `closed`

Create transition rules and guards in dedicated modules:

- `src/lib/state-machine/ticket-states.ts`
- `src/lib/state-machine/guards.ts`
- `src/lib/state-machine/engine.ts`

Key transition requirements:

- all transitions validated centrally
- writes happen in a transaction
- event written to `ticket_events`
- automatic transitions also flow through state machine:
  - agent public reply on waiting ticket -> `waiting_on_customer`
  - customer reply on waiting/resolved ticket -> `in_progress`

## Search Requirements

Implement PostgreSQL full-text search with:

- `tsvector` maintained on ticket/comment writes
- query parser supporting:
  - quoted phrases
  - OR
  - negation
  - structured filters (`status:`, `tag:`, `assignee:`, `priority:`)
- `ts_headline` highlighting
- empty query fallback -> recent tickets
- reject one-character search queries

## SLA Requirements

Implement SLA system with:

- policy matching by priority/tag/default fallback
- due time calculation using org business hours + holidays
- repeatable BullMQ job for breach checks
- warnings before breach + breach notifications
- SLA events in `ticket_events`

## Notifications

Create notification service for:

- ticket assignment
- customer replies
- `@mention` in internal notes
- SLA warning
- SLA breach
- reassignment

Support channels:

- in-app (DB record)
- email (queued)

Create React Email templates:

- ticket-assigned
- ticket-reply
- sla-warning
- sla-breached

## Real-Time (SSE)

Implement:

- worker publishes to Redis pub/sub
- SSE endpoint subscribes by org/user channels
- client hooks auto-reconnect
- events:
  - `ticket.updated`
  - `ticket.comment_added`
  - `ticket.assigned`
  - `notification.new`
  - `sla.warning`
  - `sla.breached`

## Ticket Merge

Merging ticket A into ticket B must:

1. validate same org, not same ticket, target not merged
2. execute transaction:
   - copy comments with merge note
   - merge tags deduplicated
   - mark A merged and set `merged_into_id`
   - close A through state machine
   - write events for both tickets
3. hide merged tickets from default list
4. show banner on merged ticket detail linking to target

## Customer Portal

Route group: `/portal`

Flows:

- submit ticket
- view own tickets
- reply to public conversation

Security:

- authenticate by `portal_token` (cryptographically strong)
- scope token to one customer/org
- never expose internal comments via portal endpoints

## Reporting

Create report endpoints and pages:

- overview KPIs
- SLA compliance trend
- agent performance
- ticket volume over time

Support date ranges and filters.

## API Surface (Minimum)

Implement route handlers for:

- auth
- tickets list/create/detail/update
- comments create/list
- assign
- transition
- tags set
- merge
- timeline
- sla status
- customers CRUD + customer tickets
- search
- canned replies CRUD
- tags CRUD
- sla policies CRUD
- reports endpoints
- notifications list + mark read
- SSE stream
- portal tickets + portal comments

## Seed Data

Create seed script for:

- org: `Acme Support`
- users:
  - Sarah Chen (admin)
  - Mike Johnson (agent)
  - Lisa Park (agent)
  - Tom Wilson (viewer)
- shared password: `password123`
- customers:
  - Alice Martinez
  - Bob Smith
  - Carol Davis
- tags: Bug, Feature Request, Billing, Urgent, Documentation, Integration
- SLA policies: Urgent, High, Standard(default)
- canned replies with shortcuts
- assignment rules:
  - urgent -> round robin Sarah/Mike
  - Billing tag -> Lisa
  - default -> round robin all agents
- 15 realistic sample tickets with mixed states/comments/events and some SLA breaches

## Implementation Phases

Complete in this exact order and stop for approval after each phase.

1. Foundation
   - docker compose
   - env example
   - drizzle config/schema/migrations setup
   - db client
   - auth wiring
   - root app shell + nav + redirect
2. Ticket CRUD (baseline)
3. Comments + sanitization + body_text extraction
4. State machine + transition endpoint + automatic transitions
5. Audit timeline (comments/events interleaved)
6. Tags + priority update flows
7. Assignment + round-robin + auto-assignment
8. Customers + profile/history + portal token generation
9. Full-text search + parser + UI integration
10. SLA policies + calculator + checker + UI indicators
11. Notifications + email templates + mention parsing
12. Realtime SSE end-to-end
13. Canned replies + slash command + variable substitution + usage tracking
14. Ticket merge flow
15. Reports pages + APIs
16. Customer portal (submit/view/reply)
17. Polish:
   - loading states/skeletons
   - error boundaries
   - keyboard shortcuts
   - empty states
   - responsive behavior
   - accessibility checks
   - tests (unit + e2e smoke)

## Phase Output Contract

At the end of each phase, output:

1. `Phase <N> Summary`
2. `Files Added/Changed`
3. `Migrations Added/Updated`
4. `Commands Run` (install/build/test/migrate/seed)
5. `What Works Now`
6. `Known Gaps / Risks`
7. `Requesting approval to start Phase <N+1>`

Do not start the next phase until approval is given.

## Quality Gates Per Phase

Before requesting approval:

- project builds (`next build` or at least `tsc --noEmit`)
- lint passes (or list exact lint issues if lint not configured yet)
- tests relevant to phase run successfully
- migrations apply cleanly
- no placeholder TODOs in critical execution paths

If any gate fails, report it clearly and propose fix options.

## Non-Functional Requirements

- cursor-based pagination where applicable
- UTC storage, org-timezone display
- parameterized queries only
- strict tenant isolation
- accessible controls and focus management
- desktop-first responsive behavior (usable at >=1024px)

## Start Command

Start now with **Phase 1 (Foundation)** and follow the phase output contract.

---

## Prompt Ends

Notes:

- If the existing codebase differs from this structure, adapt pragmatically without breaking behavior.
- Prefer incremental, testable delivery over large unverified jumps.
