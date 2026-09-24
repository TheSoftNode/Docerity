/**
 * Every environment variable the server reads, in one place.
 *
 * Nothing throws while this module is imported. A missing variable that threw
 * at module scope would surface as an opaque 500 during route compilation,
 * with a stack pointing at the import rather than at the thing that is
 * actually unset. Instead each accessor reports precisely what is missing, and
 * `isConfigured` lets a caller degrade deliberately rather than crash.
 */

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export class MissingConfigError extends Error {
  constructor(public readonly keys: string[]) {
    super(
      `Missing required configuration: ${keys.join(", ")}. ` +
        `Set these in .env.local for development, or in the Vercel project's ` +
        `environment variables for a deployment.`
    );
    this.name = "MissingConfigError";
  }
}

function require_(values: Record<string, string | undefined>) {
  const missing = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) throw new MissingConfigError(missing);
  return values as Record<string, string>;
}

/* ── Database ─────────────────────────────────────────────────────────── */

export const database = {
  get isConfigured() {
    return Boolean(read("MONGODB_URI"));
  },
  get uri() {
    return require_({ MONGODB_URI: read("MONGODB_URI") }).MONGODB_URI;
  },
  /** Atlas connections are the scarce resource; see `lib/db/connect.ts`. */
  maxPoolSize: Number(read("MONGODB_MAX_POOL_SIZE") ?? 5),
};

/* ── Email ────────────────────────────────────────────────────────────── */

/*
  Gmail SMTP rather than a transactional provider, for now.

  Two consequences worth stating, because they are not obvious:

  1. Gmail rewrites the From header to the authenticated account unless the
     address is a verified alias (Gmail → Settings → Accounts → "Send mail
     as"). So setting SMTP_FROM to hello@docerity.com before that alias exists
     does not make mail appear to come from it — Gmail silently replaces it.

  2. Free Gmail allows roughly 500 recipients per day and will temporarily
     lock the account if that is exceeded. Fine for enquiry volume; not a
     newsletter transport.

  The password must be a 16-character App Password, not the account password —
  Google disabled plain password auth for SMTP in May 2022.
*/
export const email = {
  get isConfigured() {
    return Boolean(read("SMTP_USER") && read("SMTP_PASSWORD"));
  },
  get credentials() {
    const config = require_({
      SMTP_USER: read("SMTP_USER"),
      SMTP_PASSWORD: read("SMTP_PASSWORD"),
    });
    return {
      host: read("SMTP_HOST") ?? "smtp.gmail.com",
      /* 587 with STARTTLS rather than 465 with implicit TLS: 465 is more
         often blocked by hosting egress rules, and both are equally
         encrypted once the handshake completes. */
      port: Number(read("SMTP_PORT") ?? 587),
      user: config.SMTP_USER,
      password: config.SMTP_PASSWORD,
    };
  },
  /** Falls back to the authenticated account, which is what Gmail sends as. */
  get from() {
    return read("SMTP_FROM") ?? read("SMTP_USER") ?? "";
  },
  /** Where enquiry notifications land. */
  get owner() {
    return read("CONTACT_TO_EMAIL") ?? read("SMTP_USER") ?? "";
  },
};

/* ── Storage ──────────────────────────────────────────────────────────── */

/*
  Cloudinary with *signed* uploads.

  The portfolio uploads client-side with an unsigned preset, which means the
  preset name — visible in the browser bundle — is the only thing standing
  between the internet and your Cloudinary quota. Anyone who reads it can
  upload anything to the account.

  Here the browser still uploads directly, but has to present a signature this
  server generates from the API secret, scoped to a folder and an expiry. The
  secret never reaches the client, and a signature cannot be reused for a
  different folder or after it expires.
*/
export const storage = {
  get isConfigured() {
    return Boolean(
      read("CLOUDINARY_CLOUD_NAME") &&
        read("CLOUDINARY_API_KEY") &&
        read("CLOUDINARY_API_SECRET")
    );
  },
  get credentials() {
    const config = require_({
      CLOUDINARY_CLOUD_NAME: read("CLOUDINARY_CLOUD_NAME"),
      CLOUDINARY_API_KEY: read("CLOUDINARY_API_KEY"),
      CLOUDINARY_API_SECRET: read("CLOUDINARY_API_SECRET"),
    });
    return {
      cloudName: config.CLOUDINARY_CLOUD_NAME,
      apiKey: config.CLOUDINARY_API_KEY,
      apiSecret: config.CLOUDINARY_API_SECRET,
    };
  },
  /** Enquiry attachments are namespaced so they never collide with site media. */
  enquiryFolder: read("CLOUDINARY_ENQUIRY_FOLDER") ?? "docerity/enquiries",
  reviewFolder: read("CLOUDINARY_REVIEW_FOLDER") ?? "docerity/reviews",
};

/* ── Runtime ──────────────────────────────────────────────────────────── */

export const runtime = {
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
  get isTest() {
    return process.env.NODE_ENV === "test";
  },
  /** Used to build absolute links in email. */
  get siteUrl() {
    return (
      read("NEXT_PUBLIC_SITE_URL") ??
      (read("VERCEL_URL") ? `https://${read("VERCEL_URL")}` : undefined) ??
      "https://www.docerity.com"
    );
  },
};
