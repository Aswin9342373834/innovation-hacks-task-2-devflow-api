const store = require('../data/store');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/tasks
 * Retrieve tasks with optional query filters (status, priority, projectId)
 */
const getAllTasks = async (req, res, next) => {
  try {
    const { status, priority, projectId } = req.query;
    let tasks = store.getTasks();

    if (status) {
      tasks = tasks.filter((t) => t.status.toLowerCase() === status.toLowerCase());
    }

    if (priority) {
      tasks = tasks.filter((t) => t.priority.toLowerCase() === priority.toLowerCase());
    }

    if (projectId) {
      tasks = tasks.filter((t) => t.projectId === projectId);
    }

    return sendSuccess(res, 200, 'Tasks retrieved successfully', tasks);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/tasks/:id
 * Retrieve a specific task by ID
 */
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = store.getTaskById(id);

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
 * Create a new task
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, status, priority, dueDate } = req.body;

    // Verify referenced project exists
    const project = store.getProjectById(projectId);
    if (!project) {
      return sendError(res, 404, `Referenced project with ID '${projectId}' does not exist`, 'PROJECT_NOT_FOUND');
    }

    // Verify assignedTo user exists if provided
    if (assignedTo) {
      const user = store.getUserById(assignedTo);
      if (!user) {
        return sendError(res, 404, `Referenced assigned user with ID '${assignedTo}' does not exist`, 'USER_NOT_FOUND');
      }
    }

    const newTask = store.addTask({
      title,
      description,
      projectId,
      assignedTo,
      status,
      priority,
      dueDate
    });

    return sendSuccess(res, 201, 'Task created successfully', newTask);
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/tasks/:id
 * Fully/partially update a task
 */
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingTask = store.getTaskById(id);

    if (!existingTask) {
      return sendError(res, 404, 'Task not found', 'TASK_NOT_FOUND');
    }

    const { title, description, projectId, assignedTo, status, priority, dueDate } = req.body;

    // If projectId is being updated, verify new project exists
    if (projectId !== undefined) {
      const project = store.getProjectById(projectId);
      if (!project) {
        return sendError(res, 404, `Referenced project with ID '${projectId}' does not exist`, 'PROJECT_NOT_FOUND');
      }
    }

    // If assignedTo is being updated, verify user exists (unless explicitly setting to null/empty)
    if (assignedTo) {
      const user = store.getUserById(assignedTo);
      if (!user) {
        return sendError(res, 404, `Referenced assigned user with ID '${assignedTo}' does not exist`, 'USER_NOT_FOUND');
      }
    }

    const updatedTask = store.updateTask(id, {
      title,
      description,
      projectId,
      assignedTo,
      status,
      priority,
      dueDate
    });

    return sendSuccess(res, 200, 'Task updated successfully', updatedTask);
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
    const { status } = req.body;

    const existingTask = store.getTaskById(id);
    if (!existingTask) {
      return sendError(res, 404, 'Task not found', 'TASK_NOT_FOUND');
    }

    const updatedTask = store.updateTask(id, { status });
    return sendSuccess(res, 200, 'Task status updated successfully', updatedTask);
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
    const existingTask = store.getTaskById(id);

    if (!existingTask) {
      return sendError(res, 404, 'Task not found', 'TASK_NOT_FOUND');
    }

    store.deleteTask(id);
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
