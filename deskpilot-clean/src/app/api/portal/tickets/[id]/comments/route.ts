import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { addComment, getTicketById, readDb } from "@/lib/store";
import { parseNonEmptyString } from "@/lib/validators";

function getPortalCustomerId(db: Awaited<ReturnType<typeof readDb>>, token: string | null): string | null {
  if (!token) {
    return null;
  }
  const customer = db.customers.find((item) => item.portalToken === token);
  return customer?.id ?? null;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const payload = (await request.json()) as Record<string, unknown>;
  const token = (payload.portalToken as string | undefined) ?? request.headers.get("x-portal-token");
  const body = parseNonEmptyString(payload.body, 1, 4000);
  if (!body) {
    return fail("VALIDATION_ERROR", "body is required.");
  }

  const db = await readDb();
  const customerId = getPortalCustomerId(db, token ?? null);
  if (!customerId) {
    return fail("UNAUTHORIZED", "Invalid portal token.", 401);
  }

  const { id } = await context.params;
  const ticket = await getTicketById("org_acme", id);
  if (!ticket || ticket.customerId !== customerId) {
    return fail("NOT_FOUND", "Ticket not found.", 404);
  }

  const comment = await addComment({
    orgId: ticket.orgId,
    ticketId: id,
    body,
    isInternal: false,
    authorType: "customer",
    authorCustomerId: customerId,
  });

  if (!comment) {
    return fail("NOT_FOUND", "Ticket not found.", 404);
  }
  return ok({ comment }, { status: 201 });
}

