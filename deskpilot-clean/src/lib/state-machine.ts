import type { TicketStatus } from "@/lib/types";
import { addTransitionEvent, getTicketById, setTicketStatus } from "@/lib/store";

const rules: Record<TicketStatus, TicketStatus[]> = {
  open: ["in_progress", "waiting_on_customer", "blocked", "resolved", "closed"],
  in_progress: ["waiting_on_customer", "blocked", "resolved", "closed"],
  waiting_on_customer: ["in_progress", "blocked", "resolved", "closed"],
  blocked: ["in_progress", "resolved", "closed"],
  resolved: ["in_progress", "closed"],
  closed: ["in_progress"],
};

export class TransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransitionError";
  }
}

export async function transitionTicket(input: {
  orgId: string;
  ticketId: string;
  nextStatus: TicketStatus;
  actorUserId?: string | null;
}) {
  const ticket = await getTicketById(input.orgId, input.ticketId);
  if (!ticket) {
    throw new TransitionError("Ticket not found.");
  }
  if (ticket.isMerged) {
    throw new TransitionError("Merged tickets cannot transition.");
  }
  if (ticket.status === input.nextStatus) {
    return ticket;
  }
  if (!rules[ticket.status].includes(input.nextStatus)) {
    throw new TransitionError(`Cannot transition from ${ticket.status} to ${input.nextStatus}.`);
  }

  const oldStatus = ticket.status;
  const updated = await setTicketStatus({
    orgId: input.orgId,
    ticketId: input.ticketId,
    status: input.nextStatus,
  });

  if (!updated) {
    throw new TransitionError("Failed to update ticket status.");
  }

  await addTransitionEvent({
    orgId: input.orgId,
    ticketId: input.ticketId,
    oldStatus,
    newStatus: input.nextStatus,
    actorUserId: input.actorUserId ?? null,
  });

  return updated;
}

export function allowedTransitions(status: TicketStatus): TicketStatus[] {
  return rules[status];
}

