import type { TicketPriority, TicketStatus } from "@/lib/types";

const ticketPriorities: TicketPriority[] = ["low", "medium", "high", "urgent"];
const ticketStatuses: TicketStatus[] = [
  "open",
  "in_progress",
  "waiting_on_customer",
  "blocked",
  "resolved",
  "closed",
];

export function parseTicketPriority(value: unknown): TicketPriority | null {
  return typeof value === "string" && ticketPriorities.includes(value as TicketPriority)
    ? (value as TicketPriority)
    : null;
}

export function parseTicketStatus(value: unknown): TicketStatus | null {
  return typeof value === "string" && ticketStatuses.includes(value as TicketStatus)
    ? (value as TicketStatus)
    : null;
}

export function parseNonEmptyString(value: unknown, min = 1, max = 500): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    return null;
  }
  return trimmed;
}

