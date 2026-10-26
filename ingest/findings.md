# Does free job data exist?

Measured, not assumed. `node ingest/probe-sources.mjs` re-runs it.

## The method

Most companies run their careers page on an ATS, and those ATSs serve
public JSON meant to be read by the company's own website. No scraping,
no bot evasion, nothing against anyone's terms. The probe checks a list
of company slugs against six of them and counts what comes back.

## Two runs, and why the first one was wrong

The first run covered 43 African fintech companies. That was an
assumption carried over from the prototype's mock data, which invented a
Nigerian designer, rather than anything the product requires. Corrected
to worldwide with Europe and the UK weighted.

| | Africa only | Worldwide |
| --- | --- | --- |
| Companies probed | 43 | 253 |
| On a public feed | 26 | **199** |
| With live roles today | 9 | **153** |
| Open roles | 273 | **13,909** |
| Design titles | 14 | **300** |
| Unique after dedupe | ~8 | **269** |

Greenhouse 95, Ashby 56, Workable 34, Lever 12.

## What this settles

**Supply is not the problem.** 269 unique design roles open on a single
day from 253 companies, and the list is far from exhaustive. The daily
promise of three things is a filtering problem, not a sourcing one,
which is what the PRD already says: relevance over volume.

**Access is free and legal.** Six ATSs, public endpoints, no credentials.
Cost is a scheduler and storage.

**Curation is the real work.** 54 of 253 slugs returned nothing, almost
all because the slug is wrong rather than the company is absent. The
company list is the asset, not the crawler.

## Two traps the probe caught

**SmartRecruiters answers HTTP 200 with `totalFound: 0` for any slug**,
including `zzqxnotarealcompany7788`. Every other ATS 404s properly. The
first version counted those as hits and overstated coverage by 18
companies. There is a control test for this now.

**The same job is posted many times.** Moniepoint listed "Staff Product
Designer" three times; Stripe lists 21 design titles with heavy overlap.
Deduplication is needed from the first ingest, not as a later pass, and
title matching alone will not do it.

## Not viable

Scraping LinkedIn or Indeed. Against their terms, heavily defended, and
ruled out by the PRD's own line on bot protection.
