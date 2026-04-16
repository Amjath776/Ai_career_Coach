/**
 * Dashboard Controller
 * Aggregates data from multiple collections for the dashboard view.
 */

const User = require('../models/User');
const Resume = require('../models/Resume');
const CoverLetter = require('../models/CoverLetter');
const Assessment = require('../models/Assessment');
const SkillGap = require('../models/SkillGap');
const LearningRoadmap = require('../models/LearningRoadmap');
const JobRecommendation = require('../models/JobRecommendation');

/** GET /api/dashboard — Aggregated dashboard data */
const getDashboard = async (req, res) => {
  const userId = req.user.id;

  // Run all queries in parallel for performance
  const [user, resume, coverLetters, assessments, skillGaps, roadmaps, jobs] = await Promise.all([
    User.findById(userId),
    Resume.findOne({ user: userId }),
    CoverLetter.find({ user: userId }).sort({ createdAt: -1 }).limit(3),
    Assessment.find({ user: userId, type: 'interview' }).sort({ createdAt: -1 }).limit(5),
    SkillGap.find({ user: userId }).sort({ createdAt: -1 }).limit(1),
    LearningRoadmap.find({ user: userId }).sort({ createdAt: -1 }).limit(1),
    JobRecommendation.findOne({ user: userId }),
  ]);

  // Build stat cards
  const stats = {
    resumeScore: resume?.aiFeedback?.overallScore || 0,
    atsScore: resume?.aiFeedback?.atsScore || 0,
    coverLettersCount: await CoverLetter.countDocuments({ user: userId }),
    interviewSessions: await Assessment.countDocuments({ user: userId, type: 'interview' }),
    avgInterviewScore: assessments.length > 0
      ? Math.round(assessments.reduce((s, a) => s + (a.overallScore || 0), 0) / assessments.length)
      : 0,
    roadmapProgress: roadmaps[0]?.overallProgress || 0,
    skillReadiness: skillGaps[0]?.overallReadiness || 0,
    savedJobs: jobs?.jobs?.filter((j) => j.isSaved).length || 0,
    appliedJobs: jobs?.jobs?.filter((j) => j.isApplied).length || 0,
  };

  // Recent activity feed
  const recentActivity = [
    ...coverLetters.map((cl) => ({ type: 'cover-letter', title: `Cover letter for ${cl.jobTitle}`, date: cl.createdAt })),
    ...assessments.map((a) => ({ type: 'interview', title: `Interview prep: ${a.targetRole}`, date: a.createdAt, score: a.overallScore })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  // Skills chart data
  const skillsData = user.skills?.slice(0, 8).map((skill, i) => ({
    skill,
    proficiency: Math.floor(Math.random() * 30 + 60), // Would come from assessments in production
  })) || [];

  res.json({
    success: true,
    data: {
      user: { name: user.name, email: user.email, currentTitle: user.currentTitle, industry: user.industry },
      stats,
      recentActivity,
      skillsData,
      latestSkillGap: skillGaps[0] || null,
      latestRoadmap: roadmaps[0] || null,
      recommendedJobs: jobs?.jobs?.slice(0, 3) || [],
    },
  });
};

module.exports = { getDashboard };
