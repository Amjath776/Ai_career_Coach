/**
 * JobRecommendation Model
 * Stores AI-generated or filtered job recommendations for a user.
 */

const mongoose = require('mongoose');

const jobRecommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobs: [
      {
        title: String,
        company: String,
        location: String,
        type: String, // full-time, part-time, etc.
        salary: {
          min: Number,
          max: Number,
          currency: { type: String, default: 'USD' },
        },
        description: String,
        requiredSkills: [String],
        matchScore: Number, // 0-100 how well it matches user profile
        url: String,
        source: { type: String, default: 'AI Generated' },
        postedAt: Date,
        isSaved: { type: Boolean, default: false },
        isApplied: { type: Boolean, default: false },
      },
    ],
    // Filters used to generate these recommendations
    filters: {
      keywords: [String],
      location: String,
      jobType: String,
      minSalary: Number,
      skills: [String],
    },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobRecommendation', jobRecommendationSchema);
