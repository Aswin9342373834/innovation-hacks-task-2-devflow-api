/**
 * Centralized Error Handling Middleware
 * Catches all unhandled errors passed via next(err)
 */
const errorMiddleware = (err, req, res, _next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Internal Server Error'
  };

  if (err.code) {
    response.error = {
      code: err.code
    };
  } else if (statusCode === 500) {
    response.error = {
      code: 'INTERNAL_SERVER_ERROR'
    };
  }

  return res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
