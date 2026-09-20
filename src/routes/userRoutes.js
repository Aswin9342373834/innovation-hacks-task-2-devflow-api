const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateCreateUser } = require('../validators/userValidator');

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', validateCreateUser, userController.createUser);

module.exports = router;
