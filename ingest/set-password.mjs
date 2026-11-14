/* Set the password on an account.
 *
 *   node ingest/set-password.mjs you@example.com
 *
 * It prompts rather than taking the password as an argument, because
 * arguments end up in your shell history and in the process list.
 * Nothing is printed back.
 */
import { createInterface } from "node:readline";
import { scryptSync, randomBytes } from "node:crypto";
import { open, all, one } from "./db.mjs";

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!email) {
  console.error("Usage: node ingest/set-password.mjs <email>");
  process.exit(1);
}

const db = await open();

const user = await one(db, "SELECT id, name FROM users WHERE email = ?", [email]);
if (!user) {
  const known = (await all(db, "SELECT email FROM users")).map((r) => r.email).join(", ");
  console.error(`No account with that email. Accounts: ${known || "none"}`);
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
const ask = (q) =>
  new Promise((res) => {
    process.stdout.write(q);
    rl.input.setRawMode?.(true);
    let buf = "";
    const onData = (ch) => {
      const c = ch.toString();
      if (c === "\n" || c === "\r" || c === "\u0004") {
        rl.input.setRawMode?.(false);
        rl.input.off("data", onData);
        process.stdout.write("\n");
        res(buf);
      } else if (c === "\u0003") { process.exit(1); }
      else if (c === "\u007f") { buf = buf.slice(0, -1); }
      else buf += c;
    };
    rl.input.on("data", onData);
  });

const pw = await ask(`Password for ${email}: `);
const again = await ask("Again: ");
rl.close();

if (pw.length < 8) { console.error("Eight characters or more."); process.exit(1); }
if (pw !== again) { console.error("Those did not match."); process.exit(1); }

const salt = randomBytes(16);
const hash = scryptSync(pw, salt, 64, { N: 16_384, r: 8, p: 1 });
await db.execute({
  sql: "UPDATE users SET password = ? WHERE id = ?",
  args: [`${salt.toString("hex")}:${hash.toString("hex")}`, user.id],
});

console.log(`Password set for ${user.name ?? email}. Sign in at /signin`);
