import { NextRequest } from "next/server";
import { ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getTimeline } from "@/lib/store";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;
  const timeline = await getTimeline(user.orgId, id);
  return ok({ timeline });
}

