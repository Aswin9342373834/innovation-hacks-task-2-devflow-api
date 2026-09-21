const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/projects
 * Retrieve all projects with populated owner information
 */
const getAllProjects = async (req, res, next) => {
  try {
    const { ownerId, status } = req.query;
    const filter = {};

    if (ownerId) {
      if (mongoose.Types.ObjectId.isValid(ownerId)) {
        filter.ownerId = ownerId;
      } else {
        filter.ownerId = new mongoose.Types.ObjectId(); // matches nothing
      }
    }

    if (status) {
      filter.status = status;
    }

    const projects = await Project.find(filter)
      .populate('ownerId', 'name email role')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Projects retrieved successfully', projects);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/projects/:id
 * Retrieve a single project by ID with populated owner information
 */
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 404, 'Project not found', 'PROJECT_NOT_FOUND');
    }

    const project = await Project.findById(id).populate('ownerId', 'name email role');
    if (!project) {
      return sendError(res, 404, 'Project not found', 'PROJECT_NOT_FOUND');
    }

    return sendSuccess(res, 200, 'Project retrieved successfully', project);
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/projects
 * Create a new project after validating owner user reference exists
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description, ownerId, status, progress } = req.body;

    // Check if referenced owner user exists
    const isValidOwnerId = mongoose.Types.ObjectId.isValid(ownerId);
    const owner = isValidOwnerId ? await User.findById(ownerId) : null;

    if (!owner) {
      return sendError(
        res,
        404,
        `Referenced owner user with ID '${ownerId}' does not exist`,
        'OWNER_NOT_FOUND'
      );
    }

    const newProject = await Project.create({
      name,
      description,
      ownerId,
      status,
      progress
    });

    return sendSuccess(res, 201, 'Project created successfully', newProject);
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/projects/:id or PATCH /api/projects/:id
 * Update project details
 */
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 404, 'Project not found', 'PROJECT_NOT_FOUND');
    }

    const project = await Project.findById(id);
    if (!project) {
      return sendError(res, 404, 'Project not found', 'PROJECT_NOT_FOUND');
    }

    const { name, description, ownerId, status, progress } = req.body;

    // If ownerId is updated, verify new owner exists
    if (ownerId !== undefined) {
      const isValidOwnerId = mongoose.Types.ObjectId.isValid(ownerId);
      const owner = isValidOwnerId ? await User.findById(ownerId) : null;
      if (!owner) {
        return sendError(
          res,
          404,
          `Referenced owner user with ID '${ownerId}' does not exist`,
          'OWNER_NOT_FOUND'
        );
      }
      project.ownerId = ownerId;
    }

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (progress !== undefined) project.progress = progress;

    await project.save();
    return sendSuccess(res, 200, 'Project updated successfully', project);
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/projects/:id
 * Delete a project and safely clean up associated tasks belonging to this project
 */
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 404, 'Project not found', 'PROJECT_NOT_FOUND');
    }

    const project = await Project.findById(id);
    if (!project) {
      return sendError(res, 404, 'Project not found', 'PROJECT_NOT_FOUND');
    }

    // Safe relational cleanup: delete tasks specifically belonging to this project
    const deletedTasksResult = await Task.deleteMany({ projectId: id });

    await Project.findByIdAndDelete(id);

    return sendSuccess(res, 200, 'Project deleted successfully', {
      id,
      deletedTasksCount: deletedTasksResult.deletedCount
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
