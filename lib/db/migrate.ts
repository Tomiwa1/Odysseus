import type { Client } from "@libsql/client";
import COLUMNS from "./columns.json";

/* Additive migrations.
 *
 * schema.sql uses CREATE TABLE IF NOT EXISTS, which silently does
 * nothing to a table that already exists. Adding `password` to users
 * therefore never reached a database created before it, and the failure
 * showed up as "no such column" at sign in rather than at startup.
 *
 * So every column added after a table's first version is listed in
 * columns.json and checked against PRAGMA table_info on every open,
 * which is cheap and means a database can never be half upgraded. The
 * list lives in JSON because the ingest scripts are plain .mjs and have
 * to run the same migrations; two copies of it would drift.
 *
 * Additive only on purpose: renames and drops need thought and data
 * movement, and doing those silently on boot is how data goes missing.
 */
export async function migrate(c: Client) {
  for (const [table, column, definition] of COLUMNS as [string, string, string][]) {
    const info = await c.execute(`PRAGMA table_info(${table})`);
    const exists = info.rows.some((r) => (r as { name?: string }).name === column);
    if (!exists) await c.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
