const db = require('../config/database');
const bcrypt = require('bcryptjs');

exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, user) => {
        if (err) return res.status(500).json({ message: 'Erro no servidor.' });
        if (!user) return res.status(401).json({ message: 'Usuário ou senha inválido!' });

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Erro ao verificar senha.' });
            
            if (isMatch) {
                req.session.userId = user.id;
                req.session.username = user.username;
                return res.status(200).json({
                    message: 'Login bem-sucedido!',
                    user: { id: user.id, username: user.username }
                });
            } else {
                return res.status(401).json({ message: 'Usuário ou senha inválido!' });
            }
        });
    });
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: 'Não foi possível fazer logout.' });
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Logout bem-sucedido.' });
    });
};