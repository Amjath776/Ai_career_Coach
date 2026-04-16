/**
 * Skill Gap Controller
 */

const SkillGap = require('../models/SkillGap');
const User = require('../models/User');
const gemini = require('../services/geminiService');

/** GET /api/skill-gap — Get latest skill gap analyses */
const getSkillGaps = async (req, res) => {
  const analyses = await SkillGap.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(5);
  res.json({ success: true, skillGaps: analyses });
};

/** POST /api/skill-gap/analyze */
const analyzeSkillGap = async (req, res) => {
  const { targetRole, targetIndustry } = req.body;
  if (!targetRole) return res.status(400).json({ message: 'Target role is required' });

  const user = await User.findById(req.user.id);
  const analysis = await gemini.analyzeSkillGap({
    currentSkills: user.skills || [],
    targetRole,
    industry: targetIndustry || user.industry || '',
  });

  const skillGap = await SkillGap.create({
    user: req.user.id,
    targetRole,
    targetIndustry: targetIndustry || user.industry || '',
    currentSkills: user.skills || [],
    ...analysis,
  });

  res.status(201).json({ success: true, skillGap });
};

module.exports = { getSkillGaps, analyzeSkillGap };
