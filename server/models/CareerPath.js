/**
 * CareerPath Model
 * AI-generated personalized career path recommendations.
 * One-to-Many: A user can explore multiple career paths.
 */

const mongoose = require('mongoose');

const careerPathSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    currentRole: { type: String, required: true },
    targetRole: { type: String, required: true },
    industry: { type: String, default: '' },
    mbtiType: { type: String, default: '' },
    workPreferences: {
      workStyle: String,
      jobType: String,
    },
    // AI-generated path steps
    paths: [
      {
        title: String, // e.g. "Path A: Fast Track"
        description: String,
        timelineYears: Number,
        steps: [
          {
            step: Number,
            role: String,
            duration: String, // e.g. "6–12 months"
            skills: [String],
            responsibilities: [String],
            avgSalary: String,
            tips: String,
          },
        ],
        requiredSkills: [String],
        estimatedSalaryGrowth: String,
        difficulty: {
          type: String,
          enum: ['easy', 'moderate', 'challenging', 'aggressive'],
          default: 'moderate',
        },
      },
    ],
    // Personality-based insights
    personalityInsights: {
      mbtiAnalysis: String,
      careerAlignment: String,
      strengths: [String],
      challenges: [String],
    },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CareerPath', careerPathSchema);
