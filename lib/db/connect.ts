import mongoose from "mongoose";

/*
  Serverless connection caching.

  The portfolio backend called `mongoose.connect()` once when the Express
  server booted, which is correct for a long-lived process. On Vercel there is
  no long-lived process: each route handler may run in a freshly started
  instance, and module scope re-runs with it. Connecting per invocation would
  open a new pool every time and exhaust the Atlas connection limit under any
  real traffic.

  So the connection promise is stashed on `globalThis`, which survives module
  re-evaluation within a warm instance. We cache the *promise*, not just the
  resolved connection: two concurrent requests arriving on a cold instance
  would otherwise both see `conn === null` and both dial out.
*/

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  _mongooseCache?: MongooseCache;
};

const cache: MongooseCache = (globalForMongoose._mongooseCache ??= {
  conn: null,
  promise: null,
});

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  /* Read the env var inside the function rather than at module scope. At
     module scope a missing value throws while the route module is being
     imported, which surfaces as an opaque 500 with no useful stack. */
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local and to the Vercel project's environment variables."
    );
  }

  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      /* Without this, a query issued before the handshake completes is queued
         indefinitely rather than failing, so a bad URI presents as a hung
         request instead of an error. */
      bufferCommands: false,
      /* A serverless instance handles one request at a time, so a large pool
         per instance is waste multiplied by the instance count. */
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    /* Clear the failed promise, or every later request on this warm instance
       re-awaits the same rejection and the process never recovers. */
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}

export { connectDB };
