import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getTicketById, updateTicketFields } from "@/lib/store";
import { parseNonEmptyString, parseTicketPriority } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;
  const ticket = await getTicketById(user.orgId, id);

  if (!ticket) {
    return fail("NOT_FOUND", "Ticket not found.", 404);
  }

  return ok({ ticket });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;
  const payload = (await request.json()) as Record<string, unknown>;

  const subject = payload.subject ? parseNonEmptyString(payload.subject, 3, 200) ?? undefined : undefined;
  const priority = payload.priority ? parseTicketPriority(payload.priority) ?? undefined : undefined;
  const assigneeId =
    payload.assigneeId === null
      ? null
      : payload.assigneeId
        ? parseNonEmptyString(payload.assigneeId, 1, 120) ?? undefined
        : undefined;
  const tags = Array.isArray(payload.tags) ? payload.tags.filter((tag) => typeof tag === "string") as string[] : undefined;

  const ticket = await updateTicketFields({
    orgId: user.orgId,
    ticketId: id,
    actorUserId: user.id,
    subject,
    priority,
    assigneeId,
    tags,
  });

  if (!ticket) {
    return fail("NOT_FOUND", "Ticket not found.", 404);
  }

  return ok({ ticket });
}
