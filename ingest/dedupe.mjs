/* One record per job, keeping every link it was found at.
 *
 * The probe showed the same rule gets this wrong in both directions if it
 * only reads the title:
 *
 *   Moniepoint posts "Staff Product Designer" three times, once per
 *   office. Identical strings, one job.
 *
 *   Stripe posts "Product designer, risk" and "Product designer, Connect
 *   risk". Near-identical strings, two genuinely different jobs.
 *
 * So the key is the company plus the stripped title, and the location is
 * merged in rather than compared. That gets Moniepoint right because the
 * titles match, and Stripe right because theirs do not.
 *
 * The residual error is a company running two different roles under one
 * exact title. That happens, and merging them is the cheaper mistake:
 * one card saying "3 locations" beats three identical cards, and no job
 * disappears because every source link is kept.
 */

export function dedupe(jobs) {
  const byKey = new Map();
  let merged = 0;

  for (const job of jobs) {
    const key = `${job.companySlug}::${job.titleKey}`;
    const seen = byKey.get(key);

    if (!seen) {
      byKey.set(key, { ...job, locations: [...job.locations] });
      continue;
    }

    merged++;
    for (const loc of job.locations) {
      if (!seen.locations.includes(loc)) seen.locations.push(loc);
    }
    for (const src of job.sources) {
      if (!seen.sources.some((s) => s.ats === src.ats && s.sourceId === src.sourceId)) {
        seen.sources.push(src);
      }
    }
    seen.remote = seen.remote || job.remote;
    seen.hybrid = seen.hybrid || job.hybrid;
    /* a stated salary beats a parsed one, and something beats nothing */
    if (!seen.pay && job.pay) seen.pay = job.pay;
    /* keep the earliest posting date we saw */
    if (job.postedAt && (!seen.postedAt || job.postedAt < seen.postedAt)) {
      seen.postedAt = job.postedAt;
    }
  }

  return { jobs: [...byKey.values()], merged };
}
