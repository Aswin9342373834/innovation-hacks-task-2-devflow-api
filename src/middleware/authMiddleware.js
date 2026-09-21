const User = require('../models/User');
const { verifyToken } = require('../config/jwt');
const { sendError } = require('../utils/response');

/**
 * Authentication Middleware for protected routes.
 * Requires HTTP Authorization header: "Bearer <token>"
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Authentication token required. Format: Bearer <token>', 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 401, 'Invalid authentication token', 'UNAUTHORIZED');
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.message.includes('JWT_SECRET is not configured')) {
        return sendError(res, 500, err.message, 'CONFIG_ERROR');
      }
      return sendError(res, 401, 'Invalid or expired authentication token', 'INVALID_TOKEN');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 401, 'User account no longer exists', 'USER_NOT_FOUND');
    }

    // Attach authenticated user to request
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Optional authentication middleware.
 * If token is provided and valid, attaches req.user.
 * If not provided, continues without error.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = verifyToken(token);
          const user = await User.findById(decoded.id);
          if (user) {
            req.user = user;
          }
        } catch {
          // Token invalid, ignore for optional auth
        }
      }
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  requireAuth,
  optionalAuth
};
