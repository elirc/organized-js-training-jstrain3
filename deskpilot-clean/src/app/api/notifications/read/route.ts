import { NextRequest } from "next/server";
import { ok } from "@/lib/api";

export async function POST(_request: NextRequest) {
  return ok({ updated: true });
}

