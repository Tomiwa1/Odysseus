import Profile from "../../components/Profile";
import { requireUser } from "../../lib/user";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  await requireUser();
  return <Profile />;
}
