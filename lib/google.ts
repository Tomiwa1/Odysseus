import { randomBytes } from "node:crypto";

/* Sign in with Google, by hand.
 *
 * The authorization code flow, which is the only one safe for a server:
 * the browser is sent to Google and comes back with a short lived code,
 * and the code is exchanged for tokens from here, over TLS, with the
 * secret. Nothing sensitive passes through the browser.
 *
 * The id_token is a JWT. Its signature is not checked, deliberately: it
 * arrives in the body of a direct TLS response from Google's token
 * endpoint rather than from the browser, so there is nobody in between
 * to have forged it. Google's own guidance says the same. If the token
 * ever started arriving by another route, this would have to verify it.
 */

const AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN = "https://oauth2.googleapis.com/token";

export const googleConfigured = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

/* The redirect has to match what is registered in Google's console
   character for character, so it is derived from one place. */
export function callbackUrl(origin: string) {
  return `${origin.replace(/\/$/, "")}/auth/google/callback`;
}

export function authUrl(origin: string, state: string) {
  const q = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: callbackUrl(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    /* an account chooser rather than silently reusing whichever Google
       account the browser happens to be signed into */
    prompt: "select_account",
  });
  return `${AUTH}?${q}`;
}

export const newState = () => randomBytes(16).toString("base64url");

export type GoogleUser = { sub: string; email: string; name: string | null };

export async function exchange(code: string, origin: string): Promise<GoogleUser> {
  const res = await fetch(TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: callbackUrl(origin),
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    /* Google says what was wrong, and it is nearly always a redirect
       that does not match the console. Saying so beats "sign in failed". */
    const detail = await res.text();
    throw new Error(`Google refused the code exchange: ${detail.slice(0, 300)}`);
  }

  const { id_token } = (await res.json()) as { id_token?: string };
  if (!id_token) throw new Error("Google returned no id_token.");

  const payload = JSON.parse(
    Buffer.from(id_token.split(".")[1], "base64").toString("utf8")
  ) as { sub?: string; email?: string; name?: string; email_verified?: boolean };

  if (!payload.sub || !payload.email) throw new Error("Google returned no email.");
  /* an unverified address could belong to someone else, and an account
     is keyed on it */
  if (payload.email_verified === false) {
    throw new Error("That Google account has an unverified email address.");
  }

  return { sub: payload.sub, email: payload.email.toLowerCase(), name: payload.name ?? null };
}
