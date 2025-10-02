const fs = require('fs').promises; // Use a versão baseada em Promises do 'fs'
const path = require('path');
const db = require('../config/database');

async function initializeDatabase() {
  try {
    // Escolhe o arquivo de schema correto com base no ambiente
    const schemaFile = process.env.DATABASE_URL ? 'schema-postgres.sql' : 'schema-sqlite.sql';
    const schemaPath = path.join(__dirname, '..', 'database', schemaFile);
    
    console.log(`Lendo o schema de: ${schemaFile}`);
    const schemaSql = await fs.readFile(schemaPath, 'utf8');

    console.log('Executando script de inicialização do banco de dados...');
    // A função query já lida com a execução de scripts
    await db.query(schemaSql);
    
    console.log('Banco de dados inicializado com sucesso.');

  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
  } finally {
    // Se estivermos usando PostgreSQL, o pool gerencia as conexões, então não precisamos fechar.
    // Se for SQLite, precisamos garantir que a conexão feche.
    if (!process.env.DATABASE_URL && db.close) {
      db.close();
    }
  }
}

initializeDatabase();