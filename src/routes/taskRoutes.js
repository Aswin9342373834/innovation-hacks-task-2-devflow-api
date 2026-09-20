const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const {
  validateCreateTask,
  validateUpdateTask,
  validatePatchTaskStatus,
  validateTaskQueryParams
} = require('../validators/taskValidator');

router.get('/', validateTaskQueryParams, taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', validateCreateTask, taskController.createTask);
router.put('/:id', validateUpdateTask, taskController.updateTask);
router.patch('/:id/status', validatePatchTaskStatus, taskController.updateTaskStatus);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
