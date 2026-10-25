# Odysseus — Product Requirements Document

Version 0.2 · Product concept · Job search operating system

*Source document as supplied, 22 October 2026. Condensed in formatting only;
no requirement has been added, removed or reworded.*

## 1. Product overview

Odysseus is a web application designed to make the job search less repetitive,
overwhelming and fragmented. Instead of requiring users to repeatedly search job
boards, rewrite resumes, answer repetitive questions, find company employees,
write outreach messages and manually track applications, Odysseus brings these
activities into one workflow.

It helps users: build a reusable professional profile; create and maintain a
master resume; discover relevant jobs across multiple sources; match jobs against
their experience; tailor resumes and applications; identify relevant people at
companies; prepare outreach; track applications and follow-ups; and learn from
their job-search activity.

The goal is not to become another job board. The goal is to become a user's
job-search operating system.

## 2. Problem

Finding a job is not a single activity. It is a fragmented process: searching
multiple boards, checking relevance, reading descriptions, tailoring resumes,
writing answers, finding recruiters and hiring managers, finding contact
information, writing outreach, applying, recording the application, following up,
remembering what happened, and repeating.

Existing job boards focus on discovery. AI tools help with individual parts, but
users repeatedly provide context, copy information between tools and manage the
workflow by hand.

**Core problem.** People often don't struggle because they cannot find jobs. They
struggle because consistently executing a high-quality job search is exhausting,
repetitive and difficult to manage.

## 3. Product vision

Make job hunting feel like a system rather than a daily battle:
Find → Understand → Tailor → Apply → Reach out → Track → Follow up,
without recreating the same information each time.

## 4. Product principles

1. **Minimise friction.** Ask for the minimum needed for the current task.
2. **Infer before asking.** Reuse what a resume, LinkedIn profile, job
   description or earlier input already says.
3. **Build once, reuse everywhere.** The professional profile is the source of
   truth.
4. **Structured input over unnecessary writing.** Simple inputs and structured
   selections rather than polished bullets typed by hand.
5. **Dynamic questions.** Questions are generated from what is missing, not from
   a fixed questionnaire.
6. **Truth before optimisation.** Never invent experience, metrics, employers,
   responsibilities, skills, qualifications or achievements. AI transforms and
   organises what the user supplied; it never manufactures a better candidate.
7. **Human control.** Users approve resume changes, application answers, outreach
   messages and automated submissions. Cold outreach is never sent without
   explicit approval.

## 5. Target user

Professionals actively searching who already have experience, apply to multiple
roles, use multiple boards, need to tailor applications, want targeted outreach
and want a central system. Not limited to one profession: designers, engineers,
product managers, marketers, analysts, researchers, recruiters, finance
professionals and other knowledge workers.

## 6. Positioning

Odysseus is **not** a job board, a resume editor, a LinkedIn replacement, a
recruitment agency, a generic AI chatbot, a mass-application bot or a career
coach. It is a job-search operating system connecting discovery, application
preparation, outreach and tracking.

## 7. Core systems

Professional Profile · Resume Engine · Job Discovery Engine · Application Engine
· Outreach Engine · Application Pipeline.

## 8. Onboarding

Intentionally minimal. No long questionnaire before using the product.

1. **Bring existing information** — upload a resume, import LinkedIn, or start
   from scratch. Odysseus extracts name, roles, companies, dates, skills,
   education, projects, achievements, existing bullets and portfolio links.
2. **Build initial profile** — extracted information becomes a structured
   profile the user can review and correct. Incomplete areas are indicated but
   not required (e.g. "Profile completeness: 78%").
3. **Fill only important gaps** — ask only the questions that would materially
   improve the resume or applications, with structured options.
4. **Start using Odysseus** — find jobs, build resume, view profile, track
   applications. A 100% profile is not required to search.

## 9. Professional profile

The long-term source of truth: experience, skills, projects, achievements,
metrics, education, portfolio, certifications. It improves continuously as the
product is used.

## 10. Experience builder

Short inputs and structured selections instead of hand-written experience.
Example: "I designed a payment wallet." → *What did the work affect?* Users ·
Revenue · Transactions · Transaction volume · Conversion · Retention ·
Efficiency · Product launch · Other.

## 11. Metrics

Multiple metrics per item, not restricted to percentages: absolute numbers,
percentages, currency, volume, time, user counts, ratios and other measurable
outcomes. "I don't know" is always available.

## 12. Generated experience

Once enough information exists, Odysseus generates professional resume language
and the user can accept, edit, regenerate, or supply more information.

## 13. Dynamic information collection

Collection is ongoing, not a one-time form. If a job needs something the profile
lacks, Odysseus asks at that moment and saves the answer for future applications.

## 14–15. Master resume and variants

The master resume is generated from the profile and is the source for tailored
resumes. Role-specific variants pull from the same underlying profile; the user
does not maintain multiple resumes by hand.

## 16–18. Discovery, normalisation, deduplication

Aggregate from LinkedIn, Indeed, Wellfound, Just Join IT, company career pages,
specialist, smaller, niche and community boards, and other public sources — not
only mainstream boards. Normalise to one internal format (title, company,
location, remote status, employment type, salary, description, requirements,
skills, source, original URL, date posted, date discovered, application method).
The same job across several sources becomes one record retaining every source
link.

## 19. Job matching

