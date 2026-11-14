"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../lib/user";
import { readPdf } from "../lib/cv/pdf";
import { readCv } from "../lib/cv/read";
import { db, now } from "../lib/db/index";
import { setSetting } from "../lib/db/queries";

/* Reading a CV.
 *
 * The whole product rests on this being honest, so:
 *
 *   A PDF that cannot be read says so and changes nothing. A scan, an
 *   encrypted file or a wrong file type leaves the profile exactly as
 *   it was, rather than half replacing it with whatever parsed.
 *
 *   Every fact stores the line it came from, so the profile can show
 *   the user their own sentence when it explains a match.
 *
 *   Replacing a CV removes the facts the last one produced and nothing
 *   else. Skills typed or switched on by hand survive, because the
 *   person put them there and a new file is not a reason to discard
 *   what they said.
 */

const MAX = 10 * 1024 * 1024;

export type CvResult =
  | { ok: true; filename: string; skills: number; achievements: number; years: number | null }
  | { ok: false; why: string };

export async function uploadCv(form: FormData): Promise<CvResult> {
  const user = await requireUser();
  const file = form.get("cv");

  if (!(file instanceof File) || file.size === 0) return { ok: false, why: "No file arrived." };
  if (file.size > MAX) return { ok: false, why: "That file is over 10MB." };

  const bytes = Buffer.from(await file.arrayBuffer());
  const read = readPdf(bytes);
  /* nothing is written when nothing could be read */
  if (!read.ok) return { ok: false, why: read.why };

  const { facts, years } = readCv(read.text);
  if (facts.length === 0) {
    return {
      ok: false,
      why: "That read fine, but nothing in it matched anything we know how to look for.",
    };
  }

  const handle = db();
  const t = now();

  handle.exec("BEGIN");
  try {
    /* only the previous CV's facts go; anything you added by hand stays */
    handle.prepare(`DELETE FROM facts WHERE user_id = ? AND source = 'cv'`).run(user);

    const insert = handle.prepare(
      `INSERT INTO facts (user_id, kind, term, label, proof, source, active, created_at)
       VALUES (?, ?, ?, ?, ?, 'cv', 1, ?)`
    );
    for (const f of facts) insert.run(user, f.kind, f.term, f.label, f.proof, t);
    if (years != null) {
      insert.run(user, "years", String(years), `${years} years`,
        `${years} years, read from the dates on your CV`, t);
    }
    handle.exec("COMMIT");
  } catch (e) {
    handle.exec("ROLLBACK");
    throw e;
  }

  const skills = facts.filter((f) => f.kind === "skill").length;
  const achievements = facts.filter((f) => f.kind === "achievement").length;

  setSetting(user, "cv_filename", file.name);
  setSetting(user, "cv_read_on", new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long" }));
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  setSetting(user, "cv_found",
    `${plural(skills, "skill", "skills")}, ${plural(achievements, "thing you did", "things you did")}`);

  revalidatePath("/profile");
  revalidatePath("/today");
  revalidatePath("/job");

  return { ok: true, filename: file.name, skills, achievements, years };
}
