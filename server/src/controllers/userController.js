const db = require('../config/database');

exports.getAllUsers = async (req, res) => {
    try {
        // Pega todos os usuários, exceto o que está logado no momento
        const sql = 'SELECT id, username FROM users WHERE id != $1';
        
        const { rows } = await db.query(sql, [req.session.userId]);

        res.status(200).json(rows);

    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        return res.status(500).json({ message: 'Erro no servidor ao buscar usuários.' });
    }
};