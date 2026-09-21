/**
 * Centralized Error Handling Middleware
 * Catches all unhandled errors passed via next(err)
 */
const errorMiddleware = (err, req, res, _next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  // 1. Mongoose / MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
    const message = field === 'email'
      ? 'A user with this email already exists'
      : `Duplicate value entered for ${field}`;
    return res.status(409).json({
      success: false,
      message,
      error: {
        code: field === 'email' ? 'EMAIL_ALREADY_EXISTS' : 'DUPLICATE_KEY_ERROR'
      }
    });
  }

  // 2. Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    const formattedErrors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }

  // 3. Mongoose Invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format: ${err.value}`,
      error: {
        code: 'INVALID_ID'
      }
    });
  }

  // 4. Malformed JSON payload parser error
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload',
      error: {
        code: 'BAD_REQUEST'
      }
    });
  }

  // 5. Custom status codes & general fallback
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Internal Server Error'
  };

  if (err.code && typeof err.code === 'string') {
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
