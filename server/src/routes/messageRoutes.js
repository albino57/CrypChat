const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// A rota GET para /api/messages/:username buscará o histórico
// :username é um parâmetro dinâmico que conterá o nome do contato clicado
router.get('/:username', isAuthenticated, messageController.getMessages);

module.exports = router;