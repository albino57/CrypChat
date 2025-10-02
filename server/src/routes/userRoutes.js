const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Aplica o middleware 'isAuthenticated' a esta rota.
// O usuário só conseguirá acessar /api/users se estiver logado.
router.get('/', isAuthenticated, userController.getAllUsers);

module.exports = router;