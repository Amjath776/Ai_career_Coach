/**
 * Learning Roadmap Controller
 */

const LearningRoadmap = require('../models/LearningRoadmap');
const User = require('../models/User');
const gemini = require('../services/geminiService');

/** GET /api/roadmap — Get user's roadmaps */
const getRoadmaps = async (req, res) => {
  const roadmaps = await LearningRoadmap.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, roadmaps });
};

/** GET /api/roadmap/:id */
const getRoadmap = async (req, res) => {
  const roadmap = await LearningRoadmap.findOne({ _id: req.params.id, user: req.user.id });
  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
  res.json({ success: true, roadmap });
};

/** POST /api/roadmap/generate */
const generateRoadmap = async (req, res) => {
  const { goal, targetRole, durationMonths = 6 } = req.body;
  if (!goal) return res.status(400).json({ message: 'Learning goal is required' });

  const user = await User.findById(req.user.id);
  const { phases } = await gemini.generateLearningRoadmap({
    goal,
    targetRole: targetRole || '',
    currentSkills: user.skills || [],
    durationMonths: Math.min(Math.max(parseInt(durationMonths), 1), 12),
  });

  const roadmap = await LearningRoadmap.create({
    user: req.user.id,
    goal,
    targetRole: targetRole || '',
    durationMonths,
    currentSkills: user.skills || [],
    phases,
  });

  res.status(201).json({ success: true, roadmap });
};

/** PUT /api/roadmap/:id/phase/:month — Update phase progress */
const updatePhaseProgress = async (req, res) => {
  const { completed, notes, progressPercent } = req.body;
  const roadmap = await LearningRoadmap.findOne({ _id: req.params.id, user: req.user.id });
  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

  const phase = roadmap.phases.find((p) => p.month === parseInt(req.params.month));
  if (!phase) return res.status(404).json({ message: 'Phase not found' });

  if (completed !== undefined) { phase.completed = completed; if (completed) phase.completedAt = new Date(); }
  if (notes !== undefined) phase.notes = notes;
  if (progressPercent !== undefined) phase.progressPercent = Math.min(100, Math.max(0, progressPercent));

  // Recalculate overall progress
  const completedPhases = roadmap.phases.filter((p) => p.completed).length;
  roadmap.overallProgress = Math.round((completedPhases / roadmap.phases.length) * 100);

  await roadmap.save();
  res.json({ success: true, roadmap });
};

/** DELETE /api/roadmap/:id */
const deleteRoadmap = async (req, res) => {
  await LearningRoadmap.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ success: true, message: 'Roadmap deleted' });
};

module.exports = { getRoadmaps, getRoadmap, generateRoadmap, updatePhaseProgress, deleteRoadmap };
