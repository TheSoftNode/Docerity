/**
 * Starts the dev server with a throwaway database and an admin account already
 * created, so the admin area can be clicked through without an Atlas cluster.
 *
 *   node scripts/dev-with-db.mjs
 *
 * The database is in memory and is discarded when this exits. Nothing written
 * during a session survives, which is the point: it is for looking at, and a
 * mistake costs a restart.
 *
 * For real work, put MONGODB_URI in .env.local and use `npm run dev`.
 */

import { spawn } from "node:child_process";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const scrypt = promisify(scryptCallback);

const ACCOUNT = {
  email: "you@docerity.local",
  name: "Theophilus Uchechukwu",
  /* Printed below rather than hidden. This account exists inside a database
     that is thrown away on exit and is reachable only from this machine. */
  password: "docerity-local-password",
};

/*
  The same format as `lib/auth/password.ts`, restated because that file is
  TypeScript behind a path alias and plain `node` does not resolve it. The
  parameters have to match or the hash written here will not verify there.
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

let mongod;
let server;

async function main() {
  process.stdout.write("Starting a throwaway MongoDB... ");

  mongod = await MongoMemoryServer.create({
    /* Pinned: the default 7.x binary aborts on macOS 12, which dropped out of
       its supported kernel range. 6.0.14 is the last release that starts. */
    binary: { version: "6.0.14" },
  });
  const uri = mongod.getUri();
  process.stdout.write("ready\n");

  process.stdout.write("Creating the admin account... ");
  await mongoose.connect(uri);
  await mongoose.connection.collection("users").insertOne({
    email: ACCOUNT.email,
    name: ACCOUNT.name,
    passwordHash: await hashPassword(ACCOUNT.password),
    role: "owner",
    failedAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    sessionVersion: 1,
    disabledAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await mongoose.disconnect();
  process.stdout.write("done\n");

  console.log(`
────────────────────────────────────────────────────────────────────
  Sign in at  http://localhost:3000/admin/login

    Email      ${ACCOUNT.email}
    Password   ${ACCOUNT.password}

  This database is in memory and is discarded when you stop this
  with Ctrl-C. Email and Cloudinary are not configured, so the
  overview will show both as missing, which is correct: enquiries
  and reviews are still stored, only the email is skipped.
────────────────────────────────────────────────────────────────────
`);

  server = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
    env: {
      ...process.env,
      MONGODB_URI: uri,
      SESSION_SECRET: "a-local-only-session-secret-at-least-32-chars",
    },
  });

  server.on("close", async (code) => {
    await stop();
    process.exit(code ?? 0);
  });
}

/*
  Guarded, because more than one thing triggers shutdown: Ctrl-C reaches both
  this process and the dev server, so the signal handler and the child's `close`
  event both run. Without the flag the message printed twice and `mongod.stop()`
  was called on an already-stopped server.
*/
let stopping = false;

async function stop() {
  if (stopping) return;
  stopping = true;

  if (server && !server.killed) server.kill("SIGTERM");
  if (mongod) {
    await mongod.stop();
    mongod = undefined;
  }
}

/* Ctrl-C has to stop the mongod binary too, or it is left running after the
   terminal has gone back to a prompt. */
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    if (!stopping) console.log("\nStopping, and discarding the database.");
    await stop();
    process.exit(0);
  });
}

main().catch(async (error) => {
  console.error("\nCould not start:", error);
  await stop();
  process.exit(1);
});
