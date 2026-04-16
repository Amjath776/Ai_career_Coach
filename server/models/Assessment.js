/**
 * Assessment Model
 * Stores interview prep assessments and personality assessments.
 * One-to-Many: User can have multiple assessment sessions.
 */

const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['interview', 'personality', 'skill-quiz'],
      required: true,
    },
    // Interview prep fields
    targetRole: { type: String, default: '' },
    targetCompany: { type: String, default: '' },
    interviewType: {
      type: String,
      enum: ['behavioral', 'technical', 'mixed', 'case-study'],
      default: 'mixed',
    },
    // Questions and answers
    questions: [
      {
        question: String,
        category: String, // behavioral, technical, situational
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
          default: 'medium',
        },
        userAnswer: { type: String, default: '' },
        aiFeedback: { type: String, default: '' },
        aiScore: { type: Number, default: 0 }, // 0-10
        tips: [String],
        modelAnswer: { type: String, default: '' },
      },
    ],
    // Overall assessment results
    overallScore: { type: Number, default: 0 },
    strengths: [String],
    areasForImprovement: [String],
    completedAt: { type: Date },
    durationMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
