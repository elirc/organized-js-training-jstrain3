import { NextRequest } from "next/server";
import { ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { listTickets } from "@/lib/store";

export async function GET(_request: NextRequest) {
  const user = await requireUser();
  const tickets = await listTickets(user.orgId);
  const openTickets = tickets.filter((ticket) => !["resolved", "closed"].includes(ticket.status)).length;
  const resolvedTickets = tickets.filter((ticket) => ["resolved", "closed"].includes(ticket.status)).length;
  const urgentTickets = tickets.filter((ticket) => ticket.priority === "urgent").length;
  const waitingOnCustomer = tickets.filter((ticket) => ticket.status === "waiting_on_customer").length;

  return ok({
    kpis: {
      openTickets,
      resolvedTickets,
      urgentTickets,
      waitingOnCustomer,
      totalTickets: tickets.length,
    },
  });
}

