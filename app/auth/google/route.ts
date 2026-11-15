import { NextRequest, NextResponse } from "next/server";
import { authUrl, newState, googleConfigured } from "../../../lib/google";

export const dynamic = "force-dynamic";

/* Step one: send the browser to Google.
 *
 * The state is random, kept in a short lived cookie and checked on the
 * way back. Without it, anyone could hand you a callback URL of their
 * making and sign you into their account instead of yours. */
export async function GET(req: NextRequest) {
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL("/signin?e=google_off", req.url));
  }

  const state = newState();
  const res = NextResponse.redirect(authUrl(req.nextUrl.origin, state));
  res.cookies.set("g_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
