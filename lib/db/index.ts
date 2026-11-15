import { createClient, type Client } from "@libsql/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { migrate } from "./migrate";

/* Storage.
 *
 * libSQL, which is SQLite. That matters: the same SQL, the same schema
 * and the same file run in development and in production, so deploying
 * is a URL rather than a dialect rewrite and a migration.
 *
 *   no DATABASE_URL   file:data/odysseus.db, a file on this machine
 *   file:...          any other local file
 *   libsql://...      a hosted database, with DATABASE_TOKEN
 *
 * The price is that every query is async. node:sqlite is synchronous and
 * a hosted database cannot be, so the choice was between a sync local
 * database that can never deploy and an async one that can.
 */

/* Two names for the same two values. Setting them by hand gives the
   first pair; installing the database as a Vercel integration injects
   the second, and a deploy that silently fell back to a local file
   would fail on a read only filesystem with nothing explaining why. */
const url =
  process.env.DATABASE_URL ??
  process.env.TURSO_DATABASE_URL ??
  `file:${join(process.cwd(), "data", "odysseus.db")}`;
const authToken = process.env.DATABASE_TOKEN ?? process.env.TURSO_AUTH_TOKEN;

let client: Client | null = null;
let ready: Promise<Client> | null = null;

async function open(): Promise<Client> {
  const c = createClient(authToken ? { url, authToken } : { url });
  /* a local file wants WAL; a hosted database manages its own journal */
  if (url.startsWith("file:")) {
    await c.execute("PRAGMA journal_mode = WAL");
    await c.execute("PRAGMA foreign_keys = ON");
  }
  const schema = readFileSync(join(process.cwd(), "lib", "db", "schema.sql"), "utf8");
  /* executeMultiple takes the whole file; statements are split by the
     driver rather than by a regex of mine that would break on a
     semicolon inside a string */
  await c.executeMultiple(schema);
  await migrate(c);
  client = c;
  return c;
}

export function db(): Promise<Client> {
  if (client) return Promise.resolve(client);
  ready ??= open();
  return ready;
}

export const now = () => new Date().toISOString();
export const today = () => new Date().toISOString().slice(0, 10);

/* Small helpers so every query below reads the same way. */
export async function all<T = Record<string, unknown>>(sql: string, args: unknown[] = []) {
  const c = await db();
  const r = await c.execute({ sql, args: args as never });
  return r.rows as unknown as T[];
}

export async function one<T = Record<string, unknown>>(sql: string, args: unknown[] = []) {
  return (await all<T>(sql, args))[0] ?? null;
}

export async function run(sql: string, args: unknown[] = []) {
  const c = await db();
  return c.execute({ sql, args: args as never });
}
