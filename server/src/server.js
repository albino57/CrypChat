require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session); //novo gerenciador
const db = require('./config/database'); //adaptador de DB
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.set('trust proxy', 1); // Confia no proxy do Render

const server = http.createServer(app);

const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";

const corsOptions = {
  origin: frontendURL,
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions
});

const PORT = process.env.PORT || 3001;

app.use(cors(corsOptions));

const isProduction = process.env.NODE_ENV === 'production';

//Configura o sessionMiddleware para usar o banco de dados
const sessionMiddleware = session({
    store: new pgSession({
        pool: db.pool, //Usa o pool de conexão do banco PostgreSQL
        tableName: 'user_sessions' //Nome da tabela que ele vai criar automaticamente
    }),
    secret: process.env.SESSION_SECRET || 'uma-chave-secreta-de-desenvolvimento',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
    }
});
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);


// ROTA SECRETA DE ADMIN PARA INICIALIZAR O BANCO DE DADOS NA PRODUÇÃO
const fs = require('fs').promises;
app.get('/admin/init-db/:secret', async (req, res) => {
    if (req.params.secret !== process.env.ADMIN_SECRET) {
        return res.status(401).send('Acesso não autorizado.');
    }
    try {
        const schemaPath = path.join(__dirname, 'database', 'schema-postgres.sql');
        const schemaSql = await fs.readFile(schemaPath, 'utf8');
        const db = require('./config/database');
        await db.query(schemaSql);
        res.status(200).send('Banco de dados de produção inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar o banco de produção:', error);
        res.status(500).send('Erro ao inicializar o banco: ' + error.message);
    }
});

require('./sockets/socketManager')(io);

server.listen(PORT, () => {
    console.log(`Servidor rodando e ouvindo na porta ${PORT}`);
});