/**
 * Career Path Controller
 */

const CareerPath = require('../models/CareerPath');
const User = require('../models/User');
const gemini = require('../services/geminiService');

/** GET /api/career-path — List user's career paths */
const getCareerPaths = async (req, res) => {
  const paths = await CareerPath.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, careerPaths: paths });
};

/** POST /api/career-path/generate */
const generateCareerPath = async (req, res) => {
  const { currentRole, targetRole, industry } = req.body;
  if (!currentRole || !targetRole) {
    return res.status(400).json({ message: 'Current role and target role are required' });
  }

  const user = await User.findById(req.user.id);
  const result = await gemini.generateCareerPaths({
    currentRole,
    targetRole,
    skills: user.skills || [],
    yearsOfExperience: user.yearsOfExperience || 0,
    workPreferences: user.workPreferences || {},
    mbtiType: req.body.mbtiType || user.mbtiType || '',
  });

  const careerPath = await CareerPath.create({
    user: req.user.id,
    currentRole,
    targetRole,
    industry: industry || user.industry || '',
    mbtiType: req.body.mbtiType || user.mbtiType || '',
    workPreferences: user.workPreferences || {},
    paths: result.paths,
    personalityInsights: result.personalityInsights,
  });

  res.status(201).json({ success: true, careerPath });
};

/** DELETE /api/career-path/:id */
const deleteCareerPath = async (req, res) => {
  await CareerPath.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ success: true, message: 'Career path deleted' });
};

module.exports = { getCareerPaths, generateCareerPath, deleteCareerPath };
