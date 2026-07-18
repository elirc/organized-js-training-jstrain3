import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { createTicket, listTickets } from "@/lib/store";
import { parseNonEmptyString, parseTicketPriority } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const status = request.nextUrl.searchParams.get("status") ?? undefined;
  const priority = request.nextUrl.searchParams.get("priority") ?? undefined;
  const q = request.nextUrl.searchParams.get("q") ?? undefined;

  const tickets = await listTickets(user.orgId, {
    status: (status as "all") ?? "all",
    priority: (priority as "all") ?? "all",
    q,
  });

  return ok({ tickets });
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const payload = (await request.json()) as Record<string, unknown>;

  const subject = parseNonEmptyString(payload.subject, 3, 200);
  const description = parseNonEmptyString(payload.description, 3, 4_000);
  const priority = parseTicketPriority(payload.priority);
  const customerId = parseNonEmptyString(payload.customerId, 1, 120);

  if (!subject || !description || !priority || !customerId) {
    return fail("VALIDATION_ERROR", "subject, description, priority and customerId are required.");
  }

  const ticket = await createTicket({
    orgId: user.orgId,
    subject,
    description,
    priority,
    customerId,
    assigneeId: null,
    tags: [],
    actorUserId: user.id,
  });

  return ok({ ticket }, { status: 201 });
}

