/**
 * Vercel Serverless Entry Point
 *
 * In serverless environments (Vercel), we must NOT call app.listen().
 * Instead we export the Express app directly as the default export.
 * Vercel's @vercel/node runtime handles the HTTP server lifecycle.
 */

const app = require('../app');

module.exports = app;
