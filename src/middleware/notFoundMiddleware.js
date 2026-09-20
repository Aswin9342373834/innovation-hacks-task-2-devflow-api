/**
 * 404 Not Found Middleware
 * Handles all requests targeting unregistered API routes
 */
const notFoundMiddleware = (req, res, _next) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found'
  });
};

module.exports = notFoundMiddleware;
