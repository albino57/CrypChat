const db = require('../config/database');

const activeUsers = {}; // { userId: socketId }

module.exports = function(io) {
  io.on('connection', (socket) => {
    const session = socket.request.session;
    const userId = session.userId;
    const username = session.username;

    if (userId) {
      console.log(`[Socket CONNECT] Usuário '${username}' (ID: ${userId}) conectou com o Socket ID: ${socket.id}`);
      activeUsers[userId] = socket.id;
    } else {
      console.log(`[Socket CONNECT] Um cliente não autenticado conectou com o Socket ID: ${socket.id}`);
    }

    socket.on('disconnect', () => {
      if (userId) {
        console.log(`[Socket DISCONNECT] Usuário '${username}' (ID: ${userId}) desconectou.`);
        delete activeUsers[userId];
      } else {
        console.log(`[Socket DISCONNECT] Cliente não autenticado desconectou.`);
      }
    });

    socket.on('send_private_message', async (data) => {
      console.log("\n--- NOVO EVENTO: send_private_message ---");
      console.log("[Dados Recebidos]:", data);

      const { recipient_id, body } = data;
      const author_id = session.userId;

      console.log(`[Verificação]: Remetente (author_id da sessão): ${author_id}`);

      if (!author_id) {
        console.error("[ERRO]: Tentativa de envio de mensagem sem author_id na sessão. Abortando.");
        return;
      }
      
      try {
        console.log("[Ação]: Tentando salvar a mensagem no banco de dados...");
        const sql = 'INSERT INTO messages (author_id, recipient_id, body) VALUES ($1, $2, $3) RETURNING id, created';
        const result = await db.query(sql, [author_id, recipient_id, body]);
        
        console.log(`[Sucesso no DB]: Mensagem salva com ID: ${result.rows[0].id}`);
        
        const newMessage = {
          id: result.rows[0].id,
          author_id,
          recipient_id,
          body,
          created: result.rows[0].created,
        };

        const recipientSocketId = activeUsers[recipient_id];
        console.log(`[Distribuição]: Procurando Socket ID para o destinatário (ID: ${recipient_id}). Encontrado: ${recipientSocketId}`);

        if (recipientSocketId) {
          console.log(`[Distribuição]: Enviando mensagem para o destinatário (Socket ID: ${recipientSocketId})`);
          io.to(recipientSocketId).emit('receive_message', newMessage);
        }
        
        console.log(`[Distribuição]: Enviando cópia da mensagem para o remetente (Socket ID: ${socket.id})`);
        io.to(socket.id).emit('receive_message', newMessage);
        console.log("--- FIM DO EVENTO ---");
      } catch (error) {
        console.error("Erro ao processar send_private_message:", error);
      }
    });
  });
};