const db = require('../config/database');

exports.getMessages = async (req, res) => {
    const { username: recipientUsername } = req.params;
    const { userId: currentUserId } = req.session;

    try {
        // Passo 1: Encontre o ID do destinatário a partir do username.
        const userSql = 'SELECT id FROM users WHERE username = $1';
        const userResult = await db.query(userSql, [recipientUsername]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Usuário destinatário não encontrado.' });
        }
        const recipientId = userResult.rows[0].id;

        // Passo 2: Com o ID em mãos, busque as mensagens trocadas entre os dois usuários.
        const messagesSql = `
            SELECT * FROM messages 
            WHERE (author_id = $1 AND recipient_id = $2) 
               OR (author_id = $2 AND recipient_id = $1) 
            ORDER BY created ASC`;
        
        const { rows } = await db.query(messagesSql, [currentUserId, recipientId]);

        res.status(200).json(rows);

    } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
        return res.status(500).json({ message: 'Erro no servidor.' });
    }
};