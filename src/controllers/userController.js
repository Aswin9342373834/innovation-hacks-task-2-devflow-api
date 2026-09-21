const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/users
 * Retrieve all registered users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 404, 'User not found', 'USER_NOT_FOUND');
    }

    const user = await User.findById(id);
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
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 409, 'A user with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const newUser = await User.create({ name, email, role });
    return sendSuccess(res, 201, 'User created successfully', newUser);
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/users/:id or PATCH /api/users/:id
 * Update user details
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 404, 'User not found', 'USER_NOT_FOUND');
    }

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 404, 'User not found', 'USER_NOT_FOUND');
    }

    const { name, email, role } = req.body;

    // If changing email, ensure new email is not already registered by another user
    if (email && email.toLowerCase() !== user.email) {
      const emailInUse = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id }
      });
      if (emailInUse) {
        return sendError(res, 409, 'A user with this email already exists', 'EMAIL_ALREADY_EXISTS');
      }
      user.email = email;
    }

    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;

    await user.save();
    return sendSuccess(res, 200, 'User updated successfully', user);
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Delete a user and safely clean up references
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 404, 'User not found', 'USER_NOT_FOUND');
    }

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 404, 'User not found', 'USER_NOT_FOUND');
    }

    // Safely unassign user from active tasks without deleting tasks
    await Task.updateMany({ assignedTo: id }, { $set: { assignedTo: null } });

    await User.findByIdAndDelete(id);
    return sendSuccess(res, 200, 'User deleted successfully', { id });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
