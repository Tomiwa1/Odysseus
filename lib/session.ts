import { cookies } from "next/headers";
import { userIdForToken, accountById, type Account } from "./auth";

export const COOKIE = "odysseus_session";

/* Who is asking. Null when nobody is signed in, and every screen that
   needs a user has to deal with that rather than assume one. */
export async function currentAccount(): Promise<Account | null> {
  const jar = await cookies();
  const id = await userIdForToken(jar.get(COOKIE)?.value);
  return id ? accountById(id) : null;
}

export async function requireAccount(): Promise<Account> {
  const account = await currentAccount();
  if (!account) throw new Error("Not signed in");
  return account;
}
