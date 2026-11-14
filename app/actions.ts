"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../lib/user";
import * as q from "../lib/db/queries";

/* What the screens are allowed to change.
 *
 * Every one of these writes and then tells Next to re-render the pages
 * that read it, so what you see after a tap is what is actually stored
 * rather than a hopeful bit of local state.
 *
 * Every write is awaited before the revalidate. Firing one off and
 * re-rendering immediately raced the write, and a write that then
 * failed went nowhere except an unhandled rejection in the log, which
 * is the one way this screen can lie about what it stored. */

export async function saveJob(jobId: string, saved: boolean) {
  const u = await requireUser();
  if (saved) await q.setStage(u, jobId, "saved");
  else await q.unsave(u, jobId);
  revalidatePath("/pipeline");
  revalidatePath("/job");
}

export async function moveStage(jobId: string, stage: q.Stage, why?: string) {
  await q.setStage(await requireUser(), jobId, stage, why);
  revalidatePath("/pipeline");
  revalidatePath("/today");
}

export async function finishToday(kind: string, jobId: string | null) {
  await q.markDone(await requireUser(), kind, jobId);
  revalidatePath("/today");
}

export async function setPref(category: string, value: string, on: boolean) {
  await q.togglePref(await requireUser(), category, value, on);
  revalidatePath("/profile");
  revalidatePath("/today");
}

export async function setSkill(id: number, on: boolean) {
  await q.setFactActive(await requireUser(), id, on);
  revalidatePath("/profile");
  revalidatePath("/job");
}

export async function setFloor(valueK: string) {
  await q.setSetting(await requireUser(), "salary_floor_k", valueK);
  revalidatePath("/profile");
  revalidatePath("/today");
}
