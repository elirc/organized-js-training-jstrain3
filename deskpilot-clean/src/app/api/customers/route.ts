import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getCustomers, readDb, writeDb } from "@/lib/store";
import { parseNonEmptyString } from "@/lib/validators";

export async function GET(_request: NextRequest) {
  const user = await requireUser();
  const customers = await getCustomers(user.orgId);
  return ok({ customers });
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  const payload = (await request.json()) as Record<string, unknown>;
  const name = parseNonEmptyString(payload.name, 2, 120);
  const email = parseNonEmptyString(payload.email, 5, 200);
  const company = payload.company ? parseNonEmptyString(payload.company, 1, 200) ?? undefined : undefined;

  if (!name || !email) {
    return fail("VALIDATION_ERROR", "name and email are required.");
  }

  const db = await readDb();
  const customer = {
    id: randomUUID(),
    orgId: user.orgId,
    name,
    email: email.toLowerCase(),
    company,
    portalToken: `portal_${randomUUID()}`,
  };
  db.customers.push(customer);
  await writeDb(db);

  return ok({ customer }, { status: 201 });
}
