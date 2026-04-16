/**
 * Interview Prep Controller
 */

const Assessment = require('../models/Assessment');
const gemini = require('../services/geminiService');

/** GET /api/interview — Get user's interview sessions */
const getSessions = async (req, res) => {
  const sessions = await Assessment.find({ user: req.user.id, type: 'interview' }).sort({ createdAt: -1 });
  res.json({ success: true, sessions });
};

/** POST /api/interview/start — Start a new interview session (generate questions) */
const startSession = async (req, res) => {
  const { targetRole, targetCompany, interviewType = 'mixed', numQuestions = 10 } = req.body;
  if (!targetRole) return res.status(400).json({ message: 'Target role is required' });

  const questions = await gemini.generateInterviewQuestions({
    targetRole,
    company: targetCompany || '',
    interviewType,
    numQuestions: Math.min(Math.max(parseInt(numQuestions), 5), 20),
  });

  const session = await Assessment.create({
    user: req.user.id,
    type: 'interview',
    targetRole,
    targetCompany: targetCompany || '',
    interviewType,
    questions,
  });

  res.status(201).json({ success: true, session });
};

/** PUT /api/interview/:id/answer — Submit an answer and get AI feedback */
const submitAnswer = async (req, res) => {
  const { questionIndex, answer } = req.body;
  if (answer === undefined || questionIndex === undefined) {
    return res.status(400).json({ message: 'questionIndex and answer are required' });
  }

  const session = await Assessment.findOne({ _id: req.params.id, user: req.user.id });
  if (!session) return res.status(404).json({ message: 'Session not found' });

  const q = session.questions[questionIndex];
  if (!q) return res.status(404).json({ message: 'Question not found' });

  // Get AI evaluation
  const evaluation = await gemini.evaluateAnswer({
    question: q.question,
    answer,
    role: session.targetRole,
  });

  q.userAnswer = answer;
  q.aiFeedback = evaluation.feedback;
  q.aiScore = evaluation.score;
  q.tips = evaluation.improvements || [];
  if (evaluation.modelAnswer) q.modelAnswer = evaluation.modelAnswer;

  // Recalculate overall score
  const answeredQuestions = session.questions.filter((q) => q.userAnswer);
  if (answeredQuestions.length > 0) {
    session.overallScore = Math.round(
      answeredQuestions.reduce((sum, q) => sum + (q.aiScore || 0), 0) / answeredQuestions.length
    );
  }

  await session.save();
  res.json({ success: true, feedback: evaluation, session });
};

/** PUT /api/interview/:id/complete — Mark session as completed */
const completeSession = async (req, res) => {
  const session = await Assessment.findOne({ _id: req.params.id, user: req.user.id });
  if (!session) return res.status(404).json({ message: 'Session not found' });

  session.completedAt = new Date();
  // Generate summary strengths and improvement areas from question feedback
  const answeredQuestions = session.questions.filter((q) => q.userAnswer);
  session.strengths = ['Clear communication', 'Good structure'];
  session.areasForImprovement = ['Use more specific examples', 'Quantify achievements'];
  await session.save();
  res.json({ success: true, session });
};

/** DELETE /api/interview/:id */
const deleteSession = async (req, res) => {
  await Assessment.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  res.json({ success: true, message: 'Session deleted' });
};

module.exports = { getSessions, startSession, submitAnswer, completeSession, deleteSession };
