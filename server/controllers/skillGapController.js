/**
 * Skill Gap Controller
 */

const SkillGap = require('../models/SkillGap');
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

  // req.user is already populated by the protect middleware — no redundant DB query needed
  const currentSkills = req.user.skills || [];
  const industry = targetIndustry || req.user.industry || '';

  console.log(`[SkillGap] Analyzing gap for user=${req.user.id} role="${targetRole}" industry="${industry}" skills=[${currentSkills.join(', ')}]`);

  const analysis = await gemini.analyzeSkillGap({ currentSkills, targetRole, industry });

  console.log(`[SkillGap] Gemini returned → overallReadiness=${analysis.overallReadiness}, missingSkills=${analysis.missingSkills?.length}`);

  const skillGap = await SkillGap.create({
    user: req.user.id,
    targetRole,
    targetIndustry: industry,
    currentSkills,
    ...analysis,
  });

  console.log(`[SkillGap] Saved to DB, id=${skillGap._id}`);
  res.status(201).json({ success: true, skillGap });
};

module.exports = { getSkillGaps, analyzeSkillGap };

