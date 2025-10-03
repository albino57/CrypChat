-- Apaga as tabelas existentes para garantir um começo limpo
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS "user_sessions";

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

-- Tabela para armazenar as sessões (connect-pg-simple)
CREATE TABLE "user_sessions" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "user_sessions" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX "IDX_session_expire" ON "user_sessions" ("expire");