export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_on_customer"
  | "blocked"
  | "resolved"
  | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type UserRole = "admin" | "agent" | "viewer";

export type CommentAuthorType = "agent" | "customer" | "system";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  timezone: string;
}

export interface User {
  id: string;
  orgId: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Customer {
  id: string;
  orgId: string;
  name: string;
  email: string;
  company?: string;
  portalToken: string;
}

export interface Ticket {
  id: string;
  orgId: string;
  ticketNumber: number;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customerId: string;
  assigneeId: string | null;
  tags: string[];
  isMerged: boolean;
  mergedIntoId: string | null;
  firstResponseDueAt: string | null;
  resolutionDueAt: string | null;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  slaFirstResponseBreached: boolean;
  slaResolutionBreached: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  orgId: string;
  ticketId: string;
  authorType: CommentAuthorType;
  authorUserId: string | null;
  authorCustomerId: string | null;
  isInternal: boolean;
  bodyHtml: string;
  bodyText: string;
  createdAt: string;
}

export interface TicketEvent {
  id: string;
  orgId: string;
  ticketId: string;
  actorType: "agent" | "system";
  actorUserId: string | null;
  eventType: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface DeskPilotDb {
  organizations: Organization[];
  users: User[];
  customers: Customer[];
  tickets: Ticket[];
  comments: Comment[];
  ticketEvents: TicketEvent[];
}

export interface TicketTimelineEntry {
  kind: "comment" | "event";
  createdAt: string;
  comment?: Comment;
  event?: TicketEvent;
}

