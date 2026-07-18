import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { transitionTicket, TransitionError } from "@/lib/state-machine";
import { parseTicketStatus } from "@/lib/validators";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;
  const payload = (await request.json()) as Record<string, unknown>;
  const nextStatus = parseTicketStatus(payload.nextStatus);

  if (!nextStatus) {
    return fail("VALIDATION_ERROR", "nextStatus is invalid.");
  }

  try {
    const ticket = await transitionTicket({
      orgId: user.orgId,
      ticketId: id,
      nextStatus,
      actorUserId: user.id,
    });
    return ok({ ticket });
  } catch (error) {
    if (error instanceof TransitionError) {
      return fail("TRANSITION_ERROR", error.message, 400);
    }
    return fail("INTERNAL_ERROR", "Unexpected transition failure.", 500);
  }
}

