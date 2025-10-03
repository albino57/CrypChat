require('dotenv').config();
const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
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

const sessionMiddleware = session({
    store: new FileStore({ path: path.join(__dirname, '..', 'sessions'), logFn: function() {} }),
    secret: process.env.SESSION_SECRET || 'uma-chave-secreta-de-desenvolvimento',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24,
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