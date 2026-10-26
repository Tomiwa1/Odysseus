/* One adapter per ATS. Each takes a company slug and returns raw postings
 * plus the shape hints normalise.mjs needs. Nothing here interprets; the
 * only job is to fetch and hand back what the feed said.
 *
 * Four ATSs cover 197 of the 199 confirmed feeds, so the long tail is not
 * worth an adapter yet. Recruitee and SmartRecruiters had one each.
 */

const TIMEOUT = 12_000;
const UA = "odysseus (job aggregator, reads public ATS feeds)";

async function json(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT),
    headers: { "user-agent": UA, accept: "application/json" },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

/* A posting's absolute URL is the thing that makes a job checkable, so
 * every adapter must return one. The PRD keeps every source link. */
export const ADAPTERS = {
  greenhouse: {
    async fetchJobs(slug) {
      const j = await json(
        `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`
      );
      return (j.jobs || []).map((x) => ({
        sourceId: String(x.id),
        title: x.title,
        location: x.location?.name || "",
        url: x.absolute_url,
        postedAt: x.updated_at || null,
        body: x.content || "",
      }));
    },
  },

  lever: {
    async fetchJobs(slug) {
      const j = await json(`https://api.lever.co/v0/postings/${slug}?mode=json`);
      return (Array.isArray(j) ? j : []).map((x) => ({
        sourceId: String(x.id),
        title: x.text,
        location: x.categories?.location || "",
        url: x.hostedUrl,
        postedAt: x.createdAt ? new Date(x.createdAt).toISOString() : null,
        body: x.descriptionPlain || "",
      }));
    },
  },

  ashby: {
    async fetchJobs(slug) {
      const j = await json(
        `https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=true`
      );
      return (j.jobs || []).map((x) => ({
        sourceId: String(x.id),
        title: x.title,
        location: x.location || "",
        url: x.jobUrl,
        postedAt: x.publishedAt || null,
        body: x.descriptionPlain || "",
        remote: x.isRemote === true,
        pay: x.compensation?.compensationTierSummary || null,
      }));
    },
  },

  workable: {
    async fetchJobs(slug) {
      const j = await json(
        `https://apply.workable.com/api/v1/widget/accounts/${slug}?details=true`
      );
      return (j.jobs || []).map((x) => ({
        sourceId: String(x.shortcode || x.id),
        title: x.title,
        location: [x.city, x.country].filter(Boolean).join(", "),
        url: x.application_url || x.url,
        postedAt: x.published_on || null,
        body: x.description || "",
        remote: x.telecommuting === true,
      }));
    },
  },
};

export const ATS_NAMES = Object.keys(ADAPTERS);
