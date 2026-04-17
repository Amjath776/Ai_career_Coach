/**
 * MongoDB connection using Mongoose — serverless-safe.
 *
 * In serverless environments (Vercel), each function invocation may be a cold
 * start. We cache the connection promise in module scope so warm invocations
 * reuse the existing connection without reconnecting on every request.
 *
 * process.exit() is intentionally NOT called here because it would crash the
 * serverless function worker. Instead we throw so the caller can handle it.
 */

const mongoose = require('mongoose');

// Cache the connection promise across warm invocations
let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  // Already connected — reuse existing connection
  if (cached.conn) return cached.conn;

  // Connection attempt in progress — wait for it
  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      // Recommended settings for serverless
      maxPoolSize: 10,
      minPoolSize: 1,
    };

    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, opts)
      .then((m) => {
        console.log(`✅ MongoDB connected: ${m.connection.host}`);
        return m;
      })
      .catch((err) => {
        // Clear the failed promise so the next request retries
        cached.promise = null;
        console.error(`❌ MongoDB connection error: ${err.message}`);
        throw err; // Let the Express error handler return a 503
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;

