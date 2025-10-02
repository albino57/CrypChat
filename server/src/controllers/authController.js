const db = require('../config/database');
const bcrypt = require('bcryptjs');

// --- FUNÇÃO DE REGISTRO ---
exports.register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Nome de usuário e senha são obrigatórios.' });
    }

    try {
        // Verifica se o usuário já existe
        const userCheck = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ message: 'Este nome de usuário já está em uso.' });
        }

        // Cria o hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insere o novo usuário no banco de dados
        const sql = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username';
        const result = await db.query(sql, [username, hashedPassword]);
        const newUser = result.rows[0];

        // Retorna uma resposta de sucesso
        return res.status(201).json({ message: 'Usuário criado com sucesso!', user: newUser });

    } catch (error) {
        console.error("Erro durante o registro:", error);
        return res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// --- FUNÇÃO DE LOGIN ---
exports.login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });
    }
    try {
        const sql = 'SELECT * FROM users WHERE username = $1';
        const { rows } = await db.query(sql, [username]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Usuário ou senha inválido!' });
        }
        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

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
    } catch (error) {
        console.error("Erro durante o login:", error);
        return res.status(500).json({ message: 'Erro no servidor.' });
    }
};

// --- FUNÇÃO DE LOGOUT (SEM MUDANÇAS) ---
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Não foi possível fazer logout.' });
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Logout bem-sucedido.' });
    });
};