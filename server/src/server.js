require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const db = require('./config/database');
const path = require('path');
const fs = require('fs').promises;
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.set('trust proxy', 1);

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//ROTA DE ADMIN VEM PRIMEIRO, ANTES DA SESSÃO!
app.get('/admin/init-db/:secret', async (req, res) => {
    if (req.params.secret !== process.env.ADMIN_SECRET) {
        return res.status(401).send('Acesso não autorizado.');
    }
    try {
        const schemaPath = path.join(__dirname, 'database', 'schema-postgres.sql');
        const schemaSql = await fs.readFile(schemaPath, 'utf8');
        await db.query(schemaSql);
        res.status(200).send('Banco de dados de produção inicializado com sucesso! Você já pode fechar esta aba.');
    } catch (error) {
        console.error('Erro ao inicializar o banco de produção:', error);
        res.status(500).send('Erro ao inicializar o banco: ' + error.message);
    }
});

//AGORA INICIAMOS A SESSÃO PARA TODAS AS OUTRAS ROTAS
const isProduction = process.env.NODE_ENV === 'production';
const sessionMiddleware = session({
    store: new pgSession({
        pool: db.pool,
        tableName: 'user_sessions'
    }),
    secret: process.env.SESSION_SECRET || 'uma-chave-secreta-de-desenvolvimento',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        domain: isProduction ? '.onrender.com' : undefined
    }
});
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

//ROTAS PRINCIPAIS DA APLICAÇÃO
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

require('./sockets/socketManager')(io);

server.listen(PORT, () => {
    console.log(`Servidor rodando e ouvindo na porta ${PORT}`);
});