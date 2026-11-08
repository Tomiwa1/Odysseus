"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  accountByEmail, createAccount, verifyPassword, createSession, endSession,
} from "../lib/auth";
import { COOKIE } from "../lib/session";

/* The three things a sign in screen can do.
 *
 * Errors are deliberately vague about which half was wrong. "No account
 * with that email" tells anyone with a list of addresses which ones are
 * real, so both failures say the same thing. */

const SAME = "That email and password do not match an account.";

function setCookie(token: string, expires: Date, jar: Awaited<ReturnType<typeof cookies>>) {
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function signIn(_prev: unknown, form: FormData) {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Both fields, please." };

  const account = accountByEmail(email);
  /* an account with no password set cannot be signed into, rather than
     "no password" quietly meaning "any password" */
  if (!account || !verifyPassword(password, account.password)) return { error: SAME };

  const { token, expires } = createSession(account.id);
  setCookie(token, expires, await cookies());
  redirect("/today");
}

export async function signUp(_prev: unknown, form: FormData) {
  const email = String(form.get("email") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const password = String(form.get("password") ?? "");

  if (!email.includes("@")) return { error: "That does not look like an email address." };
  if (password.length < 8) return { error: "Eight characters or more, please." };
  if (accountByEmail(email)) return { error: "There is already an account with that email." };

  const account = createAccount(email, name, password);
  const { token, expires } = createSession(account.id);
  setCookie(token, expires, await cookies());
  redirect("/start");
}

export async function signOut() {
  const jar = await cookies();
  endSession(jar.get(COOKIE)?.value);
  jar.delete(COOKIE);
  redirect("/");
}
