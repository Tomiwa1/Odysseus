import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { migrate } from "./migrate";

/* Storage.
 *
 * SQLite, through Node's own built-in driver, so there is no dependency
 * and no service to sign up for. The whole database is one file.
 *
 * This is the right choice while there is one user and one machine. It
 * is the wrong choice the moment this deploys to a serverless host,
 * because the filesystem there is not durable. Everything above this
 * file goes through the functions in queries.ts, so swapping the driver
 * for Postgres or Turso later means changing this file and that one,
 * not the screens.
 */

const FILE = process.env.ODYSSEUS_DB ?? join(process.cwd(), "data", "odysseus.db");

let handle: DatabaseSync | null = null;

export function db(): DatabaseSync {
  if (handle) return handle;
  handle = new DatabaseSync(FILE);
  handle.exec("PRAGMA journal_mode = WAL");
  handle.exec("PRAGMA foreign_keys = ON");
  handle.exec(readFileSync(join(process.cwd(), "lib", "db", "schema.sql"), "utf8"));
  migrate(handle);
  return handle;
}

export const now = () => new Date().toISOString();
export const today = () => new Date().toISOString().slice(0, 10);
