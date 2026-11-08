import { redirect } from "next/navigation";
import SignIn from "../../components/SignIn";
import { currentAccount } from "../../lib/session";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  /* already signed in, so there is nothing to ask */
  if (await currentAccount()) redirect("/today");
  return <SignIn />;
}
