/**
 * Resume Controller
 * Handles resume CRUD and AI-powered feedback.
 */

const Resume = require('../models/Resume');
const gemini = require('../services/geminiService');

/** GET /api/resume — Get user's resume */
const getResume = async (req, res) => {
  let resume = await Resume.findOne({ user: req.user.id });
  if (!resume) {
    resume = await Resume.create({ user: req.user.id });
  }
  res.json({ success: true, resume });
};

/** PUT /api/resume — Save/update resume */
const saveResume = async (req, res) => {
  const allowed = ['content', 'personalInfo', 'summary', 'experience', 'education', 'skills', 'certifications', 'projects', 'languages'];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const resume = await Resume.findOneAndUpdate(
    { user: req.user.id },
    updates,
    { new: true, upsert: true, runValidators: true }
  );
  res.json({ success: true, resume });
};

/** POST /api/resume/analyze — Get AI feedback on resume */
const analyzeResume = async (req, res) => {
  const { content, targetRole } = req.body;
  if (!content || content.trim().length < 50) {
    return res.status(400).json({ message: 'Please provide at least 50 characters of resume content' });
  }

  const feedback = await gemini.analyzeResume(content, targetRole);

  // Save feedback to resume document
  await Resume.findOneAndUpdate(
    { user: req.user.id },
    {
      content,
      aiFeedback: { ...feedback, generatedAt: new Date() },
    },
    { upsert: true }
  );

  res.json({ success: true, feedback });
};

module.exports = { getResume, saveResume, analyzeResume };
