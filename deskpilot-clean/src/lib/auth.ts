import type { User } from "@/lib/types";
import { readDb } from "@/lib/store";

const DEFAULT_USER_EMAIL = "sarah@acme.dev";

export async function getCurrentUser(): Promise<User | null> {
  const db = await readDb();
  return db.users.find((user) => user.email === DEFAULT_USER_EMAIL) ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("No authenticated user.");
  }
  return user;
}

