const { body, query, validationResult } = require('express-validator');
const { sendValidationError } = require('../utils/response');

const allowedTaskStatuses = ['todo', 'in-progress', 'done'];
const allowedTaskPriorities = ['low', 'medium', 'high'];

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

const validateCreateTask = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .isLength({ min: 2 }).withMessage('Title must be at least 2 characters long'),

  body('projectId')
    .trim()
    .notEmpty().withMessage('Project ID is required')
    .isString().withMessage('Project ID must be a string'),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),

  body('assignedTo')
    .optional({ nullable: true })
    .trim()
    .isString().withMessage('Assigned To must be a valid string user ID'),

  body('status')
    .optional()
    .trim()
    .isIn(allowedTaskStatuses).withMessage(`Status must be one of: ${allowedTaskStatuses.join(', ')}`),

  body('priority')
    .optional()
    .trim()
    .isIn(allowedTaskPriorities).withMessage(`Priority must be one of: ${allowedTaskPriorities.join(', ')}`),

  body('dueDate')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      const parsed = Date.parse(val);
      if (isNaN(parsed)) {
        throw new Error('Due date must be a valid date');
      }
      return true;
    }),

  handleValidation
];

const validateUpdateTask = [
  body('title')
    .optional()
    .trim()
    .isString().withMessage('Title must be a string')
    .isLength({ min: 2 }).withMessage('Title must be at least 2 characters long'),

  body('projectId')
    .optional()
    .trim()
    .isString().withMessage('Project ID must be a string'),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string'),

  body('assignedTo')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      if (typeof val !== 'string') {
        throw new Error('Assigned To must be a valid string user ID or null');
      }
      return true;
    }),

  body('status')
    .optional()
    .trim()
    .isIn(allowedTaskStatuses).withMessage(`Status must be one of: ${allowedTaskStatuses.join(', ')}`),

  body('priority')
    .optional()
    .trim()
    .isIn(allowedTaskPriorities).withMessage(`Priority must be one of: ${allowedTaskPriorities.join(', ')}`),

  body('dueDate')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      const parsed = Date.parse(val);
      if (isNaN(parsed)) {
        throw new Error('Due date must be a valid date');
      }
      return true;
    }),

  handleValidation
];

const validatePatchTaskStatus = [
  body('status')
    .trim()
    .notEmpty().withMessage('Status is required')
    .isIn(allowedTaskStatuses).withMessage(`Status must be one of: ${allowedTaskStatuses.join(', ')}`),

  handleValidation
];

const validateTaskQueryParams = [
  query('status')
    .optional()
    .trim()
    .isIn(allowedTaskStatuses).withMessage(`Filter status must be one of: ${allowedTaskStatuses.join(', ')}`),

  query('priority')
    .optional()
    .trim()
    .isIn(allowedTaskPriorities).withMessage(`Filter priority must be one of: ${allowedTaskPriorities.join(', ')}`),

  query('projectId')
    .optional()
    .trim()
    .isString().withMessage('Filter projectId must be a string'),

  handleValidation
];

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  validatePatchTaskStatus,
  validateTaskQueryParams,
  allowedTaskStatuses,
  allowedTaskPriorities
};