Score jobs against the profile and **explain the match** rather than only
displaying a score: strong matches and potential gaps, named.

## 20–21. Daily discovery and the feed

Search sources, collect, normalise, deduplicate, filter, match, rank, add to the
feed and notify when appropriate. The feed prioritises relevance over volume and
shows why a job matches, what the gap is, and the actions available: view, save,
prepare application.

## 22–23. Application preparation and ATS check

On *Prepare Application*: analyse the description, identify important
requirements, identify relevant experience, select relevant achievements, tailor
the resume, check ATS compatibility, identify missing information, prepare
answers and identify outreach contacts.

The ATS check covers terminology, skills, experience requirements, title
alignment, formatting, missing information, contradictions and unsupported
claims — and suggests changes based only on information already in the profile.

## 24. Submission

**Assisted:** Odysseus prepares the resume, answers, relevant information and
outreach suggestions; the user submits. **Browser-assisted:** where technically
possible Odysseus helps complete forms, never bypassing CAPTCHA, Cloudflare,
anti-bot systems, authentication or other security mechanisms. Where human
interaction is required, control returns to the user.

## 25–27. Outreach

Identify 2–3 useful people per relevant job, prioritising hiring manager, team
manager, recruiter, then relevant employee — relevance over random employees.
Where supported, provide name, title, company, LinkedIn profile, public
professional information and available contact information, labelled
**Verified**, **Likely** or **Unknown**. Uncertain information is never presented
as fact. Messages are generated from the role, company, recipient, relevant
experience and connection, and reviewed before sending. Cold outreach is never
sent automatically.

## 28–30. Tracking and follow-up

Every application is a record with stages: Discovered · Saved · Preparing ·
Applied · Outreach · Interview · Offer · Rejected · Withdrawn · Ghosted. A record
holds company, role, job URL, source, dates, resume version, status, contacts and
details, outreach status, follow-up date, interview stages, notes and outcome.

Odysseus identifies applications needing follow-up and flags silence beyond a
configurable period as a signal, not a definitive rejection.

## 31–33. Dashboard, funnel, analytics

The dashboard answers "how is my job search actually going?" The funnel shows
jobs discovered → relevant → applications → responses → interviews → offers, so
users can see where the search succeeds or fails. Over time, analytics surface
patterns — which industries, which resume variants and which experience
requirements produce responses — to improve strategy.

## 34–36. AI architecture

Deterministic systems handle filtering, deduplication, date calculations,
location and salary filtering, tracking, status changes, notifications, basic
keyword matching and basic ATS checks. AI handles bullet generation, resume
tailoring, complex matching, description interpretation, application answers,
summaries, outreach drafting and dynamic follow-up questions.

Store structured information rather than resending the user's entire history.
Supply only job requirements plus relevant experience and achievements. Ground
every output in user-provided information and show the facts behind generated
content.

## 37. MVP

**Account:** sign up, login, user profile.
**Profile:** upload resume, extract, review and edit, structured experience
builder, metrics and achievements.
**Resume:** master resume, AI bullets, editing, tailored generation, PDF export.
**Discovery:** multiple sources, search, filters, aggregation, deduplication,
matching, match explanations.
**Application:** job analysis, tailored resume, ATS checks, tracking.
**Outreach:** contact discovery where supported, generation, manual approval.
**Tracking:** pipeline, follow-up dates, notes, status.

## 38. Post-MVP

**Phase 2:** automated daily discovery, more sources, contact enrichment,
browser-assisted applications, autofill, email and calendar integration,
notifications.
**Phase 3:** advanced analytics, resume experimentation, response-rate analysis,
interview preparation and tracking, offer tracking, strategy recommendations.
**Phase 4:** more autonomous workflows, adaptive discovery, automated application
workflows where supported, personal job-search agents.

## 39. Core user flow

Create account → upload CV or import profile → initial profile built → fill only
important gaps → enter job search → discover relevant jobs → select job → analyse
→ tailor resume → ATS check → prepare application → apply → find contacts →
generate outreach → user approves → track → follow up → response, interview,
rejection or offer → learn from outcome → repeat.

## 40–41. Metrics

**North star:** successful job-search actions completed per week — qualified
applications submitted, relevant outreach completed, follow-ups completed,
interviews generated. The eventual outcome is interviews and offers from
qualified applications.

**Primary:** qualified applications per week. **Secondary:** jobs discovered,
relevant jobs, completion rate, time from discovery to application, outreach
completion, response rate, interview rate, offer rate, follow-up completion,
time saved per application.

## 42. Non-goals

Replacing LinkedIn or recruitment agencies, becoming a social network,
guaranteeing employment, spamming hundreds of companies, inventing experience,
sending unsolicited outreach automatically, bypassing job-board security, or
requiring extensive profiles.

## 43–44. The loop and the north star

Know me → find relevant opportunities → understand the opportunity → present me
accurately → help me apply → help me reach the right people → track what happened
→ learn from the outcome → improve the next application → repeat.

Odysseus should remove the repetitive work between "I want this job" and "I have
a real shot at getting this job", making the search faster, more organised, more
targeted, less repetitive, less mentally exhausting and more measurable — without
turning the user into a passenger in their own job search.

**One sentence.** Odysseus is a job-search operating system that finds relevant
opportunities, turns a user's existing experience into tailored applications,
helps them reach the right people, and tracks the entire journey from discovery
to outcome.
