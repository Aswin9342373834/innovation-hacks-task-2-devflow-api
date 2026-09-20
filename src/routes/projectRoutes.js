const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { validateCreateProject } = require('../validators/projectValidator');

router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', validateCreateProject, projectController.createProject);

module.exports = router;
