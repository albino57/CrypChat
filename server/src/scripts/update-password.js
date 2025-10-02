const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function updatePassword() {
  const args = process.argv.slice(2);
  const username = args[0];
  const newPassword = args[1];

  if (!username || !newPassword) {
    console.error('Erro: Forneça um nome de usuário e uma NOVA senha.');
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(newPassword, salt);
  
  try {
    const sql = 'UPDATE users SET password = $1 WHERE username = $2';
    const result = await db.query(sql, [hashedPassword, username]);
    if (result.rowCount > 0) {
      console.log(`Senha do usuário '${username}' atualizada com sucesso.`);
    } else {
      console.log(`Usuário '${username}' não encontrado.`);
    }
  } catch (error) {
    console.error('Erro ao atualizar a senha:', error.message);
  }
}
updatePassword();