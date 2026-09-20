const store = require('../data/store');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/projects
 * Retrieve all projects
 */
const getAllProjects = async (req, res, next) => {
  try {
    const projects = store.getProjects();
    return sendSuccess(res, 200, 'Projects retrieved successfully', projects);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/projects/:id
 * Retrieve a single project by ID
 */
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = store.getProjectById(id);

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
 * Create a new project
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description, ownerId, status, progress } = req.body;

    // Check if referenced owner user exists
    const owner = store.getUserById(ownerId);
    if (!owner) {
      return sendError(res, 404, `Referenced owner user with ID '${ownerId}' does not exist`, 'OWNER_NOT_FOUND');
    }

    const newProject = store.addProject({
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

module.exports = {
  getAllProjects,
  getProjectById,
  createProject
};
