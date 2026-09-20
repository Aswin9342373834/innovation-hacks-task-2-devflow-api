const { body, validationResult } = require('express-validator');
const { sendValidationError } = require('../utils/response');

const allowedRoles = ['developer', 'manager', 'designer', 'tester'];

const validateCreateUser = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('role')
    .optional()
    .trim()
    .isIn(allowedRoles).withMessage(`Role must be one of: ${allowedRoles.join(', ')}`),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg
      }));
      return sendValidationError(res, formattedErrors);
    }
    next();
  }
];

module.exports = {
  validateCreateUser
};
