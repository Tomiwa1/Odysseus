/* The same database the app talks to, for the scripts.
 *
 * The app's lib/db is TypeScript and goes through Next; these scripts
 * are plain node. So this is the one small duplicate: the connection
 * rules, kept identical on purpose.
 *
 *   no DATABASE_URL   file:data/odysseus.db, a file on this machine
 *   file:... | libsql://...   anything else, with DATABASE_TOKEN
 *
 * ODYSSEUS_DB still works and means a file path, so the older commands
 * in ingest/README.md keep doing what they say.
 */
import { createClient } from "@libsql/client";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const COLUMNS = JSON.parse(await readFile("lib/db/columns.json", "utf8"));

export const DB_URL =
  process.env.DATABASE_URL ??
  `file:${process.env.ODYSSEUS_DB ?? join(process.cwd(), "data", "odysseus.db")}`;

export async function open() {
  const token = process.env.DATABASE_TOKEN;
  const c = createClient(token ? { url: DB_URL, authToken: token } : { url: DB_URL });
  if (DB_URL.startsWith("file:")) {
    await c.execute("PRAGMA journal_mode = WAL");
    await c.execute("PRAGMA foreign_keys = ON");
  }
  await c.executeMultiple(await readFile("lib/db/schema.sql", "utf8"));
  for (const [table, column, definition] of COLUMNS) {
    const info = await c.execute(`PRAGMA table_info(${table})`);
    if (!info.rows.some((r) => r.name === column)) {
      await c.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  }
  return c;
}

/* Same three helpers as the app, so a query reads the same in both. */
export const all = (c, sql, args = []) => c.execute({ sql, args }).then((r) => r.rows);
export const one = (c, sql, args = []) => all(c, sql, args).then((r) => r[0] ?? null);
export const count = (c, sql, args = []) => one(c, sql, args).then((r) => Number(r.n));
