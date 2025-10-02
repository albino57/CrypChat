// src/scripts/create-user.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Pegamos os argumentos da linha de comando.
// process.argv[0] é o node, process.argv[1] é o script, 
// então os nossos argumentos começam no índice 2.
const args = process.argv.slice(2);
const username = args[0];
const password = args[1];

if (!username || !password) {
    console.error('Erro: Por favor, forneça um nome de usuário e uma senha.');
    process.exit(1); // Sai do script com um código de erro
}

// O 'salt' é um fator de aleatoriedade para o hash. 10 é um bom valor padrão.
const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync(password, salt);

const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';

db.run(sql, [username, hashedPassword], function(err) {
    if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            console.error(`Erro: O usuário '${username}' já existe.`);
        } else {
            console.error('Erro ao criar usuário:', err.message);
        }
    } else {
        console.log(`Usuário '${username}' criado com sucesso com o ID: ${this.lastID}`);
    }
    
    // Fecha a conexão com o banco
    db.close();
});