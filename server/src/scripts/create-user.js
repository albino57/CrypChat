const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function createUser() {
  const args = process.argv.slice(2);
  const username = args[0];
  const password = args[1];

  if (!username || !password) {
    console.error('Erro: Por favor, forneça um nome de usuário e uma senha.');
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  try {
    const sql = 'INSERT INTO users (username, password) VALUES ($1, $2)';
    await db.query(sql, [username, hashedPassword]);
    console.log(`Usuário '${username}' criado com sucesso.`);
  } catch (error) {
    if (error.code === '23505') { // Código de erro de violação de unicidade do PostgreSQL
      console.error(`Erro: O usuário '${username}' já existe.`);
    } else {
      console.error('Erro ao criar usuário:', error.message);
    }
  }
}

createUser();