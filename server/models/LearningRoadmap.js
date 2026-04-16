/**
 * LearningRoadmap Model
 * Structured monthly learning plan with progress tracking.
 */

const mongoose = require('mongoose');

const learningRoadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    goal: { type: String, required: true }, // e.g. "Become a Data Scientist"
    targetRole: { type: String, default: '' },
    durationMonths: { type: Number, default: 6 },
    currentSkills: [String],
    // Monthly phases
    phases: [
      {
        month: Number,
        title: String,
        focus: String, // what the month focuses on
        topics: [String],
        resources: [
          {
            title: String,
            type: String, // course, book, project
            url: String,
            estimatedHours: Number,
          },
        ],
        projects: [
          {
            title: String,
            description: String,
            skills: [String],
          },
        ],
        milestones: [String],
        // Progress tracking (user updates)
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
        notes: { type: String, default: '' },
        progressPercent: { type: Number, default: 0 },
      },
    ],
    // Overall progress
    overallProgress: { type: Number, default: 0 }, // 0-100
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningRoadmap', learningRoadmapSchema);
