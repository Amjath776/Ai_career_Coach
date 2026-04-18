/**
 * Skill Gap Controller
 *
 * GET  /api/skill-gap         → return last 5 analyses for the logged-in user
 * POST /api/skill-gap/analyze → run AI analysis and persist result
 */

const SkillGap = require('../models/SkillGap');
const gemini   = require('../services/geminiService');

// ── GET /api/skill-gap ────────────────────────────────────────────────────────
/**
 * Returns the 5 most recent skill gap analyses for the current user.
 */
const getSkillGaps = async (req, res) => {
  const analyses = await SkillGap
    .find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({ success: true, skillGaps: analyses });
};

// ── POST /api/skill-gap/analyze ───────────────────────────────────────────────
/**
 * Runs a Gemini-powered skill gap analysis and saves the result.
 *
 * Skills resolution order (first non-empty wins):
 *   1. req.user.skills  — fresh from DB via protect middleware
 *   2. req.body.skills  — caller can override (useful for onboarding flows)
 *   3. []               — empty fallback (AI/fallback handles gracefully)
 */
const analyzeSkillGap = async (req, res) => {
  const { targetRole, targetIndustry, skills: bodySkills } = req.body;

  // ── Validate required fields ───────────────────────────────────────────────
  if (!targetRole || !targetRole.trim()) {
    return res.status(400).json({ message: 'Target role is required' });
  }

  // ── Resolve current skills ─────────────────────────────────────────────────
  // Primary source: fresh user document attached by protect middleware
  const dbSkills   = Array.isArray(req.user.skills) ? req.user.skills.filter(Boolean) : [];
  // Fallback: skills explicitly passed in the request body
  const bodySkillsArr = Array.isArray(bodySkills) ? bodySkills.filter(Boolean) : [];
  // Use DB skills if available; fall back to body skills
  const currentSkills = dbSkills.length > 0 ? dbSkills : bodySkillsArr;

  const industry = (targetIndustry || req.user.industry || '').trim();

  // ── Debug: log exactly what skills are being used ──────────────────────────
  console.log('[SkillGap] ── Incoming Request ─────────────────────────────');
  console.log(`[SkillGap]   User ID       : ${req.user._id}`);
  console.log(`[SkillGap]   Target Role   : ${targetRole}`);
  console.log(`[SkillGap]   Industry      : ${industry || '(not set)'}`);
  console.log(`[SkillGap]   DB skills     : [${dbSkills.join(', ')}] (${dbSkills.length})`);
  console.log(`[SkillGap]   Body skills   : [${bodySkillsArr.join(', ')}] (${bodySkillsArr.length})`);
  console.log(`[SkillGap]   Using skills  : [${currentSkills.join(', ')}] (${currentSkills.length})`);
  console.log('[SkillGap] ─────────────────────────────────────────────────');

  // ── Run AI analysis ────────────────────────────────────────────────────────
  const analysis = await gemini.analyzeSkillGap({
    currentSkills,
    targetRole: targetRole.trim(),
    industry,
  });

  // ── Debug: log what Gemini (or fallback) returned ─────────────────────────
  console.log(`[SkillGap] Gemini result → readiness=${analysis.overallReadiness}, ` +
              `strengths=${analysis.strengths?.length ?? 0}, ` +
              `missing=${analysis.missingSkills?.length ?? 0}, ` +
              `summary="${(analysis.summary || '').substring(0, 60)}…"`);

  // ── Persist to MongoDB ─────────────────────────────────────────────────────
  // Spread analysis fields directly — all output keys now match the schema:
  //   overallReadiness, summary, strengths, missingSkills
  const skillGap = await SkillGap.create({
    user:           req.user._id,
    targetRole:     targetRole.trim(),
    targetIndustry: industry,
    currentSkills,
    overallReadiness: analysis.overallReadiness,
    summary:          analysis.summary,
    strengths:        analysis.strengths,
    missingSkills:    analysis.missingSkills,
  });

  console.log(`[SkillGap] Saved → id=${skillGap._id}, ` +
              `summary="${(skillGap.summary || '').substring(0, 60)}…", ` +
              `strengths=[${skillGap.strengths.join(', ')}]`);

  res.status(201).json({ success: true, skillGap });
};

module.exports = { getSkillGaps, analyzeSkillGap };
