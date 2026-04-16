/**
 * Joi Validation Middleware Factory
 * Usage: validate(schema) — wraps a Joi schema for request body validation
 */

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const details = error.details.map((d) => d.message.replace(/"/g, ''));
    return res.status(400).json({ message: details.join('; ') });
  }
  next();
};

module.exports = validate;
