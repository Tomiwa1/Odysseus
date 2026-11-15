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
/* Anything left over after a line, kept for the next prompt.
 *
 * A terminal delivers one keystroke per event, but a piped answer
 * arrives in one lump holding both lines. Comparing the whole lump to
 * "\n" matched nothing, so the prompt waited forever for an answer it
 * had already been handed. */
let pending = "";

const ask = (q) =>
  new Promise((res) => {
    process.stdout.write(q);
    rl.input.setRawMode?.(true);
    let buf = "";

    /* true once a full line has been read; whatever followed it is
       parked in `pending` rather than thrown away */
    const take = (text) => {
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === "\n" || c === "\r" || c === "\u0004") {
          pending = text.slice(i + 1);
          return true;
        }
        if (c === "\u0003") process.exit(1);
        else if (c === "\u007f") buf = buf.slice(0, -1);
        else buf += c;
      }
      return false;
    };

    const onData = (chunk) => { if (take(chunk.toString())) finish(); };
    const finish = () => {
      rl.input.setRawMode?.(false);
      rl.input.off("data", onData);
      process.stdout.write("\n");
      res(buf);
    };

    const carried = pending;
    pending = "";
    if (carried && take(carried)) return finish();
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
