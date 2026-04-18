/**
 * JWT Authentication Middleware
 *
 * protect  → verifies Bearer token, fetches a FRESH user document from MongoDB,
 *            and attaches it to req.user. Never relies solely on the token payload
 *            so that profile updates (e.g. skills) are always reflected immediately.
 *
 * authorize → role-based access guard, used after protect.
 */

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── protect ───────────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  // ── 1. Extract token ────────────────────────────────────────────────────────
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Not authorized — no token provided' });
  }

  try {
    // ── 2. Verify signature & expiry ─────────────────────────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── 3. Fetch FRESH user from DB (never trust token payload for profile) ──
    // We deliberately re-query on every request so that any profile update
    // (e.g. skills, industry) is visible to downstream controllers instantly.
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res
        .status(401)
        .json({ message: 'Not authorized — user account no longer exists' });
    }

    // ── 4. Debug log (skills are critical for Skill Gap analysis) ────────────
    console.log(
      `[Auth] protect OK — user=${user._id} ` +
      `skills=[${(user.skills || []).join(', ')}] ` +
      `(${(user.skills || []).length} skill(s))`
    );

    // ── 5. Attach to request ─────────────────────────────────────────────────
    req.user = user;
    next();
  } catch (err) {
    console.error('[Auth] Token verification failed:', err.message);
    return res
      .status(401)
      .json({ message: 'Not authorized — token invalid or expired' });
  }
};

// ── authorize ─────────────────────────────────────────────────────────────────
/**
 * Role-based authorization middleware.
 * Must be used AFTER protect.
 * Usage: router.get('/admin', protect, authorize('admin'), handler)
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Role '${req.user.role}' is not authorized to access this route`,
    });
  }
  next();
};

module.exports = { protect, authorize };
