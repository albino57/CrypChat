// src/scripts/init-db.js
const fs = require('fs');
const path = require('path');
const db = require('../config/database'); // Importa nossa conexão

// Caminho para o arquivo schema.sql
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

// Executa os comandos SQL
db.exec(schemaSql, (err) => {
    if (err) {
        console.error('Erro ao inicializar o banco de dados:', err.message);
    } else {
        console.log('Banco de dados inicializado com sucesso.');
    }
    // Fecha a conexão com o banco
    db.close();
});