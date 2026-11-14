import { facts, prefs, setting } from "./db/queries";
import { GAPS, YEARS, type Fact } from "./profile";
import type { Prefs } from "./match";

/* The user, as the matcher needs them, read from storage rather than
   from a constant.
 *
 * This was the missing half of wiring Profile up. Toggling a skill wrote
 * to the database and changed nothing on Today, because the matcher
 * still read a hardcoded list. Both now come from the same place, so a
 * switch on Profile changes what tomorrow morning shows.
 *
 * A skill switched off is left out entirely rather than scored lower.
 * Off means "do not match me on this", and a half-weight is a different
 * promise from the one the control makes. */

export async function myFacts(userId: string): Promise<Fact[]> {
  return (await facts(userId, true)).map((f) => ({
    term: f.term,
    proof: f.proof,
  }));
}

export function myGaps(): Fact[] {
  /* named gaps stay in code for now: they are things the CV does not
     say, which no amount of toggling can add */
  return GAPS;
}

export async function myYears(userId: string) {
  const row = (await facts(userId, true)).find((f) => f.kind === "years");
  const value = row ? Number(row.term) : YEARS.value;
  return { value: Number.isFinite(value) ? value : YEARS.value, proof: row?.proof ?? YEARS.proof };
}

export async function myPrefs(userId: string): Promise<Prefs> {
  const p = await prefs(userId);
  const floorRaw = await setting(userId, "salary_floor_k");
  const floor = floorRaw ? Number(floorRaw) : null;
  return {
    roles: p.role ?? [],
    seniority: p.seniority ?? [],
    places: p.place ?? [],
    avoid: p.avoid ?? [],
    floorK: Number.isFinite(floor as number) ? (floor as number) : null,
  };
}
