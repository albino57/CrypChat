// src/scripts/update-password.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');

const args = process.argv.slice(2);
const username = args[0];
const newUser = args[1];

if (!username || !newUser) {
    console.error('Erro: Por favor, forneça um NOVO nome de usuário.');
    process.exit(1);
}

// O comando SQL UPDATE atualiza um registro existente
// SET username = ? -> define o novo nome usuário
// WHERE username = ? -> especifica qual usuário deve ser atualizado
const sql = 'UPDATE users SET username = ? WHERE username = ?';

db.run(sql, [newUser, username], function(err) {
    if (err) {
        console.error('Erro ao atualizar o nome de usuário:', err.message);
    } else {
        // A propriedade 'this.changes' nos diz quantas linhas foram afetadas.
        // Se for 0, significa que nenhum usuário com aquele nome foi encontrado.
        if (this.changes > 0) {
            console.log(`Novo nome de usuário '${newUser}' atualizado com sucesso.`);
        } else {
            console.log(`Usuário '${username}' não encontrado.`);
        }
    }
    
    db.close();
});