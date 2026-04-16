/**
 * IndustryInsight Model
 * Market data, salary ranges, top skills, and recommended training per industry.
 */

const mongoose = require('mongoose');

const industryInsightSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    industry: { type: String, required: true },
    role: { type: String, default: '' },
    location: { type: String, default: 'Global' },
    // AI-generated insights
    marketOverview: { type: String, default: '' },
    growthOutlook: { type: String, default: '' }, // Positive, Neutral, Declining
    demandLevel: {
      type: String,
      enum: ['very-high', 'high', 'medium', 'low'],
      default: 'medium',
    },
    salaryRanges: [
      {
        level: String, // Entry, Mid, Senior, Lead
        min: Number,
        max: Number,
        median: Number,
        currency: { type: String, default: 'USD' },
      },
    ],
    topSkills: [
      {
        skill: String,
        demandScore: Number, // 0-100
        trend: {
          type: String,
          enum: ['rising', 'stable', 'declining'],
          default: 'stable',
        },
      },
    ],
    topCertifications: [String],
    topCompanies: [String],
    recommendedTraining: [
      {
        title: String,
        provider: String,
        url: String,
        cost: String,
      },
    ],
    workTrends: [String], // e.g. "Remote-first", "AI adoption"
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('IndustryInsight', industryInsightSchema);
