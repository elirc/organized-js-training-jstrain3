import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { addComment, getTicketComments } from "@/lib/store";
import { parseNonEmptyString } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;
  const comments = await getTicketComments(user.orgId, id);
  return ok({ comments });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;
  const payload = (await request.json()) as Record<string, unknown>;

  const body = parseNonEmptyString(payload.body, 1, 4000);
  const isInternal = Boolean(payload.isInternal);
  if (!body) {
    return fail("VALIDATION_ERROR", "body is required.");
  }

  const comment = await addComment({
    orgId: user.orgId,
    ticketId: id,
    body,
    isInternal,
    authorType: "agent",
    authorUserId: user.id,
  });

  if (!comment) {
    return fail("NOT_FOUND", "Ticket not found.", 404);
  }
  return ok({ comment }, { status: 201 });
}

