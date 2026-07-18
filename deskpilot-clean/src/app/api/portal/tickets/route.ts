import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { createTicket, readDb } from "@/lib/store";
import { parseNonEmptyString, parseTicketPriority } from "@/lib/validators";

function getPortalCustomerId(db: Awaited<ReturnType<typeof readDb>>, token: string | null): string | null {
  if (!token) {
    return null;
  }
  const customer = db.customers.find((item) => item.portalToken === token);
  return customer?.id ?? null;
}

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-portal-token") ?? request.nextUrl.searchParams.get("token");
  const db = await readDb();
  const customerId = getPortalCustomerId(db, token);
  if (!customerId) {
    return fail("UNAUTHORIZED", "Invalid portal token.", 401);
  }

  const tickets = db.tickets.filter((ticket) => ticket.customerId === customerId && !ticket.isMerged);
  return ok({ tickets });
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Record<string, unknown>;
  const token = (payload.portalToken as string | undefined) ?? null;
  const db = await readDb();
  const customerId = getPortalCustomerId(db, token);
  if (!customerId) {
    return fail("UNAUTHORIZED", "Invalid portal token.", 401);
  }

  const subject = parseNonEmptyString(payload.subject, 3, 200);
  const description = parseNonEmptyString(payload.description, 3, 4000);
  const priority = parseTicketPriority(payload.priority);

  if (!subject || !description || !priority) {
    return fail("VALIDATION_ERROR", "subject, description, and priority are required.");
  }

  const customer = db.customers.find((item) => item.id === customerId);
  if (!customer) {
    return fail("NOT_FOUND", "Customer not found.", 404);
  }

  const ticket = await createTicket({
    orgId: customer.orgId,
    subject,
    description,
    priority,
    customerId,
    actorUserId: null,
  });
  return ok({ ticket }, { status: 201 });
}

