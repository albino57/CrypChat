const db = require('../config/database');

async function updateUser() {
  const args = process.argv.slice(2);
  const currentUsername = args[0];
  const newUsername = args[1];

  if (!currentUsername || !newUsername) {
    console.error('Erro: Forneça o nome de usuário ATUAL e o NOVO nome de usuário.');
    return;
  }
  
  try {
    const sql = 'UPDATE users SET username = $1 WHERE username = $2';
    const result = await db.query(sql, [newUsername, currentUsername]);
    if (result.rowCount > 0) {
      console.log(`Nome de usuário '${currentUsername}' atualizado para '${newUsername}' com sucesso.`);
    } else {
      console.log(`Usuário '${currentUsername}' não encontrado.`);
    }
  } catch (error) {
    console.error('Erro ao atualizar o nome de usuário:', error.message);
  }
}
updateUser();