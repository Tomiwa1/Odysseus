import Start from "../../components/Start";
import { requireUser } from "../../lib/user";

export const dynamic = "force-dynamic";

export default async function StartPage() {
  await requireUser();
  return <Start />;
}
