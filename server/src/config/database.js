// Este arquivo é o nosso "adaptador", ele decide qual banco de dados usar com base no ambiente.

// Se a variável DATABASE_URL (do Render) existir, use o plug do PostgreSQL
if (process.env.DATABASE_URL) {
  console.log("Ambiente de Produção detectado. Usando PostgreSQL.");
  module.exports = require('./db-postgres');
} 
// Senão, use o plug do SQLite para o desenvolvimento local
else {
  console.log("Ambiente de Desenvolvimento detectado. Usando SQLite.");
  module.exports = require('./db-sqlite');
}