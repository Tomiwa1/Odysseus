import { scryptSync, randomBytes, timingSafeEqual, createHash } from "node:crypto";
import { one, run, now } from "./db/index";

/* Sign in, with nothing to sign up for.
 *
 * scrypt is in Node already, so there is no dependency and no service
 * holding your users. The deliberate choices:
 *
 *   A password is stored as salt:hash, never reversible.
 *   Comparison is timing safe, so a wrong password cannot be narrowed
 *     down by how long the answer takes.
 *   The session cookie holds a random token; the table holds only its
 *     hash, so a stolen database cannot be replayed as a login.
 *   An account with no password set cannot be signed into at all,
 *     rather than "no password" quietly meaning "any password".
 */

const N = 16_384, r = 8, p = 1, KEYLEN = 64;
const SESSION_DAYS = 30;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEYLEN, { N, r, p });
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length, { N, r, p });
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string): Promise<{ token: string; expires: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await run(
    `INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)`,
    [tokenHash(token), userId, now(), expires.toISOString()]
  );
  return { token, expires };
}

export async function userIdForToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const row = await one<{ user_id: string; expires_at: string }>(
    `SELECT user_id, expires_at FROM sessions WHERE token_hash = ?`, [tokenHash(token)]);
  if (!row) return null;
  /* an expired session is deleted on sight rather than left to rot */
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await run(`DELETE FROM sessions WHERE token_hash = ?`, [tokenHash(token)]);
    return null;
  }
  return row.user_id;
}

export async function endSession(token: string | undefined) {
  if (token) await run(`DELETE FROM sessions WHERE token_hash = ?`, [tokenHash(token)]);
}

/* ---- accounts -------------------------------------------------------- */

export type Account = { id: string; email: string; name: string | null };

export async function accountByEmail(email: string) {
  return one<Account & { password: string | null }>(
    `SELECT id, email, name, password FROM users WHERE email = ?`,
    [email.trim().toLowerCase()]
  );
}

export async function accountById(id: string) {
  return one<Account>(`SELECT id, email, name FROM users WHERE id = ?`, [id]);
}

export async function createAccount(email: string, name: string, password: string): Promise<Account> {
  const clean = email.trim().toLowerCase();
  const id = `u_${randomBytes(8).toString("hex")}`;
  await run(
    `INSERT INTO users (id, email, name, password, created_at) VALUES (?, ?, ?, ?, ?)`,
    [id, clean, name.trim() || null, hashPassword(password), now()]
  );
  return { id, email: clean, name: name.trim() || null };
}

export async function setPassword(userId: string, password: string) {
  await run(`UPDATE users SET password = ? WHERE id = ?`, [hashPassword(password), userId]);
}
