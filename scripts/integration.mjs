/**
 * Runs the integration suite against a real MongoDB.
 *
 *   node scripts/integration.mjs
 *
 * The rest of the e2e suite runs with no database on purpose, which covers the
 * degraded path: public pages fall back to static content, the contact form
 * answers 503, the admin area redirects to a login page that explains itself.
 * None of that exercises a single query.
 *
 * This starts an in-memory MongoDB, puts its URI in the environment, and runs a
 * separate Playwright config whose `webServer` inherits it. The dev server then
 * boots with a working database and the whole pipeline is real: an account is
 * created, a session is issued, a review is moderated, a post is published.
 *
 * A script rather than a `globalSetup`, because Playwright starts `webServer`
 * before global setup runs, so a URI produced there would arrive after the dev
 * server had already decided it had no database.
 */

import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { MongoMemoryServer } from "mongodb-memory-server";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/*
  The whole dev cache goes, not just the lock file.

  Next 16 writes a lock so a second `next dev` in the same directory refuses to
  start, and a server killed rather than exited leaves it behind. Clearing only
  the lock turned out not to be enough: a run interrupted mid-compile also
  leaves a partial route tree in `.next/dev/build`, and the next server starts
  happily and then answers 404 for routes that plainly exist. The symptom was
  `/admin/login` returning 404 for an entire run, which read as a flaky test and
  was a stale cache.

  A few seconds of recompiling is a fair price for every run starting from the
  same place.
*/
function clearDevCache() {
  try {
    rmSync(resolve(root, ".next/dev"), { recursive: true, force: true });
  } catch {
    /* Absent is the normal case on a fresh clone. */
  }
}


let mongod;

async function main() {
  clearDevCache();

  process.stdout.write("Starting MongoDB... ");

  mongod = await MongoMemoryServer.create({
    /*
      Pinned. The default pulls a 7.x binary, which aborts with SIGABRT on this
      machine's macOS 12.7.6: that release dropped support for the older
      Darwin kernel. 6.0.14 is the last one that starts.
    */
    binary: { version: "6.0.14" },
  });

  const uri = mongod.getUri();
  process.stdout.write("ready\n");

  const env = {
    ...process.env,
    MONGODB_URI: uri,
    /*
      A real secret, so the test is not relying on the development fallback in
      `lib/config/env.ts`. Fixed rather than random because the dev server and
      this process have to agree on it.
    */
    SESSION_SECRET: "integration-test-secret-at-least-thirty-two-characters-long",
    /* Nothing should reach Gmail or Cloudinary from a test run. Both are
       optional, and the code paths that need them degrade rather than throw. */
    SMTP_USER: "",
    SMTP_PASSWORD: "",
    CLOUDINARY_CLOUD_NAME: "",
    CLOUDINARY_API_KEY: "",
    CLOUDINARY_API_SECRET: "",
    /* The dev server is plain HTTP, so a Secure session cookie would never be
       stored and every login would appear to fail. */
    NODE_ENV: "development",
  };

  const code = await run("npx", ["playwright", "test", "--config", "playwright.integration.config.ts", ...process.argv.slice(2)], env);

  await stop();
  process.exit(code);
}

function run(command, args, env) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { env, stdio: "inherit" });
    child.on("close", (code) => resolve(code ?? 1));
  });
}

async function stop() {
  if (mongod) {
    await mongod.stop();
    mongod = undefined;
  }
}

/* Ctrl-C has to stop the mongod child too, or the binary is left running. */
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await stop();
    process.exit(130);
  });
}

main().catch(async (error) => {
  console.error("\nIntegration run failed to start:", error);
  await stop();
  process.exit(1);
});
