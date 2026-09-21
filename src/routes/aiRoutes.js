const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/authMiddleware');

// AI routes (optionalAuth allows both authenticated and guest experimentation)
router.post('/generate-tasks', optionalAuth, aiController.generateTasks);
router.post('/save-tasks', optionalAuth, aiController.saveGeneratedTasks);
router.get('/productivity-suggestions', optionalAuth, aiController.getProductivitySuggestions);

module.exports = router;
