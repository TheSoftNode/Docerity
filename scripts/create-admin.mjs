/**
 * Creates or updates an admin account.
 *
 *   node scripts/create-admin.mjs "you@example.com" "Your Name" owner
 *
 * The password is read from stdin rather than taken as an argument, because an
 * argument lands in the shell history and in the process list, where anyone
 * with a terminal on the same machine can read it while it runs.
 *
 * Run it again with the same address to reset that account's password. There is
 * no public sign-up route, so this is the only way the first account exists.
 */

import { createInterface } from "node:readline";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import mongoose from "mongoose";

const scrypt = promisify(scryptCallback);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/*
  Duplicated from `lib/auth/password.ts` rather than imported.

  That file is TypeScript with a `@/` path alias and a `server-only` import,
  none of which plain `node` resolves. A build step for one script is worse than
  twenty lines restated, but the parameters have to stay in step with that file
  or hashes written here will not verify there. The format is asserted by
  `lib/auth/password.test` territory: `scrypt$N$r$p$salt$hash`.
*/
const PARAMS = { N: 65536, r: 8, p: 1, keyLength: 64, maxmem: 128 * 1024 * 1024 };

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password.normalize("NFKC"), salt, PARAMS.keyLength, {
    N: PARAMS.N,
    r: PARAMS.r,
    p: PARAMS.p,
    maxmem: PARAMS.maxmem,
  });
  return [
    "scrypt",
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("base64url"),
    derived.toString("base64url"),
  ].join("$");
}

/* Next loads .env.local itself; a bare `node` process does not. */
function loadEnvLocal() {
  for (const name of [".env.local", ".env"]) {
    try {
      const contents = readFileSync(resolve(root, name), "utf8");
      for (const line of contents.split("\n")) {
        const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
        if (!match) continue;
        const [, key, rawValue] = match;
        if (process.env[key]) continue;
        process.env[key] = rawValue.trim().replace(/^["']|["']$/g, "");
      }
    } catch {
      /* Absent is normal; MONGODB_URI may come from the shell instead. */
    }
  }
}

function prompt(question, { silent = false } = {}) {
  return new Promise((resolvePrompt) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });

    if (silent) {
      /* Suppress the echo so the password is not left on screen, and on the
         terminal's scrollback, for whoever walks past next. */
      const output = rl.output;
      rl._writeToOutput = (chunk) => {
        if (chunk.includes(question)) output.write(chunk);
      };
    }

    rl.question(question, (answer) => {
      if (silent) rl.output.write("\n");
      rl.close();
      resolvePrompt(answer);
    });
  });
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["owner", "editor"], default: "editor" },
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    sessionVersion: { type: Number, default: 1 },
    disabledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

async function main() {
  loadEnvLocal();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "MONGODB_URI is not set. Put it in .env.local, or export it before running this."
    );
    process.exit(1);
  }

  const [emailArg, nameArg, roleArg] = process.argv.slice(2);
  const email = (emailArg ?? (await prompt("Email: "))).trim().toLowerCase();
  const name = (nameArg ?? (await prompt("Name: "))).trim();
  const role = (roleArg ?? "owner").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    console.error(`"${email}" is not a valid email address.`);
    process.exit(1);
  }
  if (!name) {
    console.error("A name is required.");
    process.exit(1);
  }
  if (role !== "owner" && role !== "editor") {
    console.error(`Role must be "owner" or "editor", not "${role}".`);
    process.exit(1);
  }

  const password = await prompt("Password (at least 12 characters): ", { silent: true });
  if (password.length < 12) {
    console.error("That is shorter than 12 characters.");
    process.exit(1);
  }
  const again = await prompt("Confirm password: ", { silent: true });
  if (password !== again) {
    console.error("Those do not match.");
    process.exit(1);
  }

  process.stdout.write("Hashing (this is meant to take a moment)... ");
  const passwordHash = await hashPassword(password);
  process.stdout.write("done\n");

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  const User = mongoose.models.User ?? mongoose.model("User", userSchema);

  const existing = await User.findOne({ email }).lean();

  if (existing) {
    await User.updateOne(
      { email },
      {
        $set: { name, role, passwordHash, failedAttempts: 0, lockedUntil: null, disabledAt: null },
        /* Bumped so every session issued under the old password stops
           verifying. Resetting a password has to sign other devices out or it
           is not a reset. */
        $inc: { sessionVersion: 1 },
      }
    );
    console.log(`\nUpdated ${email} (${role}). Existing sessions have been signed out.`);
  } else {
    await User.create({ email, name, role, passwordHash });
    console.log(`\nCreated ${email} (${role}).`);
  }

  console.log("Sign in at /admin/login");
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("\nFailed:", error instanceof Error ? error.message : error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
