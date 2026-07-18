import { NextRequest } from "next/server";
import { ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { listTickets } from "@/lib/store";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;
  const tickets = await listTickets(user.orgId);
  const customerTickets = tickets.filter((ticket) => ticket.customerId === id);
  return ok({ tickets: customerTickets });
}

