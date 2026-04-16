/**
 * JobRecommendation Model
 * Stores AI-generated or filtered job recommendations for a user.
 */

const mongoose = require('mongoose');

// ── Sub-schema: Salary ────────────────────────────────────────────────────────
// Defined separately to prevent Mongoose confusing `type: String` (a field name)
// with its own schema-type DSL declaration.
const salarySchema = new mongoose.Schema(
  {
    min:      { type: Number, default: 0 },
    max:      { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
  },
  { _id: false }
);

// ── Sub-schema: Job Entry ─────────────────────────────────────────────────────
const jobSchema = new mongoose.Schema(
  {
    title:          { type: String, default: '' },
    company:        { type: String, default: '' },
    location:       { type: String, default: '' },
    type:           { type: String, default: '' }, // full-time, part-time, contract, freelance
    salary:         { type: salarySchema, default: () => ({}) },
    description:    { type: String, default: '' },
    requiredSkills: { type: [String], default: [] },
    matchScore:     { type: Number, default: 0 },   // 0–100
    url:            { type: String, default: '' },
    source:         { type: String, default: 'AI Generated' },
    postedAt:       { type: Date },
    isSaved:        { type: Boolean, default: false },
    isApplied:      { type: Boolean, default: false },
  },
  { _id: true } // keep _id so frontend can use job._id for save/apply actions
);

// ── Sub-schema: Filters ───────────────────────────────────────────────────────
const filtersSchema = new mongoose.Schema(
  {
    keywords:  { type: [String], default: [] },
    location:  { type: String, default: '' },
    jobType:   { type: String, default: '' },
    minSalary: { type: Number, default: 0 },
    skills:    { type: [String], default: [] },
  },
  { _id: false }
);

// ── Main Schema ───────────────────────────────────────────────────────────────
const jobRecommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobs:        { type: [jobSchema],     default: [] },
    filters:     { type: filtersSchema,   default: () => ({}) },
    generatedAt: { type: Date,            default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobRecommendation', jobRecommendationSchema);

