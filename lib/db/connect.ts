import mongoose from "mongoose";

import { database } from "@/lib/config/env";
import { ServiceUnavailableError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";

const logger = createLogger("db");

/*
  Serverless connection caching.

  The portfolio backend calls `mongoose.connect()` once when the Express server
  boots, which is correct for a long-lived process. On Vercel there is no
  long-lived process: each route handler may run in a freshly started instance
  and module scope re-runs with it. Connecting per invocation would open a new
  pool every time and exhaust the Atlas connection limit under any real load.

  The connection promise is stashed on `globalThis`, which survives module
  re-evaluation within a warm instance. Caching the *promise* rather than the
  resolved connection matters: two concurrent requests arriving on a cold
  instance would otherwise both see `conn === null` and both dial out.
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

export async function connectDB() {
  if (cache.conn) return cache.conn;

  if (!database.isConfigured) {
    /*
      A typed error rather than a bare throw, so the route wrapper answers 503
      ("the dependency is down, try again") instead of 500, which tells a
      caller and a monitor that the fault is ours and permanent.
    */
    throw new ServiceUnavailableError(
      "We couldn't reach the database just now. Please try again in a moment."
    );
  }

  if (!cache.promise) {
    logger.info("opening connection");

    cache.promise = mongoose.connect(database.uri, {
      /* Without this, a query issued before the handshake completes is queued
         indefinitely rather than failing, so a bad URI presents as a hung
         request instead of an error. */
      bufferCommands: false,
      /* A serverless instance handles one request at a time, so a large pool
         per instance is waste multiplied by the instance count. */
      maxPoolSize: database.maxPoolSize,
      serverSelectionTimeoutMS: 8000,
    });
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (error) {
    /* Clear the failed promise, or every later request on this warm instance
       re-awaits the same rejection and the instance never recovers. */
    cache.promise = null;
    logger.error("connection failed", error);

    throw new ServiceUnavailableError(
      "We couldn't reach the database just now. Please try again in a moment.",
      { cause: error }
    );
  }
}
