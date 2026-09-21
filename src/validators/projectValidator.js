const { body, validationResult } = require('express-validator');
const { sendValidationError } = require('../utils/response');
const { allowedProjectStatuses } = require('../models/Project');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return sendValidationError(res, formattedErrors);
  }
  next();
};

const validateCreateProject = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isString().withMessage('Description must be a string')
    .isLength({ min: 5 }).withMessage('Description must be at least 5 characters long'),

  body('ownerId')
    .trim()
    .notEmpty().withMessage('Owner ID is required')
    .isString().withMessage('Owner ID must be a string'),

  body('status')
    .optional()
    .trim()
    .isIn(allowedProjectStatuses).withMessage(`Status must be one of: ${allowedProjectStatuses.join(', ')}`),

  body('progress')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Progress must be a number between 0 and 100'),

  handleValidation
];

const validateUpdateProject = [
  body('name')
    .optional()
    .trim()
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),

  body('description')
    .optional()
    .trim()
    .isString().withMessage('Description must be a string')
    .isLength({ min: 5 }).withMessage('Description must be at least 5 characters long'),

  body('ownerId')
    .optional()
    .trim()
    .isString().withMessage('Owner ID must be a string'),

  body('status')
    .optional()
    .trim()
    .isIn(allowedProjectStatuses).withMessage(`Status must be one of: ${allowedProjectStatuses.join(', ')}`),

  body('progress')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Progress must be a number between 0 and 100'),

  handleValidation
];

module.exports = {
  validateCreateProject,
  validateUpdateProject,
  allowedProjectStatuses
};
