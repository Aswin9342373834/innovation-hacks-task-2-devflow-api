const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * POST /api/auth/register
 * Register a new user with hashed password and return JWT token
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return sendError(res, 409, 'A user with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    // Hash password with bcryptjs
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      role: role || 'developer',
      passwordHash
    });

    // Generate JWT token
    const token = generateToken({
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role
    });

    return sendSuccess(res, 201, 'User registered successfully', {
      user: newUser,
      token
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticate user with email & password, return JWT token
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return sendError(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (!user.passwordHash) {
      return sendError(res, 401, 'This account was created without a password. Please contact administrator or re-register.', 'NO_PASSWORD_SET');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Generate JWT token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    return sendSuccess(res, 200, 'Login successful', {
      user,
      token
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/auth/me
 * Return current authenticated user profile
 */
const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'Profile retrieved successfully', req.user);
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/auth/logout
 * Client-side logout acknowledgment
 */
const logout = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout
};
