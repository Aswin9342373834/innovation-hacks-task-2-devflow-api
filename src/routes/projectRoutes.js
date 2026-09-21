const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { validateCreateProject, validateUpdateProject } = require('../validators/projectValidator');

router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', validateCreateProject, projectController.createProject);
router.put('/:id', validateUpdateProject, projectController.updateProject);
router.patch('/:id', validateUpdateProject, projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
