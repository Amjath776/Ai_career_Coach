/**
 * Learning Roadmap Controller
 */

const LearningRoadmap = require('../models/LearningRoadmap');
const gemini = require('../services/geminiService');

/** GET /api/roadmap — Get user's roadmaps */
const getRoadmaps = async (req, res) => {
  const roadmaps = await LearningRoadmap.find({ user: req.user.id }).sort({ createdAt: -1 });
  console.log(`[Roadmap] GET for user=${req.user.id}, count=${roadmaps.length}`);
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

  // BUG FIX: req.user is already populated by protect middleware — no extra DB query needed
  const currentSkills = req.user.skills || [];
  const clampedMonths = Math.min(Math.max(parseInt(durationMonths) || 6, 1), 12);

  console.log(`[Roadmap] Generating for user=${req.user.id}`, {
    goal, targetRole, durationMonths: clampedMonths, skills: currentSkills.length,
  });

  const aiResult = await gemini.generateLearningRoadmap({
    goal,
    targetRole: targetRole || '',
    currentSkills,
    durationMonths: clampedMonths,
  });

  // BUG FIX: Guard against undefined phases if Gemini returns unexpected shape
  const phases = Array.isArray(aiResult?.phases) ? aiResult.phases : [];
  console.log(`[Roadmap] Gemini returned ${phases.length} phases`);

  if (phases.length === 0) {
    console.warn('[Roadmap] Warning: Gemini returned 0 phases — check AI response');
  }

  const roadmap = await LearningRoadmap.create({
    user: req.user.id,
    goal,
    targetRole: targetRole || '',
    durationMonths: clampedMonths,
    currentSkills,
    phases,
  });

  console.log(`[Roadmap] Saved to DB, id=${roadmap._id}`);
  res.status(201).json({ success: true, roadmap });
};

/** PUT /api/roadmap/:id/phase/:month — Update phase progress */
const updatePhaseProgress = async (req, res) => {
  const { completed, notes, progressPercent } = req.body;
  const roadmap = await LearningRoadmap.findOne({ _id: req.params.id, user: req.user.id });
  if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

  const phase = roadmap.phases.find((p) => p.month === parseInt(req.params.month));
  if (!phase) return res.status(404).json({ message: 'Phase not found' });

  if (completed !== undefined) {
    phase.completed = completed;
    if (completed) phase.completedAt = new Date();
    else phase.completedAt = undefined;
  }
  if (notes !== undefined) phase.notes = notes;
  if (progressPercent !== undefined) {
    phase.progressPercent = Math.min(100, Math.max(0, Number(progressPercent) || 0));
  }

  // Recalculate overall progress
  const completedPhases = roadmap.phases.filter((p) => p.completed).length;
  roadmap.overallProgress = roadmap.phases.length > 0
    ? Math.round((completedPhases / roadmap.phases.length) * 100)
    : 0;

  await roadmap.save();
  console.log(`[Roadmap] Phase ${req.params.month} updated, overall=${roadmap.overallProgress}%`);
  res.json({ success: true, roadmap });
};

/** DELETE /api/roadmap/:id */
const deleteRoadmap = async (req, res) => {
  const deleted = await LearningRoadmap.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!deleted) return res.status(404).json({ message: 'Roadmap not found' });
  console.log(`[Roadmap] Deleted id=${req.params.id}`);
  res.json({ success: true, message: 'Roadmap deleted' });
};

module.exports = { getRoadmaps, getRoadmap, generateRoadmap, updatePhaseProgress, deleteRoadmap };

