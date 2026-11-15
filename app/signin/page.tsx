import { redirect } from "next/navigation";
import SignIn from "../../components/SignIn";
import { currentAccount } from "../../lib/session";
import { googleConfigured } from "../../lib/google";

export const dynamic = "force-dynamic";

/* What can go wrong on the way back from Google, in words.
 *
 * Coarse on purpose: which account was refused does not belong in a
 * URL. Each one still says what to do next, because "sign in failed"
 * leaves a person with nowhere to go. */
const REASONS: Record<string, string> = {
  google_off: "Google sign in is not set up yet. Use an email and password.",
  google_cancelled: "That was cancelled at Google. Nothing happened.",
  google_state: "That sign in link had expired. Try again from here.",
  google_failed: "Google would not complete the sign in. Try again, or use a password.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  /* already signed in, so there is nothing to ask */
  if (await currentAccount()) redirect("/today");

  const { e } = await searchParams;
  return <SignIn google={googleConfigured()} notice={e ? REASONS[e] ?? null : null} />;
}
