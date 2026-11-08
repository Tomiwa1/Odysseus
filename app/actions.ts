"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "../lib/user";
import * as q from "../lib/db/queries";

/* What the screens are allowed to change.
 *
 * Every one of these writes and then tells Next to re-render the pages
 * that read it, so what you see after a tap is what is actually stored
 * rather than a hopeful bit of local state. */

export async function saveJob(jobId: string, saved: boolean) {
  const u = currentUser();
  if (saved) q.setStage(u, jobId, "saved");
  else q.unsave(u, jobId);
  revalidatePath("/pipeline");
  revalidatePath("/job");
}

export async function moveStage(jobId: string, stage: q.Stage, why?: string) {
  q.setStage(currentUser(), jobId, stage, why);
  revalidatePath("/pipeline");
  revalidatePath("/today");
}

export async function finishToday(kind: string, jobId: string | null) {
  q.markDone(currentUser(), kind, jobId);
  revalidatePath("/today");
}

export async function setPref(category: string, value: string, on: boolean) {
  q.togglePref(currentUser(), category, value, on);
  revalidatePath("/profile");
  revalidatePath("/today");
}

export async function setSkill(id: number, on: boolean) {
  q.setFactActive(currentUser(), id, on);
  revalidatePath("/profile");
  revalidatePath("/job");
}

export async function setFloor(valueK: string) {
  q.setSetting(currentUser(), "salary_floor_k", valueK);
  revalidatePath("/profile");
  revalidatePath("/today");
}
