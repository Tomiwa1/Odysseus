import { redirect } from "next/navigation";
import { currentAccount } from "./session";

/* Who the request is for.
 *
 * This used to return one hardcoded id. It reads the session cookie
 * now, and the screens that need a user send you to sign in rather than
 * guessing one. The schema already carried user_id on every row, so
 * nothing below this line had to change.
 *
 * A guard per page rather than middleware: middleware runs on the edge
 * runtime, which cannot open the database. */
export async function requireUser(): Promise<string> {
  const account = await currentAccount();
  if (!account) redirect("/signin");
  return account.id;
}

export async function optionalUser(): Promise<string | null> {
  return (await currentAccount())?.id ?? null;
}
