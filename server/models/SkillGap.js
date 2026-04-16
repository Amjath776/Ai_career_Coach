/**
 * SkillGap Model
 * Detects missing skills between user's current profile and a target role.
 */

const mongoose = require('mongoose');

const skillGapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetRole: { type: String, required: true },
    targetIndustry: { type: String, default: '' },
    currentSkills: [String],
    // AI analysis output
    requiredSkills: [String],
    missingSkills: [
      {
        skill: String,
        priority: {
          type: String,
          enum: ['critical', 'high', 'medium', 'low'],
          default: 'medium',
        },
        estimatedLearningTime: String, // e.g. "2–4 weeks"
        resources: [
          {
            title: String,
            type: String, // course, book, tutorial
            url: String,
            cost: String, // free, paid
          },
        ],
      },
    ],
    strengthAreas: [String],
    overallReadiness: { type: Number, default: 0 }, // 0-100%
    prioritizedLearningOrder: [String],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SkillGap', skillGapSchema);
