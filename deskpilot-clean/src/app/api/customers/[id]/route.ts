import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getCustomerById, readDb, writeDb } from "@/lib/store";
import { parseNonEmptyString } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;
  const customer = await getCustomerById(user.orgId, id);
  if (!customer) {
    return fail("NOT_FOUND", "Customer not found.", 404);
  }
  return ok({ customer });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await context.params;
  const payload = (await request.json()) as Record<string, unknown>;

  const name = payload.name ? parseNonEmptyString(payload.name, 2, 120) : undefined;
  const email = payload.email ? parseNonEmptyString(payload.email, 5, 200) : undefined;
  const company = payload.company ? parseNonEmptyString(payload.company, 1, 200) ?? undefined : undefined;

  const db = await readDb();
  const customer = db.customers.find((item) => item.orgId === user.orgId && item.id === id);
  if (!customer) {
    return fail("NOT_FOUND", "Customer not found.", 404);
  }

  if (name) {
    customer.name = name;
  }
  if (email) {
    customer.email = email;
  }
  if (company !== undefined) {
    customer.company = company;
  }
  await writeDb(db);
  return ok({ customer });
}
