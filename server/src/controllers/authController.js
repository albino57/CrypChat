const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Usamos 'async' porque agora vamos usar 'await' para a consulta ao banco de dados
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }

    try {
        // A sintaxe SQL para PostgreSQL usa $1, $2, etc. em vez de ?. E o adaptador SQLite foi feito para entender isso também.
        const sql = 'SELECT * FROM users WHERE username = $1';
        const { rows } = await db.query(sql, [username]);

        // Se a busca não retornar nenhuma linha (rows.length === 0), o usuário não existe.
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Usuário ou senha inválido!' });
        }
        
        const user = rows[0];

        // Compara a senha enviada com o hash salvo no banco
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (isMatch) {
            // Senha correta! Armazena dados na sessão.
            req.session.userId = user.id;
            req.session.username = user.username;
            
            // Envia uma resposta de sucesso com os dados do usuário
            return res.status(200).json({ 
                message: 'Login bem-sucedido!',
                user: { id: user.id, username: user.username }
            });
        } else {
            // Senha incorreta
            return res.status(401).json({ message: 'Usuário ou senha inválido!' });
        }
    } catch (error) {
        console.error("Erro durante o login:", error);
        return res.status(500).json({ message: 'Erro no servidor.' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Não foi possível fazer logout.' });
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Logout bem-sucedido.' });
    });
};