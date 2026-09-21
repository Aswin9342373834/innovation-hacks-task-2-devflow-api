const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');
const {
  generateTasksWithGemini,
  generateProductivitySuggestions
} = require('../services/aiService');
const { sendSuccess, sendError, sendValidationError } = require('../utils/response');

/**
 * POST /api/ai/generate-tasks
 * Generate 4-8 structured development tasks using Google Gemini (or smart engine fallback)
 */
const generateTasks = async (req, res, next) => {
  try {
    const { prompt, projectId } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return sendValidationError(res, [
        { field: 'prompt', message: 'Project description or goal must be at least 3 characters long' }
      ]);
    }

    let targetProject = null;
    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return sendError(res, 404, 'Referenced project not found', 'PROJECT_NOT_FOUND');
      }
      targetProject = await Project.findById(projectId);
      if (!targetProject) {
        return sendError(res, 404, 'Referenced project not found', 'PROJECT_NOT_FOUND');
      }
    }

    const result = await generateTasksWithGemini(prompt.trim());

    return sendSuccess(res, 200, 'Tasks generated successfully', {
      prompt: prompt.trim(),
      projectId: targetProject ? targetProject._id : null,
      projectName: targetProject ? targetProject.name : null,
      provider: result.provider,
      tasks: result.tasks
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/ai/save-tasks
 * Batch save reviewed and approved AI tasks to MongoDB
 */
const saveGeneratedTasks = async (req, res, next) => {
  try {
    const { projectId, tasks } = req.body;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return sendValidationError(res, [
        { field: 'projectId', message: 'A valid Project ID is required to save tasks' }
      ]);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return sendError(res, 404, 'Target project not found', 'PROJECT_NOT_FOUND');
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return sendValidationError(res, [
        { field: 'tasks', message: 'An array of tasks to save is required' }
      ]);
    }

    // Format and validate task payloads
    const taskDocs = tasks.map((task) => ({
      title: (task.title || 'Untitled Task').trim().slice(0, 150),
      description: (task.description || '').trim().slice(0, 2000),
      projectId: project._id,
      assignedTo: task.assignedTo && mongoose.Types.ObjectId.isValid(task.assignedTo) ? task.assignedTo : null,
      status: ['todo', 'in-progress', 'done'].includes(task.status) ? task.status : 'todo',
      priority: ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium',
      dueDate: task.dueDate ? new Date(task.dueDate) : null
    }));

    const savedTasks = await Task.insertMany(taskDocs);

    return sendSuccess(res, 201, `Successfully saved ${savedTasks.length} task(s) to project "${project.name}"`, {
      projectId: project._id,
      projectName: project.name,
      savedCount: savedTasks.length,
      tasks: savedTasks
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/ai/productivity-suggestions
 * Return AI-driven productivity insights and scheduling suggestions
 */
const getProductivitySuggestionsHandler = async (req, res, next) => {
  try {
    const { projectId } = req.query;

    let filter = {};
    let projectName = 'All Projects';

    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return sendError(res, 404, 'Project not found', 'PROJECT_NOT_FOUND');
      }
      const project = await Project.findById(projectId);
      if (!project) {
        return sendError(res, 404, 'Project not found', 'PROJECT_NOT_FOUND');
      }
      filter.projectId = project._id;
      projectName = project.name;
    }

    const tasks = await Task.find(filter).populate('assignedTo', 'name email role');
    const result = generateProductivitySuggestions(tasks, projectName);

    return sendSuccess(res, 200, 'Productivity suggestions generated', result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  generateTasks,
  saveGeneratedTasks,
  getProductivitySuggestions: getProductivitySuggestionsHandler
};
