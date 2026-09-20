const store = require('../data/store');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/users
 * Retrieve all registered users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = store.getUsers();
    return sendSuccess(res, 200, 'Users retrieved successfully', users);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/users/:id
 * Retrieve a specific user by ID
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = store.getUserById(id);

    if (!user) {
      return sendError(res, 404, 'User not found', 'USER_NOT_FOUND');
    }

    return sendSuccess(res, 200, 'User retrieved successfully', user);
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/users
 * Create a new user
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    // Check for duplicate email
    const existingUser = store.getUserByEmail(email);
    if (existingUser) {
      return sendError(res, 409, 'A user with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const newUser = store.addUser({ name, email, role });
    return sendSuccess(res, 201, 'User created successfully', newUser);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser
};
