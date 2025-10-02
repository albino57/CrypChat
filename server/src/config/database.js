// src/config/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// O caminho para o nosso arquivo de banco de dados.
// Ele será criado na raiz da pasta 'server', em uma pasta 'db'.
const dbPath = path.resolve(__dirname, '..', '..', 'db', 'cripchat.sqlite');

// Cria e exporta uma nova instância da conexão com o banco.
// Qualquer arquivo que precisar interagir com o banco vai importar este 'db'.
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

module.exports = db;