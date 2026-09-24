import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  type ScryptOptions,
} from "node:crypto";

/*
  Promisified by hand rather than with `promisify`.

  `crypto.scrypt` is overloaded, and `promisify` resolves to the first
  signature, which has no options parameter. Passing one then fails to typecheck
  with "Expected 3 arguments, but got 4" even though the call is correct at
  runtime, and the options are not optional here: the default 32MB `maxmem`
  ceiling rejects these parameters outright.
*/
function scrypt(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, derived) => {
      if (error) reject(error);
      else resolve(derived);
    });
  });
}

/**
 * Password hashing with scrypt from Node's own crypto module.
 *
 * scrypt rather than a plain hash because it is deliberately slow and
 * memory-hard: a GPU farm cannot run millions of guesses per second against it
 * the way it can against SHA-256. OWASP lists it alongside argon2 and bcrypt
 * as an acceptable choice.
 *
 * Node's built-in rather than the `bcrypt` package because that one ships
 * native bindings, which means a compile step on install and a binary that has
 * to match the deployment's Node version. This needs neither.
 */

/*
  N=2^16 with r=8 costs roughly 64MB of memory and ~100ms per hash on the kind
  of CPU a serverless function gets. That is the point: a login takes an
  imperceptible moment and a dictionary attack does not finish.

  `maxmem` has to be raised explicitly, because Node's default 32MB ceiling
  rejects these parameters outright rather than quietly using weaker ones.
*/
const PARAMS = { N: 65536, r: 8, p: 1, keyLength: 64, maxmem: 128 * 1024 * 1024 };

const SALT_BYTES = 16;

/**
 * Formats as `scrypt$N$r$p$salt$hash`.
 *
 * The parameters are stored with the digest rather than read from the constant
 * above, so raising the cost later does not invalidate every existing password:
 * an old hash still verifies against the parameters it was created with.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
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

/**
 * Never throws and never short-circuits on a malformed stored value, because
 * the time this function takes is observable. It returns false for anything it
 * cannot verify.
 */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  try {
    const [scheme, n, r, p, salt, digest] = stored.split("$");
    if (scheme !== "scrypt" || !salt || !digest) return false;

    const expected = Buffer.from(digest, "base64url");

    const derived = await scrypt(
      password.normalize("NFKC"),
      Buffer.from(salt, "base64url"),
      expected.length,
      { N: Number(n), r: Number(r), p: Number(p), maxmem: PARAMS.maxmem }
    );

    /*
      `timingSafeEqual` rather than `===`. A byte-by-byte comparison returns as
      soon as it finds a difference, so the time it takes reveals how many
      leading bytes were correct, which is enough to reconstruct a digest one
      byte at a time. It also throws on a length mismatch, hence the guard.
    */
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/**
 * A hash of a password nobody holds, for the "no such account" path.
 *
 * Without this, a login against an unknown address returns in a millisecond
 * while one against a real address takes the full scrypt cost, and that
 * difference alone enumerates valid accounts. `authenticate` verifies against
 * this instead of returning early, so both paths cost the same.
 */
export const DUMMY_HASH_PROMISE = hashPassword(randomBytes(32).toString("hex"));
