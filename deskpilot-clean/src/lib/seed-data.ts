import type { DeskPilotDb, TicketPriority, TicketStatus } from "@/lib/types";

const now = new Date();

function isoMinutesAgo(minutes: number): string {
  return new Date(now.getTime() - minutes * 60_000).toISOString();
}

function seededTicket(
  id: string,
  ticketNumber: number,
  subject: string,
  status: TicketStatus,
  priority: TicketPriority,
  customerId: string,
  assigneeId: string | null,
  tags: string[],
  minutesAgo: number,
) {
  const createdAt = isoMinutesAgo(minutesAgo);
  return {
    id,
    orgId: "org_acme",
    ticketNumber,
    subject,
    description: `${subject} details from customer.`,
    status,
    priority,
    customerId,
    assigneeId,
    tags,
    isMerged: false,
    mergedIntoId: null,
    firstResponseDueAt: null,
    resolutionDueAt: null,
    firstResponseAt: null,
    resolvedAt: status === "resolved" || status === "closed" ? isoMinutesAgo(minutesAgo - 120) : null,
    slaFirstResponseBreached: false,
    slaResolutionBreached: false,
    createdAt,
    updatedAt: createdAt,
  };
}

export const seedDb: DeskPilotDb = {
  organizations: [
    {
      id: "org_acme",
      name: "Acme Support",
      slug: "acme",
      timezone: "America/New_York",
    },
  ],
  users: [
    { id: "u_sarah", orgId: "org_acme", name: "Sarah Chen", email: "sarah@acme.dev", role: "admin" },
    { id: "u_mike", orgId: "org_acme", name: "Mike Johnson", email: "mike@acme.dev", role: "agent" },
    { id: "u_lisa", orgId: "org_acme", name: "Lisa Park", email: "lisa@acme.dev", role: "agent" },
    { id: "u_tom", orgId: "org_acme", name: "Tom Wilson", email: "tom@acme.dev", role: "viewer" },
  ],
  customers: [
    {
      id: "c_alice",
      orgId: "org_acme",
      name: "Alice Martinez",
      email: "alice@example.com",
      company: "TechCorp",
      portalToken: "portal_alice_token",
    },
    {
      id: "c_bob",
      orgId: "org_acme",
      name: "Bob Smith",
      email: "bob@example.com",
      company: "StartupXYZ",
      portalToken: "portal_bob_token",
    },
    {
      id: "c_carol",
      orgId: "org_acme",
      name: "Carol Davis",
      email: "carol@example.com",
      company: "BigRetail Inc",
      portalToken: "portal_carol_token",
    },
  ],
  tickets: [
    seededTicket("t_1", 1001, "Cannot reset password", "open", "high", "c_alice", "u_mike", ["Bug"], 300),
    seededTicket("t_2", 1002, "Billing overcharge report", "in_progress", "urgent", "c_bob", "u_lisa", ["Billing", "Urgent"], 500),
    seededTicket("t_3", 1003, "API timeout during checkout", "waiting_on_customer", "high", "c_alice", "u_sarah", ["Integration"], 700),
    seededTicket("t_4", 1004, "Need SSO setup docs", "blocked", "medium", "c_carol", "u_mike", ["Documentation"], 1000),
    seededTicket("t_5", 1005, "Feature request: CSV export", "resolved", "low", "c_bob", "u_lisa", ["Feature Request"], 1600),
    seededTicket("t_6", 1006, "Invoice PDF formatting issue", "closed", "medium", "c_carol", "u_sarah", ["Billing"], 2400),
  ],
  comments: [
    {
      id: "cm_1",
      orgId: "org_acme",
      ticketId: "t_1",
      authorType: "customer",
      authorUserId: null,
      authorCustomerId: "c_alice",
      isInternal: false,
      bodyHtml: "<p>I can’t reset my password.</p>",
      bodyText: "I can’t reset my password.",
      createdAt: isoMinutesAgo(299),
    },
    {
      id: "cm_2",
      orgId: "org_acme",
      ticketId: "t_2",
      authorType: "agent",
      authorUserId: "u_lisa",
      authorCustomerId: null,
      isInternal: false,
      bodyHtml: "<p>Thanks, we’re investigating this billing issue.</p>",
      bodyText: "Thanks, we’re investigating this billing issue.",
      createdAt: isoMinutesAgo(480),
    },
  ],
  ticketEvents: [
    {
      id: "ev_1",
      orgId: "org_acme",
      ticketId: "t_1",
      actorType: "system",
      actorUserId: null,
      eventType: "ticket.created",
      oldValue: null,
      newValue: { status: "open", priority: "high" },
      metadata: null,
      createdAt: isoMinutesAgo(300),
    },
    {
      id: "ev_2",
      orgId: "org_acme",
      ticketId: "t_2",
      actorType: "system",
      actorUserId: null,
      eventType: "ticket.created",
      oldValue: null,
      newValue: { status: "in_progress", priority: "urgent" },
      metadata: null,
      createdAt: isoMinutesAgo(500),
    },
  ],
};

