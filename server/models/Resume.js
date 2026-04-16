/**
 * Resume Model
 * One-to-One relationship with User.
 * Stores resume content and AI-generated feedback.
 */

const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One resume per user
    },
    // Raw text content (from upload or manual entry)
    content: {
      type: String,
      default: '',
    },
    // Structured sections
    personalInfo: {
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      linkedIn: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    summary: { type: String, default: '' },
    experience: [
      {
        company: String,
        title: String,
        startDate: String,
        endDate: String,
        current: Boolean,
        description: String,
        achievements: [String],
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        startDate: String,
        endDate: String,
        gpa: String,
      },
    ],
    skills: [String],
    certifications: [
      {
        name: String,
        issuer: String,
        date: String,
        url: String,
      },
    ],
    projects: [
      {
        name: String,
        description: String,
        technologies: [String],
        url: String,
      },
    ],
    languages: [
      {
        language: String,
        proficiency: String,
      },
    ],
    // AI-generated feedback
    aiFeedback: {
      overallScore: { type: Number, default: 0 }, // 0-100
      strengths: [String],
      improvements: [String],
      actionVerbs: [String],
      suggestedSummary: { type: String, default: '' },
      atsScore: { type: Number, default: 0 }, // ATS compatibility
      keywordSuggestions: [String],
      generatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
