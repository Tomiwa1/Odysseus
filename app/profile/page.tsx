import Profile, { type Skill } from "../../components/Profile";
import { requireUser } from "../../lib/user";
import { facts, prefs, setting } from "../../lib/db/queries";

export const dynamic = "force-dynamic";

/* Everything on this screen comes out of the database and goes back
   into it. The CV block says "no CV yet" rather than naming a file
   nobody uploaded, because this is the screen that claims to list what
   the product is working from. */
export default async function ProfilePage() {
  const u = await requireUser();

  const skills: Skill[] = facts(u, false)
    .filter((f) => f.kind === "skill")
    .map((f) => ({ id: f.id, label: f.label, active: f.active }));

  const cvName = setting(u, "cv_filename");
  const cv = cvName
    ? {
        name: cvName,
        readOn: `Read ${setting(u, "cv_read_on") ?? "recently"}`,
        found: setting(u, "cv_found") ?? "",
      }
    : null;

  return (
    <Profile
      cv={cv}
      skills={skills}
      want={prefs(u)}
      floor={setting(u, "salary_floor_k") ?? ""}
    />
  );
}
