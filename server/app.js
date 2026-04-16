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

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

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

module.exports = app; // exported for testing
