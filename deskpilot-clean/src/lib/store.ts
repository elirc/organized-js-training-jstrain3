import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { seedDb } from "@/lib/seed-data";
import type {
  Comment,
  Customer,
  DeskPilotDb,
  Ticket,
  TicketEvent,
  TicketPriority,
  TicketStatus,
  TicketTimelineEntry,
} from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "deskpilot.json");

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDbFile(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DB_PATH, "utf8");
  } catch {
    await writeFile(DB_PATH, JSON.stringify(seedDb, null, 2), "utf8");
  }
}

export async function readDb(): Promise<DeskPilotDb> {
  await ensureDbFile();
  const raw = await readFile(DB_PATH, "utf8");
  return JSON.parse(raw) as DeskPilotDb;
}

function writeDbInternal(db: DeskPilotDb): Promise<void> {
  return writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export async function writeDb(db: DeskPilotDb): Promise<void> {
  await ensureDbFile();
  writeQueue = writeQueue.then(() => writeDbInternal(db));
  await writeQueue;
}

export interface TicketListFilters {
  status?: TicketStatus | "all";
  priority?: TicketPriority | "all";
  q?: string;
}

export async function listTickets(orgId: string, filters: TicketListFilters = {}): Promise<Ticket[]> {
  const db = await readDb();
  const q = filters.q?.trim().toLowerCase();

  return db.tickets
    .filter((ticket) => {
      if (ticket.orgId !== orgId || ticket.isMerged) {
        return false;
      }
      if (filters.status && filters.status !== "all" && ticket.status !== filters.status) {
        return false;
      }
      if (filters.priority && filters.priority !== "all" && ticket.priority !== filters.priority) {
        return false;
      }
      if (q && !(`${ticket.subject} ${ticket.description}`.toLowerCase().includes(q))) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getTicketById(orgId: string, ticketId: string): Promise<Ticket | null> {
  const db = await readDb();
  return db.tickets.find((ticket) => ticket.orgId === orgId && ticket.id === ticketId) ?? null;
}

export async function getCustomers(orgId: string): Promise<Customer[]> {
  const db = await readDb();
  return db.customers
    .filter((customer) => customer.orgId === orgId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCustomerById(orgId: string, customerId: string): Promise<Customer | null> {
  const db = await readDb();
  return db.customers.find((customer) => customer.orgId === orgId && customer.id === customerId) ?? null;
}

export async function getTimeline(orgId: string, ticketId: string): Promise<TicketTimelineEntry[]> {
  const db = await readDb();
  const comments = db.comments
    .filter((comment) => comment.orgId === orgId && comment.ticketId === ticketId)
    .map<TicketTimelineEntry>((comment) => ({ kind: "comment", createdAt: comment.createdAt, comment }));
  const events = db.ticketEvents
    .filter((event) => event.orgId === orgId && event.ticketId === ticketId)
    .map<TicketTimelineEntry>((event) => ({ kind: "event", createdAt: event.createdAt, event }));

  return [...comments, ...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function nextTicketNumber(tickets: Ticket[], orgId: string): number {
  const max = tickets
    .filter((ticket) => ticket.orgId === orgId)
    .reduce((acc, ticket) => Math.max(acc, ticket.ticketNumber), 0);
  return max + 1;
}

function nowIso(): string {
  return new Date().toISOString();
}

function buildEvent(params: {
  orgId: string;
  ticketId: string;
  actorUserId?: string | null;
  actorType: "agent" | "system";
  eventType: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}): TicketEvent {
  return {
    id: randomUUID(),
    orgId: params.orgId,
    ticketId: params.ticketId,
    actorType: params.actorType,
    actorUserId: params.actorUserId ?? null,
    eventType: params.eventType,
    oldValue: params.oldValue ?? null,
    newValue: params.newValue ?? null,
    metadata: params.metadata ?? null,
    createdAt: nowIso(),
  };
}

export async function createTicket(input: {
  orgId: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  customerId: string;
  assigneeId?: string | null;
  tags?: string[];
  actorUserId?: string | null;
}): Promise<Ticket> {
  const db = await readDb();
  const createdAt = nowIso();
  const ticket: Ticket = {
    id: randomUUID(),
    orgId: input.orgId,
    ticketNumber: nextTicketNumber(db.tickets, input.orgId),
    subject: input.subject,
    description: input.description,
    status: "open",
    priority: input.priority,
    customerId: input.customerId,
    assigneeId: input.assigneeId ?? null,
    tags: input.tags ?? [],
    isMerged: false,
    mergedIntoId: null,
    firstResponseDueAt: null,
    resolutionDueAt: null,
    firstResponseAt: null,
    resolvedAt: null,
    slaFirstResponseBreached: false,
    slaResolutionBreached: false,
    createdAt,
    updatedAt: createdAt,
  };

  db.tickets.push(ticket);
  db.ticketEvents.push(
    buildEvent({
      orgId: input.orgId,
      ticketId: ticket.id,
      actorType: "agent",
      actorUserId: input.actorUserId ?? null,
      eventType: "ticket.created",
      newValue: { status: ticket.status, priority: ticket.priority },
    }),
  );
  await writeDb(db);
  return ticket;
}

export async function updateTicketFields(input: {
  orgId: string;
  ticketId: string;
  actorUserId?: string | null;
  subject?: string;
  priority?: TicketPriority;
  assigneeId?: string | null;
  tags?: string[];
}): Promise<Ticket | null> {
  const db = await readDb();
  const ticket = db.tickets.find((item) => item.orgId === input.orgId && item.id === input.ticketId);
  if (!ticket) {
    return null;
  }

  const oldValue: Record<string, unknown> = {};
  const newValue: Record<string, unknown> = {};

  if (typeof input.subject === "string" && input.subject !== ticket.subject) {
    oldValue.subject = ticket.subject;
    ticket.subject = input.subject;
    newValue.subject = ticket.subject;
  }
  if (input.priority && input.priority !== ticket.priority) {
    oldValue.priority = ticket.priority;
    ticket.priority = input.priority;
    newValue.priority = ticket.priority;
  }
  if (Object.prototype.hasOwnProperty.call(input, "assigneeId") && input.assigneeId !== ticket.assigneeId) {
    oldValue.assigneeId = ticket.assigneeId;
    ticket.assigneeId = input.assigneeId ?? null;
    newValue.assigneeId = ticket.assigneeId;
  }
  if (Array.isArray(input.tags)) {
    const deduped = Array.from(new Set(input.tags.map((tag) => tag.trim()).filter(Boolean)));
    if (JSON.stringify(deduped) !== JSON.stringify(ticket.tags)) {
      oldValue.tags = ticket.tags;
      ticket.tags = deduped;
      newValue.tags = ticket.tags;
    }
  }

  ticket.updatedAt = nowIso();

  if (Object.keys(newValue).length > 0) {
    db.ticketEvents.push(
      buildEvent({
        orgId: input.orgId,
        ticketId: ticket.id,
        actorType: "agent",
        actorUserId: input.actorUserId ?? null,
        eventType: "ticket.updated",
        oldValue,
        newValue,
      }),
    );
  }

  await writeDb(db);
  return ticket;
}

export async function addComment(input: {
  orgId: string;
  ticketId: string;
  body: string;
  isInternal: boolean;
  authorType: "agent" | "customer";
  authorUserId?: string | null;
  authorCustomerId?: string | null;
}): Promise<Comment | null> {
  const db = await readDb();
  const ticket = db.tickets.find((item) => item.orgId === input.orgId && item.id === input.ticketId);
  if (!ticket) {
    return null;
  }

  const body = input.body.trim();
  if (!body) {
    return null;
  }

  const comment: Comment = {
    id: randomUUID(),
    orgId: input.orgId,
    ticketId: input.ticketId,
    authorType: input.authorType,
    authorUserId: input.authorUserId ?? null,
    authorCustomerId: input.authorCustomerId ?? null,
    isInternal: input.isInternal,
    bodyHtml: `<p>${body.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</p>`,
    bodyText: body,
    createdAt: nowIso(),
  };

  db.comments.push(comment);
  ticket.updatedAt = comment.createdAt;
  if (!ticket.firstResponseAt && input.authorType === "agent" && !input.isInternal) {
    ticket.firstResponseAt = comment.createdAt;
  }
  db.ticketEvents.push(
    buildEvent({
      orgId: input.orgId,
      ticketId: ticket.id,
      actorType: input.authorType === "agent" ? "agent" : "system",
      actorUserId: input.authorUserId ?? null,
      eventType: "comment.added",
      newValue: { commentId: comment.id, isInternal: comment.isInternal, authorType: comment.authorType },
    }),
  );
  await writeDb(db);
  return comment;
}

export async function getTicketComments(orgId: string, ticketId: string): Promise<Comment[]> {
  const db = await readDb();
  return db.comments
    .filter((comment) => comment.orgId === orgId && comment.ticketId === ticketId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function addTransitionEvent(input: {
  orgId: string;
  ticketId: string;
  actorUserId?: string | null;
  oldStatus: TicketStatus;
  newStatus: TicketStatus;
}): Promise<void> {
  const db = await readDb();
  db.ticketEvents.push(
    buildEvent({
      orgId: input.orgId,
      ticketId: input.ticketId,
      actorType: "agent",
      actorUserId: input.actorUserId ?? null,
      eventType: "ticket.status_changed",
      oldValue: { status: input.oldStatus },
      newValue: { status: input.newStatus },
    }),
  );
  await writeDb(db);
}

export async function setTicketStatus(input: {
  orgId: string;
  ticketId: string;
  status: TicketStatus;
}): Promise<Ticket | null> {
  const db = await readDb();
  const ticket = db.tickets.find((item) => item.orgId === input.orgId && item.id === input.ticketId);
  if (!ticket) {
    return null;
  }
  ticket.status = input.status;
  if (input.status === "resolved" || input.status === "closed") {
    ticket.resolvedAt = nowIso();
  }
  ticket.updatedAt = nowIso();
  await writeDb(db);
  return ticket;
}

