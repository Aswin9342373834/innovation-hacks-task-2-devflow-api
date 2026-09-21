const jwt = require('jsonwebtoken');

/**
 * Get JWT_SECRET strictly from environment variables.
 * Throws a configuration error if missing or empty.
 */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '') {
    throw new Error('JWT_SECRET is not configured in environment variables. Set JWT_SECRET in your environment.');
  }
  return secret;
};

/**
 * Sign a JWT token for a given user payload.
 * Default expiration: 7d
 */
const generateToken = (payload, expiresIn = '7d') => {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify a JWT token.
 * Throws an error if invalid, expired, or secret missing.
 */
const verifyToken = (token) => {
  const secret = getJwtSecret();
  return jwt.verify(token, secret);
};

module.exports = {
  getJwtSecret,
  generateToken,
  verifyToken
};
