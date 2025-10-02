const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '..', '..', 'db', 'cripchat.sqlite');

const db = new sqlite3.Database(dbPath, err => {
  if (err) {
    console.error("Erro ao abrir banco de dados SQLite:", err.message);
  }
});

module.exports = {
  // A nova função query "inteligente"
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      // Se o SQL tiver múltiplos comandos (como nosso schema.sql), use db.exec
      if (sql.includes(';')) {
        db.exec(sql, function(err) {
          if (err) return reject(err);
          // db.exec não retorna linhas, então resolvemos com um resultado padrão
          resolve({ rows: [], rowCount: this.changes }); 
        });
      } 
      // Se for um SELECT
      else if (sql.trim().toUpperCase().startsWith('SELECT')) {
        db.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve({ rows });
        });
      } else {
        db.run(sql, params, function (err) {
          if (err) return reject(err);
          const lastID = this.lastID;
          db.get('SELECT * FROM messages WHERE id = ?', lastID, (err, row) => {
              if (err) return reject(err);
              resolve({ rows: row ? [row] : [], rowCount: this.changes });
          });
        });
      }
    });
  },
  // Adicionamos uma função close para ser usada pelos scripts
  close: () => {
    db.close(err => {
      if (err) {
        console.error("Erro ao fechar banco de dados SQLite:", err.message);
      }
    });
  }
};