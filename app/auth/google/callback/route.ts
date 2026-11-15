import { NextRequest, NextResponse } from "next/server";
import { exchange } from "../../../../lib/google";
import { accountForGoogle, createSession } from "../../../../lib/auth";
import { COOKIE } from "../../../../lib/session";

export const dynamic = "force-dynamic";

/* Step two: Google sends the browser back here with a code.
 *
 * Every failure lands on /signin with a reason in the query rather than
 * a stack trace, because this page is reached by a person, not an API
 * client. The reasons are deliberately coarse: which Google account was
 * refused is not something to put in a URL. */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const fail = (why: string) =>
    NextResponse.redirect(new URL(`/signin?e=${why}`, req.url));

  if (url.searchParams.get("error")) return fail("google_cancelled");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = req.cookies.get("g_state")?.value;
  if (!code || !state || !expected || state !== expected) return fail("google_state");

  let found;
  try {
    found = await accountForGoogle(await exchange(code, url.origin));
  } catch (e) {
    console.error("[google]", e);
    return fail("google_failed");
  }

  const { token, expires } = await createSession(found.account.id);
  /* a brand new account has nothing to match against, so it starts at
     the CV rather than at a Today built on nothing */
  const res = NextResponse.redirect(
    new URL(found.isNew ? "/start" : "/today", req.url)
  );
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
  res.cookies.delete("g_state");
  return res;
}
