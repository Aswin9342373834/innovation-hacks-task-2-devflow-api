/**
 * Standardized API response utilities for DevFlow API
 */

const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode = 500, message = 'An error occurred', errorCode = null) => {
  const response = {
    success: false,
    message
  };

  if (errorCode) {
    response.error = {
      code: errorCode
    };
  }

  return res.status(statusCode).json(response);
};

const sendValidationError = (res, errors = [], message = 'Validation failed') => {
  return res.status(400).json({
    success: false,
    message,
    errors
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError
};
