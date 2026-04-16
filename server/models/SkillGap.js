/**
 * SkillGap Model
 * Detects missing skills between user's current profile and a target role.
 */

const mongoose = require('mongoose');

// ── Sub-schema: Learning Resource ─────────────────────────────────────────────
// Must be defined separately so Mongoose does NOT confuse the `type` property
// with its own schema-type DSL (which would cast the whole object to a String).
const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    type:  { type: String, default: '' }, // course, book, tutorial, video
    url:   { type: String, default: '' },
    cost:  { type: String, default: '' }, // free, paid, free with audit
  },
  { _id: false } // no need for individual IDs on sub-docs
);

// ── Sub-schema: Missing Skill entry ───────────────────────────────────────────
const missingSkillSchema = new mongoose.Schema(
  {
    skill: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
    },
    estimatedLearningTime: { type: String, default: '' },
    resources: { type: [resourceSchema], default: [] },
  },
  { _id: false }
);

// ── Main Schema ───────────────────────────────────────────────────────────────
const skillGapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetRole:     { type: String, required: true },
    targetIndustry: { type: String, default: '' },
    currentSkills:  { type: [String], default: [] },
    // AI analysis output
    requiredSkills:            { type: [String], default: [] },
    missingSkills:             { type: [missingSkillSchema], default: [] },
    strengthAreas:             { type: [String], default: [] },
    overallReadiness:          { type: Number, default: 0 }, // 0–100
    prioritizedLearningOrder:  { type: [String], default: [] },
    generatedAt:               { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SkillGap', skillGapSchema);

