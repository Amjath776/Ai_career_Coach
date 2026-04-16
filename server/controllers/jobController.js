/**
 * Job Recommendations Controller
 */

const JobRecommendation = require('../models/JobRecommendation');
const gemini = require('../services/geminiService');

/** GET /api/jobs — Get latest job recommendations */
const getJobs = async (req, res) => {
  // BUG FIX: findOne() does NOT support .sort() — use find().limit(1) instead
  const [recommendations] = await JobRecommendation
    .find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(1);

  console.log(`[Jobs] GET for user=${req.user.id}, found=${!!recommendations}`);
  res.json({ success: true, recommendations: recommendations || null });
};

/** POST /api/jobs/generate — Generate AI job recommendations */
const generateJobs = async (req, res) => {
  const { keywords, location, jobType, minSalary } = req.body;

  // BUG FIX: req.user is already populated by protect middleware — no extra DB query
  const { skills, currentTitle, industry, workPreferences } = req.user;

  console.log(`[Jobs] Generating for user=${req.user.id}`, {
    keywords, location, jobType, skills: skills?.length,
  });

  const jobs = await gemini.generateJobRecommendations({
    skills:       skills || [],
    currentTitle: currentTitle || '',
    industry:     industry || '',
    preferences: {
      workStyle: workPreferences?.workStyle || '',
      jobType:   jobType || workPreferences?.jobType || '',
      location:  location || '',
      minSalary: minSalary || 0,
    },
  });

  console.log(`[Jobs] Gemini returned ${jobs?.length ?? 0} jobs`);

  const recommendations = await JobRecommendation.findOneAndUpdate(
    { user: req.user.id },
    {
      user: req.user.id,
      jobs,
      filters: {
        keywords: keywords ? keywords.split(',').map((k) => k.trim()) : [],
        location,
        jobType,
        minSalary,
        skills: skills || [],
      },
      generatedAt: new Date(),
    },
    { new: true, upsert: true, runValidators: true }
  );

  console.log(`[Jobs] Saved to DB, id=${recommendations._id}, jobs=${recommendations.jobs?.length}`);
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
  console.log(`[Jobs] Toggled save for jobId=${req.params.jobId}, isSaved=${job.isSaved}`);
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
  console.log(`[Jobs] Marked applied for jobId=${req.params.jobId}`);
  res.json({ success: true, message: 'Marked as applied' });
};

module.exports = { getJobs, generateJobs, toggleSaveJob, markApplied };

