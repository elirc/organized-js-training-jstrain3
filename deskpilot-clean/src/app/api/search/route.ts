import { NextRequest } from "next/server";
import { ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { listTickets } from "@/lib/store";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const tickets = await listTickets(user.orgId, { q });
  return ok({ tickets, query: q });
}

