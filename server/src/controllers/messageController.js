const db = require('../config/database');

exports.getMessages = (req, res) => {
  const recipientUsername = req.params.username;
  const currentUserId = req.session.userId;

  // Verifique se a sessão do usuário existe
  if (!currentUserId) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  db.get('SELECT id FROM users WHERE username = ?', [recipientUsername], (err, recipient) => {
    if (err) {
      console.error("Erro no DB ao buscar destinatário:", err);
      return res.status(500).json({ message: 'Erro no servidor.' });
    }
    
    // ESTA É A CORREÇÃO MAIS IMPORTANTE
    // Se o usuário 'recipient' não for encontrado no banco, o código para aqui.
    if (!recipient) {
      return res.status(404).json({ message: 'Usuário destinatário não encontrado.' });
    }

    const recipientId = recipient.id;

    const sql = `
      SELECT * FROM messages 
      WHERE (author_id = ? AND recipient_id = ?) 
         OR (author_id = ? AND recipient_id = ?) 
      ORDER BY created ASC`;
    
    db.all(sql, [currentUserId, recipientId, recipientId, currentUserId], (err, messages) => {
      if (err) {
        console.error("Erro no DB ao buscar mensagens:", err);
        return res.status(500).json({ message: 'Erro ao buscar mensagens.' });
      }
      res.status(200).json(messages);
    });
  });
};