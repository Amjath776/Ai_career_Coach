/**
 * SkillGap Model
 * Detects missing skills between user's current profile and a target role.
 *
 * Field alignment with geminiService.analyzeSkillGap() return shape:
 *   overallReadiness  ← overallReadiness (number)
 *   summary           ← summary (string)          ✅ added
 *   strengths         ← strengths (string[])       ✅ renamed from strengthAreas
 *   missingSkills[]
 *     skill           ← skill
 *     priority        ← priority
 *     reason          ← reason                     ✅ added
 *     suggestion      ← suggestion                 ✅ added
 */

const mongoose = require('mongoose');

// ── Sub-schema: Missing Skill entry ───────────────────────────────────────────
// Kept as a named sub-schema so Mongoose does not mis-interpret the `type`
// property on the parent object as a schema-type DSL instruction.
const missingSkillSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      default: '',
      trim: true,
    },
    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
    },
    // Why this skill is needed for the specific role (from AI or fallback)
    reason: {
      type: String,
      default: '',
    },
    // Concrete learning advice for this skill (from AI or fallback)
    suggestion: {
      type: String,
      default: '',
    },
  },
  { _id: false } // sub-documents don't need individual IDs
);

// ── Main Schema ───────────────────────────────────────────────────────────────
const skillGapSchema = new mongoose.Schema(
  {
    // ── Relationship ──────────────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },

    // ── Request context ───────────────────────────────────────────────────────
    targetRole: {
      type: String,
      required: [true, 'Target role is required'],
      trim: true,
    },
    targetIndustry: {
      type: String,
      default: '',
      trim: true,
    },
    // Snapshot of user skills at the time of analysis
    currentSkills: {
      type: [String],
      default: [],
    },

    // ── AI Analysis Output ────────────────────────────────────────────────────

    // Overall readiness percentage (0–100)
    overallReadiness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Personalized 1–2 sentence summary from Gemini (was missing from schema)
    summary: {
      type: String,
      default: '',
    },

    // User skills that are already relevant to the target role
    // NOTE: field was previously named "strengthAreas" — now aligned with AI output
    strengths: {
      type: [String],
      default: [],
    },

    // Role-specific missing skills with priority, reason, and suggestion
    missingSkills: {
      type: [missingSkillSchema],
      default: [],
    },

    // Timestamp of when this analysis was generated
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // createdAt + updatedAt
);

module.exports = mongoose.model('SkillGap', skillGapSchema);
