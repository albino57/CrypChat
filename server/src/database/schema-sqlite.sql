-- Apaga as tabelas existentes para garantir um começo limpo
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS users;

-- Cria a tabela de usuários (sem alterações)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- Cria a tabela de mensagens
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    body TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL, 
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users (id),
    FOREIGN KEY (recipient_id) REFERENCES users (id)
);