const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');
const { sendSuccess } = require('./utils/response');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root welcome endpoint
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Welcome to DevFlow API',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  return sendSuccess(res, 200, 'Task 2 API is running', {
    environment: process.env.NODE_ENV || 'development'
  });
});

// Resource routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// 404 Fallback Middleware
app.use(notFoundMiddleware);

// Centralized Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
