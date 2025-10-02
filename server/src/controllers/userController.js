const db = require('../config/database');

exports.getAllUsers = (req, res) => {
  // Pega todos os usuários, exceto o que está logado no momento
  const sql = 'SELECT id, username FROM users WHERE id != ?';

  db.all(sql, [req.session.userId], (err, users) => {
    if (err) {
      return res.status(500).json({ message: 'Erro no servidor ao buscar usuários.' });
    }
    res.status(200).json(users);
  });
};