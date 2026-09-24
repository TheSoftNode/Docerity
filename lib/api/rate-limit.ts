/* Only the one method this needs, rather than `Model<any>`: it keeps the helper
   usable with any model that records an IP and a timestamp, without widening
   the type to `any`. */
type CountableModel = {
  countDocuments(filter: Record<string, unknown>): { exec(): Promise<number> } & PromiseLike<number>;
};

/*
  A deliberately simple, database-backed limiter.

  In-memory counters are the usual quick fix, but they are wrong on Vercel: each
  serverless instance holds its own memory, so a limit of 5 becomes 5 × however
  many instances happen to be warm. Counting rows in MongoDB is shared state, so
  the limit means what it says.

  This is abuse-dampening, not a security control. It costs one indexed count
  per submission and is intended to stop a stuck retry loop or a bored visitor,
  not a distributed flood — that belongs at the edge (Vercel WAF / Cloudflare).
*/

/**
 * Best-effort client IP.
 *
 * `x-forwarded-for` is a comma-separated chain and only the *first* entry is
 * the original client; later entries are proxies. On Vercel the header is set
 * by the platform, so it cannot be spoofed by the caller — behind any other
 * proxy it can be, which is another reason this is dampening rather than
 * enforcement.
 */
function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() ?? "unknown";
}

/**
 * True when `ip` has already created at least `limit` documents in the last
 * `windowMinutes`.
 *
 * Returns false on any error: a limiter that fails closed would take the
 * contact form down with the database hiccup that broke it.
 */
async function tooManyRecently(
  model: CountableModel,
  ip: string,
  limit: number,
  windowMinutes: number
): Promise<boolean> {
  if (ip === "unknown") return false;

  const since = new Date(Date.now() - windowMinutes * 60 * 1000);

  try {
    const recent = await model.countDocuments({
      submittedFromIp: ip,
      createdAt: { $gte: since },
    });
    return recent >= limit;
  } catch (reason) {
    console.error("[rate-limit] count failed, allowing request:", reason);
    return false;
  }
}

export { clientIp, tooManyRecently };
