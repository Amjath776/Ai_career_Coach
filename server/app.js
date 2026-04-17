/**
 * AI Career Coach — Express Application
 * Configures middleware and routes.
 */

require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ── Route Imports ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const resumeRoutes = require('./routes/resume');
const coverLetterRoutes = require('./routes/coverLetter');
const jobRoutes = require('./routes/jobs');
const careerPathRoutes = require('./routes/careerPath');
const skillGapRoutes = require('./routes/skillGap');
const roadmapRoutes = require('./routes/roadmap');
const interviewRoutes = require('./routes/interview');
const industryRoutes = require('./routes/industry');

// ── Initialize App ────────────────────────────────────────────────────────────
const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'https://ai-career-coach-bice.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

// Also add any origin from env (trim in case of whitespace in .env)
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.trim());
}

// Named options object — reused for both the main middleware AND the
// preflight handler so OPTIONS requests obey the same allow-list.
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any *.vercel.app subdomain (covers preview deployments)
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Enable pre-flight for all routes — MUST use same options as the main middleware
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── DB Connection Middleware (serverless-safe) ────────────────────────────────
// connectDB() is cached — this is a no-op on warm serverless invocations.
// We skip it for the health-check route to avoid a DB round-trip on pings.
app.use(async (req, res, next) => {
  if (req.path === '/api/health') return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ message: 'Database unavailable. Please try again later.' });
  }
});

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/cover-letter', coverLetterRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/career-path', careerPathRoutes);
app.use('/api/skill-gap', skillGapRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/industry', industryRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;