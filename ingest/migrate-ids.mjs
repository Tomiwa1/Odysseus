/* One-off: move job ids onto the new scheme.
 *
 * Ids used to come from the first feed's own posting id, which drifts
 * when a title changes, so a job could clash on the primary key without
 * clashing on the (company, title) dedupe key. They are now a hash of
 * that pair, which makes the two incapable of disagreeing.
 *
 * Applications point at job ids, so this rewrites them in the same
 * transaction. Nothing is dropped: a saved job stays saved.
 */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";

const db = new DatabaseSync(process.env.ODYSSEUS_DB ?? "data/odysseus.db");
db.exec("PRAGMA foreign_keys = OFF");

const newId = (slug, key) =>
  createHash("sha1").update(`${slug}::${key}`).digest("hex").slice(0, 24);

const rows = db.prepare("SELECT id, company_slug, title_key FROM jobs").all();
let moved = 0;

db.exec("BEGIN");
try {
  for (const r of rows) {
    const next = newId(r.company_slug, r.title_key);
    if (next === r.id) continue;
    db.prepare("UPDATE job_sources SET job_id = ? WHERE job_id = ?").run(next, r.id);
    db.prepare("UPDATE applications SET job_id = ? WHERE job_id = ?").run(next, r.id);
    db.prepare("UPDATE today SET job_id = ? WHERE job_id = ?").run(next, r.id);
    db.prepare("UPDATE jobs SET id = ? WHERE id = ?").run(next, r.id);
    moved++;
  }
  db.exec("COMMIT");
} catch (e) {
  db.exec("ROLLBACK");
  throw e;
}
db.exec("PRAGMA foreign_keys = ON");

const orphans = db.prepare(
  "SELECT COUNT(*) AS n FROM applications a LEFT JOIN jobs j ON j.id = a.job_id WHERE j.id IS NULL"
).get().n;

console.log(`moved ${moved} of ${rows.length} job ids`);
console.log(`applications pointing at a missing job: ${orphans}`);
