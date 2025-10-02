-- Apaga as tabelas existentes para garantir um começo limpo
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS users;

-- Cria a tabela de usuários (sem alterações)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- Cria a tabela de mensagens
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    body TEXT NOT NULL,
    author_id INTEGER NOT NULL REFERENCES users(id),
    recipient_id INTEGER NOT NULL REFERENCES users(id),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);