const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/tasks
 * Retrieve tasks with optional query filters (status, priority, projectId, assignedTo)
 */
const getAllTasks = async (req, res, next) => {
  try {
    const { status, priority, projectId, assignedTo } = req.query;
    const filter = {};

    if (status) {
      filter.status = status.toLowerCase();
    }

    if (priority) {
      filter.priority = priority.toLowerCase();
    }

    if (projectId) {
      if (mongoose.Types.ObjectId.isValid(projectId)) {
        filter.projectId = projectId;
      } else {
        filter.projectId = new mongoose.Types.ObjectId(); // Non-matching ObjectId
      }
    }

    if (assignedTo) {
      if (mongoose.Types.ObjectId.isValid(assignedTo)) {
        filter.assignedTo = assignedTo;
      } else {
        filter.assignedTo = new mongoose.Types.ObjectId();
      }
    }

    const tasks = await Task.find(filter)
      .populate('projectId', 'name status')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Tasks retrieved successfully', tasks);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/tasks/:id
 * Retrieve a specific task by ID with populated project & user references
 */
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 404, 'Task not found', 'TASK_NOT_FOUND');
    }

    const task = await Task.findById(id)
      .populate('projectId', 'name status')
      .populate('assignedTo', 'name email role');

    if (!task) {
      return sendError(res, 404, 'Task not found', 'TASK_NOT_FOUND');
    }

    return sendSuccess(res, 200, 'Task retrieved successfully', task);
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/tasks
 * Create a new task after validating project and assigned user exist
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, status, priority, dueDate } = req.body;

    // Verify referenced project exists
    const isProjectValid = mongoose.Types.ObjectId.isValid(projectId);
    const project = isProjectValid ? await Project.findById(projectId) : null;
    if (!project) {
      return sendError(
        res,
        404,
        `Referenced project with ID '${projectId}' does not exist`,
        'PROJECT_NOT_FOUND'
      );
    }

    // Verify assignedTo user exists if provided
    let assignedUserId = null;
    if (assignedTo) {
      const isUserValid = mongoose.Types.ObjectId.isValid(assignedTo);
      const user = isUserValid ? await User.findById(assignedTo) : null;
      if (!user) {
        return sendError(
          res,
          404,
          `Referenced assigned user with ID '${assignedTo}' does not exist`,
          'USER_NOT_FOUND'
        );
      }
      assignedUserId = user._id;
    }

    const newTask = await Task.create({
      title,
      description: description || '',
      projectId,
      assignedTo: assignedUserId,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null
    });

    return sendSuccess(res, 201, 'Task created successfully', newTask);
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/tasks/:id or PATCH /api/tasks/:id
 * Fully/partially update a task with relational validation
 */
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 404, 'Task not found', 'TASK_NOT_FOUND');
    }

    const task = await Task.findById(id);
    if (!task) {
      return sendError(res, 404, 'Task not found', 'TASK_NOT_FOUND');
    }

    const { title, description, projectId, assignedTo, status, priority, dueDate } = req.body;

    // If projectId is being updated, verify new project exists
    if (projectId !== undefined) {
      const isProjectValid = mongoose.Types.ObjectId.isValid(projectId);
      const project = isProjectValid ? await Project.findById(projectId) : null;
      if (!project) {
        return sendError(
          res,
          404,
          `Referenced project with ID '${projectId}' does not exist`,
          'PROJECT_NOT_FOUND'
        );
      }
      task.projectId = projectId;
    }

    // If assignedTo is being updated, verify user exists (unless setting to null/empty)
    if (assignedTo !== undefined) {
      if (assignedTo === null || assignedTo === '') {
        task.assignedTo = null;
      } else {
        const isUserValid = mongoose.Types.ObjectId.isValid(assignedTo);
        const user = isUserValid ? await User.findById(assignedTo) : null;
        if (!user) {
          return sendError(
            res,
            404,
            `Referenced assigned user with ID '${assignedTo}' does not exist`,
            'USER_NOT_FOUND'
          );
        }
        task.assignedTo = user._id;
      }
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();
    return sendSuccess(res, 200, 'Task updated successfully', task);
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/tasks/:id/status
 * Update only task status
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 404, 'Task not found', 'TASK_NOT_FOUND');
    }

    const task = await Task.findById(id);
    if (!task) {
      return sendError(res, 404, 'Task not found', 'TASK_NOT_FOUND');
    }

    task.status = req.body.status;
    await task.save();

    return sendSuccess(res, 200, 'Task status updated successfully', task);
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 404, 'Task not found', 'TASK_NOT_FOUND');
    }

    const task = await Task.findById(id);
    if (!task) {
      return sendError(res, 404, 'Task not found', 'TASK_NOT_FOUND');
    }

    await Task.findByIdAndDelete(id);
    return sendSuccess(res, 200, 'Task deleted successfully', { id });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
};
