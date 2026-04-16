/**
 * Cover Letter Controller
 */

const CoverLetter = require('../models/CoverLetter');
const User = require('../models/User');
const gemini = require('../services/geminiService');

/** GET /api/cover-letter — List user's cover letters */
const getCoverLetters = async (req, res) => {
  const letters = await CoverLetter.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, coverLetters: letters });
};

/** GET /api/cover-letter/:id */
const getCoverLetter = async (req, res) => {
  const letter = await CoverLetter.findOne({ _id: req.params.id, user: req.user.id });
  if (!letter) return res.status(404).json({ message: 'Cover letter not found' });
  res.json({ success: true, coverLetter: letter });
};

/** POST /api/cover-letter/generate — Generate with AI */
const generateCoverLetter = async (req, res) => {
  const { jobTitle, companyName, jobDescription, tone = 'professional', highlights = [] } = req.body;
  if (!jobTitle) return res.status(400).json({ message: 'Job title is required' });

  const user = await User.findById(req.user.id);
  const content = await gemini.generateCoverLetter({
    name: user.name,
    currentTitle: user.currentTitle || 'Professional',
    jobTitle,
    companyName: companyName || 'the company',
    jobDescription: jobDescription || '',
    highlights,
    tone,
  });

  const letter = await CoverLetter.create({
    user: req.user.id,
    jobTitle,
    companyName,
    jobDescription,
    content,
    tone,
    highlights,
  });

  res.status(201).json({ success: true, coverLetter: letter });
};

/** PUT /api/cover-letter/:id — Update */
const updateCoverLetter = async (req, res) => {
  const letter = await CoverLetter.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    { new: true }
  );
  if (!letter) return res.status(404).json({ message: 'Cover letter not found' });
  res.json({ success: true, coverLetter: letter });
};

/** DELETE /api/cover-letter/:id */
const deleteCoverLetter = async (req, res) => {
  const letter = await CoverLetter.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!letter) return res.status(404).json({ message: 'Cover letter not found' });
  res.json({ success: true, message: 'Cover letter deleted' });
};

module.exports = { getCoverLetters, getCoverLetter, generateCoverLetter, updateCoverLetter, deleteCoverLetter };
