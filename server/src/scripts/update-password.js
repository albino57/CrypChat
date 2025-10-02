// src/scripts/update-password.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');

const args = process.argv.slice(2);
const username = args[0];
const newPassword = args[1];

if (!username || !newPassword) {
    console.error('Erro: Por favor, forneça um nome de usuário e uma NOVA senha.');
    process.exit(1);
}

const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync(newPassword, salt);

// O comando SQL UPDATE atualiza um registro existente
// SET password = ? -> define a nova senha
// WHERE username = ? -> especifica qual usuário deve ser atualizado
const sql = 'UPDATE users SET password = ? WHERE username = ?';

db.run(sql, [hashedPassword, username], function(err) {
    if (err) {
        console.error('Erro ao atualizar a senha:', err.message);
    } else {
        // A propriedade 'this.changes' nos diz quantas linhas foram afetadas.
        // Se for 0, significa que nenhum usuário com aquele nome foi encontrado.
        if (this.changes > 0) {
            console.log(`Senha do usuário '${username}' atualizada com sucesso.`);
        } else {
            console.log(`Usuário '${username}' não encontrado.`);
        }
    }
    
    db.close();
});