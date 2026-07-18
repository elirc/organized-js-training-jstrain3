# DeskPilot Concepts Glossary

Each concept includes a plain-English definition and a short example from this codebase.

## API Envelope
A consistent JSON shape for all API responses.
```ts
return NextResponse.json({ success: true, data }, init);
```

## Authentication Guard
A function that blocks access unless a user is present.
```ts
const user = await requireUser();
```

## Authorization (Ownership Check)
Verifying the caller is allowed to access a specific record.
```ts
if (!ticket || ticket.customerId !== customerId) return fail("NOT_FOUND", ...);
```

## State Machine
A rule table that controls which status changes are legal.
```ts
const rules: Record<TicketStatus, TicketStatus[]> = { open: ["in_progress", ...] };
```

## Guard Clause
Early return/throw for invalid conditions.
```ts
if (!nextStatus) return fail("VALIDATION_ERROR", ...);
```

## Dynamic Route Param
A path value like `[id]` read from route context.
```ts
const { id } = await context.params;
```

## Server Component
A React component that runs on the server and can fetch directly.
```tsx
export default async function TicketsPage(...) { ... }
```

## Client Component
A component marked with `"use client"` that can use hooks/events.
```tsx
"use client";
const [loading, setLoading] = useState(false);
```

## Controlled Input
Form input bound to React state.
```tsx
<input value={subject} onChange={(e) => setSubject(e.target.value)} />
```

## `router.refresh()`
Tells Next.js to re-fetch current route data after mutation.
```ts
router.refresh();
```

## `router.push()`
Navigates user to another route in client code.
```ts
router.push(`/tickets/${json.data.ticket.id}`);
```

## Validation (Runtime)
Checking `unknown` request values before use.
```ts
const subject = parseNonEmptyString(payload.subject, 3, 200);
```

## Type Narrowing
Turning a broad type into a safe specific type.
```ts
if (typeof value !== "string") return null;
```

## Union Type
Type that only allows specific values.
```ts
type TicketPriority = "low" | "medium" | "high" | "urgent";
```

## Null vs Undefined
`null` means “explicitly empty,” `undefined` often means “not provided.”
```ts
payload.assigneeId === null ? null : undefined;
```

## Tenant Scoping
Limiting data by organization to prevent cross-org leaks.
```ts
ticket.orgId === orgId
```

## Repository Pattern (Lightweight)
Centralized data access methods in one module.
```ts
export async function listTickets(...) { ... }
```

## Seed Data
Default records used when the data store is empty.
```ts
await writeFile(DB_PATH, JSON.stringify(seedDb, null, 2), "utf8");
```

## Write Serialization Queue
A promise chain that prevents overlapping writes.
```ts
writeQueue = writeQueue.then(() => writeDbInternal(db));
```

## Append-Only Audit Event
Recording changes as new events instead of mutating old event rows.
```ts
db.ticketEvents.push(buildEvent({ eventType: "ticket.updated", ... }));
```

## Timeline Read Model
A merged view of comments and events sorted by time.
```ts
return [...comments, ...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
```

## SSE (Server-Sent Events)
One-way real-time updates from server to browser over HTTP.
```ts
headers: { "Content-Type": "text/event-stream" }
```

## Closure
A function using variables from outer scope later.
```ts
let interval;
cancel() { if (interval) clearInterval(interval); }
```

## Side Effect
Operation that changes state outside function scope (disk/network/time).
```ts
await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
```

## Id Generation
Creating unique IDs for entities/events.
```ts
id: randomUUID()
```

## Portal Token Auth
Authenticating public users with token instead of session.
```ts
const token = request.headers.get("x-portal-token");
```

## Placeholder Implementation
A temporary stub preserving API contract before real logic.
```ts
return ok({ notifications: [] as Array<Record<string, unknown>> });
```

## HTTP 201 Created
Status code indicating a new resource was created.
```ts
return ok({ ticket }, { status: 201 });
```

## Not Found Boundary
Dedicated UI for missing resources.
```ts
notFound();
```

## Error Boundary
Fallback UI when rendering throws.
```tsx
export default function ErrorPage({ error, reset }: { ... }) { ... }
```

## Loading Boundary
Fallback UI while server data is loading.
```tsx
export default function LoadingPage() { ... }
```

## Design Tokens
Reusable CSS variables for theme consistency.
```css
:root { --accent: #0077ff; --danger: #d63939; }
```

## Route Group
A folder like `(auth)` used for organization without affecting URL.
```text
src/app/(auth)/login/page.tsx
```

## Derived Metric
Calculated value from base data.
```ts
const open = tickets.filter((t) => !["resolved","closed"].includes(t.status)).length;
```

## DTO-style Response Contract
Returning data shaped for UI consumption, not raw internals.
```ts
return ok({ kpis: { openTickets, resolvedTickets, ... } });
```

## Progressive Infrastructure
Having config for future systems while MVP runs simpler runtime.
```ts
// drizzle config exists, but store currently writes JSON file
```

## Mini-example beyond project
If you build a “tasks” app, use the same envelope + guard pattern:
```ts
if (!user) return fail("UNAUTHORIZED", "Login required", 401);
return ok({ tasks });
```

