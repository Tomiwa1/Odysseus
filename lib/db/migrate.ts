import type { DatabaseSync } from "node:sqlite";

/* Additive migrations.
 *
 * schema.sql uses CREATE TABLE IF NOT EXISTS, which silently does
 * nothing to a table that already exists. Adding `password` to users
 * therefore never reached a database created before it, and the failure
 * showed up as "no such column" at sign in rather than at startup.
 *
 * So every column added after a table's first version is also listed
 * here. Checked against PRAGMA table_info on every open, which is cheap
 * and means a database can never be half-upgraded.
 *
 * Additive only on purpose: renames and drops need thought and data
 * movement, and doing those silently on boot is how data goes missing.
 */
const COLUMNS: [table: string, column: string, definition: string][] = [
  ["users", "password", "TEXT"],
];

export function migrate(db: DatabaseSync) {
  for (const [table, column, definition] of COLUMNS) {
    const exists = (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[])
      .some((c) => c.name === column);
    if (!exists) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
