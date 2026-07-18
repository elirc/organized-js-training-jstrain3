import { NextRequest } from "next/server";
import { ok } from "@/lib/api";

export async function GET(_request: NextRequest) {
  return ok({ notifications: [] as Array<Record<string, unknown>> });
}

