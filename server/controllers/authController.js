/**
 * Auth Controller
 * Handles signup, login, get current user, and profile update.
 */

const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');

// ── Helper: Generate JWT ──────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── Helper: Send token response ───────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  // Remove password from output
  user.password = undefined;
  res.status(statusCode).json({ success: true, token, user });
};

// ── Validation Schemas ────────────────────────────────────────────────────────
const signupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  currentTitle: Joi.string().allow('').optional(),
  industry: Joi.string().allow('').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * @route  POST /api/auth/signup
 * @access Public
 */
const signup = async (req, res) => {
  const { error } = signupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, email, password, currentTitle, industry } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'An account with this email already exists' });
  }

  const user = await User.create({ name, email, password, currentTitle, industry });
  sendTokenResponse(user, 201, res);
};

/**
 * @route  POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;
  // Explicitly select password (excluded by default)
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  sendTokenResponse(user, 200, res);
};

/**
 * @route  GET /api/auth/me
 * @access Protected
 */
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
};

/**
 * @route  PUT /api/auth/profile
 * @access Protected
 */
const updateProfile = async (req, res) => {
  const allowedFields = ['name', 'currentTitle', 'industry', 'yearsOfExperience', 'skills', 'bio', 'location', 'linkedIn', 'workPreferences', 'mbtiType'];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, user });
};

/**
 * @route  PUT /api/auth/change-password
 * @access Protected
 */
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
};

module.exports = { signup, login, getMe, updateProfile, changePassword };
