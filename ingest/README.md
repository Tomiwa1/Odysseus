# Ingest

Where the jobs come from. No scraping: six ATSs serve public JSON meant
to be read by the company's own careers page.

```bash
node ingest/discover.mjs      # which ATS each company is on -> companies.json
node ingest/run.mjs           # fetch, normalise, dedupe -> store/jobs.json
node ingest/run.mjs --design  # design titles only
node ingest/probe-sources.mjs # the viability measurement, see findings.md
```

## Shape

```
company-list.mjs   the companies worth watching. The asset.
discover.mjs       resolves each company to one ATS, once
sources/index.mjs  one adapter per ATS, fetch only, no interpretation
normalise.mjs      one job shape from four feeds
dedupe.mjs         one record per job, every source link kept
run.mjs            orchestrates, stores, reports
```

## Last full run

195 feeds, **13,992 postings**, 298 design titles, 32 duplicates merged,
**266 jobs stored**. 13% publish a salary, 33% are remote.

## The rules it follows

**Nothing is invented.** An unknown salary is `null`, not zero. An
unknown location is an empty list, not "Remote". The job screen has to
be able to say "they did not publish it", and it only can if we did not
quietly fill it in.

**Every source link is kept.** Merging duplicates never drops a link, so
the product can always say where a job was found.

**First seen survives.** Re-running does not reset dates, so "posted 2
days ago" means it.

## Two things that bit, both now tested

**Deduplication cannot read the title alone.** Moniepoint posts "Staff
Product Designer" three times for three offices: identical strings, one
job. Stripe posts "Product designer, risk" and "Product designer,
Connect risk": near-identical strings, two jobs. The key is company plus
stripped title, with location merged rather than compared.

**Splitting locations on " or " broke brackets.** "Remote (US or
Canada)" became `["Remote (US", "Canada)"]`. Fragments that leave a
bracket open are now stitched back.

## Not viable

Scraping LinkedIn or Indeed. Against their terms, heavily defended, and
ruled out by the PRD's line on bot protection.
