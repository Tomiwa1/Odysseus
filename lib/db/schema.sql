-- Odysseus storage.
--
-- One user for now, but the schema has user_id everywhere from the start,
-- because retrofitting it later means touching every query.
--
-- The rule the product runs on applies here too: a column is null when
-- nobody told us, never a plausible default. An unknown salary is null,
-- not zero. A job nobody has acted on has no application row, rather
-- than an application row in a "none" state.

CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  created_at TEXT NOT NULL
);

-- What the CV and the user gave us. Every fact names its source, so the
-- product can keep saying where a claim came from.
CREATE TABLE IF NOT EXISTS facts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT NOT NULL REFERENCES users(id),
  kind       TEXT NOT NULL,              -- skill | role | achievement | years
  term       TEXT NOT NULL,              -- what it matches on
  label      TEXT NOT NULL,              -- what the user sees
  proof      TEXT NOT NULL,              -- where it came from, in words
  source     TEXT NOT NULL,              -- cv | answer | linkedin | typed
  active     INTEGER NOT NULL DEFAULT 1, -- skills can be switched off
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS facts_user ON facts(user_id, kind, active);

-- What you are looking for. One row per choice, so adding a category
-- later needs no migration.
CREATE TABLE IF NOT EXISTS prefs (
  user_id    TEXT NOT NULL REFERENCES users(id),
  category   TEXT NOT NULL,              -- role | seniority | place | avoid
  value      TEXT NOT NULL,
  PRIMARY KEY (user_id, category, value)
);

CREATE TABLE IF NOT EXISTS settings (
  user_id TEXT NOT NULL REFERENCES users(id),
  key     TEXT NOT NULL,
  value   TEXT,
  PRIMARY KEY (user_id, key)
);

-- Jobs are shared, not per user: the same Snowflake role is one row
-- however many people see it.
CREATE TABLE IF NOT EXISTS jobs (
  id           TEXT PRIMARY KEY,
  company      TEXT NOT NULL,
  company_slug TEXT NOT NULL,
  title        TEXT NOT NULL,
  title_key    TEXT NOT NULL,
  locations    TEXT NOT NULL DEFAULT '[]',
  remote       INTEGER NOT NULL DEFAULT 0,
  hybrid       INTEGER NOT NULL DEFAULT 0,
  pay          TEXT,                     -- json, null when unpublished
  requirements TEXT NOT NULL DEFAULT '[]',
  posted_at    TEXT,
  first_seen   TEXT NOT NULL,
  last_seen    TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS jobs_dedupe ON jobs(company_slug, title_key);

-- Every place a job was found. The product promises to say where.
CREATE TABLE IF NOT EXISTS job_sources (
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  ats    TEXT NOT NULL,
  url    TEXT NOT NULL,
  PRIMARY KEY (job_id, ats, url)
);

-- What the user did about a job. No row means untouched.
CREATE TABLE IF NOT EXISTS applications (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT NOT NULL REFERENCES users(id),
  job_id     TEXT NOT NULL REFERENCES jobs(id),
  stage      TEXT NOT NULL,              -- saved | applied | replied | interview | closed
  closed_why TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (user_id, job_id)
);
CREATE INDEX IF NOT EXISTS apps_user ON applications(user_id, stage);

-- Every stage change, so "9 days, no reply" is measured rather than guessed.
CREATE TABLE IF NOT EXISTS events (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  kind           TEXT NOT NULL,          -- stage | note
  detail         TEXT,
  at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS events_app ON events(application_id, at);

-- What the daily loop put in front of you, and whether you dealt with it.
CREATE TABLE IF NOT EXISTS today (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id   TEXT NOT NULL REFERENCES users(id),
  day       TEXT NOT NULL,               -- yyyy-mm-dd
  kind      TEXT NOT NULL,               -- match | reply | draft
  job_id    TEXT REFERENCES jobs(id),
  done_at   TEXT,
  UNIQUE (user_id, day, kind, job_id)
);
CREATE INDEX IF NOT EXISTS today_user ON today(user_id, day);
