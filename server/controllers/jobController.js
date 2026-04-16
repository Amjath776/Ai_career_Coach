/**
 * Job Recommendations Controller
 */

const JobRecommendation = require('../models/JobRecommendation');
const User = require('../models/User');
const gemini = require('../services/geminiService');

/** GET /api/jobs — Get latest job recommendations */
const getJobs = async (req, res) => {
  const recommendations = await JobRecommendation.findOne({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, recommendations });
};

/** POST /api/jobs/generate — Generate AI job recommendations */
const generateJobs = async (req, res) => {
  const user = await User.findById(req.user.id);
  const { keywords, location, jobType, minSalary } = req.body;

  const jobs = await gemini.generateJobRecommendations({
    skills: user.skills || [],
    currentTitle: user.currentTitle || '',
    industry: user.industry || '',
    preferences: { workStyle: user.workPreferences?.workStyle, jobType: jobType || user.workPreferences?.jobType, location, minSalary },
  });

  // Upsert the recommendations document
  const recommendations = await JobRecommendation.findOneAndUpdate(
    { user: req.user.id },
    {
      user: req.user.id,
      jobs,
      filters: { keywords: keywords ? keywords.split(',').map((k) => k.trim()) : [], location, jobType, minSalary, skills: user.skills },
      generatedAt: new Date(),
    },
    { new: true, upsert: true }
  );

  res.json({ success: true, recommendations });
};

/** PUT /api/jobs/:jobId/save — Toggle saved status */
const toggleSaveJob = async (req, res) => {
  const rec = await JobRecommendation.findOne({ user: req.user.id });
  if (!rec) return res.status(404).json({ message: 'No recommendations found' });

  const job = rec.jobs.id(req.params.jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  job.isSaved = !job.isSaved;
  await rec.save();
  res.json({ success: true, isSaved: job.isSaved });
};

/** PUT /api/jobs/:jobId/apply — Mark as applied */
const markApplied = async (req, res) => {
  const rec = await JobRecommendation.findOne({ user: req.user.id });
  if (!rec) return res.status(404).json({ message: 'No recommendations found' });

  const job = rec.jobs.id(req.params.jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  job.isApplied = true;
  await rec.save();
  res.json({ success: true, message: 'Marked as applied' });
};

module.exports = { getJobs, generateJobs, toggleSaveJob, markApplied };
