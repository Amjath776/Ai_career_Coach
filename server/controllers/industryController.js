/**
 * Industry Insights Controller
 */

const IndustryInsight = require('../models/IndustryInsight');
const gemini = require('../services/geminiService');

/** GET /api/industry — Get user's saved insights */
const getInsights = async (req, res) => {
  const insights = await IndustryInsight.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(10);
  res.json({ success: true, insights });
};

/** POST /api/industry/generate */
const generateInsights = async (req, res) => {
  const { industry, role, location = 'Global' } = req.body;
  if (!industry) return res.status(400).json({ message: 'Industry is required' });

  const data = await gemini.generateIndustryInsights({ industry, role: role || '', location });

  const insight = await IndustryInsight.create({
    user: req.user.id,
    industry,
    role: role || '',
    location,
    ...data,
  });

  res.status(201).json({ success: true, insight });
};

/** DELETE /api/industry/:id */
const deleteInsight = async (req, res) => {
  await IndustryInsight.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ success: true, message: 'Insight deleted' });
};

module.exports = { getInsights, generateInsights, deleteInsight };
