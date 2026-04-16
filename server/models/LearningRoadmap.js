/**
 * LearningRoadmap Model
 * Structured monthly learning plan with progress tracking.
 */

const mongoose = require('mongoose');

// ── Sub-schema: Resource ──────────────────────────────────────────────────────
// Extracted separately because an inline object with `type: String` as a KEY
// is misread by Mongoose's schema-type DSL as a type declaration,
// causing it to cast the whole object to a String → CastError.
const resourceSchema = new mongoose.Schema(
  {
    title:          { type: String, default: '' },
    type:           { type: String, default: '' }, // course, book, project, video
    url:            { type: String, default: '' },
    estimatedHours: { type: Number, default: 0 },
  },
  { _id: false }
);

// ── Sub-schema: Project ───────────────────────────────────────────────────────
const projectSchema = new mongoose.Schema(
  {
    title:       { type: String, default: '' },
    description: { type: String, default: '' },
    skills:      { type: [String], default: [] },
  },
  { _id: false }
);

// ── Sub-schema: Phase ─────────────────────────────────────────────────────────
const phaseSchema = new mongoose.Schema(
  {
    month:           { type: Number, required: true },
    title:           { type: String, default: '' },
    focus:           { type: String, default: '' },
    topics:          { type: [String], default: [] },
    resources:       { type: [resourceSchema], default: [] },
    projects:        { type: [projectSchema], default: [] },
    milestones:      { type: [String], default: [] },
    // Progress tracking (user updates)
    completed:       { type: Boolean, default: false },
    completedAt:     { type: Date },
    notes:           { type: String, default: '' },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

// ── Main Schema ───────────────────────────────────────────────────────────────
const learningRoadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    goal:           { type: String, required: true },
    targetRole:     { type: String, default: '' },
    durationMonths: { type: Number, default: 6 },
    currentSkills:  { type: [String], default: [] },
    phases:         { type: [phaseSchema], default: [] },
    overallProgress: { type: Number, default: 0, min: 0, max: 100 },
    generatedAt:    { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningRoadmap', learningRoadmapSchema);

