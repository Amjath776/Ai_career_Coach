/**
 * CoverLetter Model
 * One-to-Many: A user can have multiple cover letters.
 */

const mongoose = require('mongoose');

const coverLetterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Job the cover letter is for
    jobTitle: { type: String, required: true },
    companyName: { type: String, default: '' },
    jobDescription: { type: String, default: '' },
    // Generated content
    content: { type: String, default: '' },
    // Customization inputs
    tone: {
      type: String,
      enum: ['professional', 'enthusiastic', 'confident', 'humble'],
      default: 'professional',
    },
    highlights: [String], // key achievements to emphasize
    status: {
      type: String,
      enum: ['draft', 'final'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CoverLetter', coverLetterSchema);
