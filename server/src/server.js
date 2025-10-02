require('dotenv').config();
const express = require('express'); // AQUI ESTÁ A CORREÇÃO
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors'); //Importe o pacote cors

const app = express();
const server = http.createServer(app);

//Defina o endereço do seu frontend a partir da variável de ambiente
const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";

//CORS para o Express e para o Socket.IO
const corsOptions = {
  origin: frontendURL,
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions
});

const PORT = process.env.PORT || 3001;

//Middleware do CORS no Express
app.use(cors(corsOptions));

const sessionMiddleware = session({
    store: new FileStore({ path: path.join(__dirname, '..', 'sessions'), logFn: function() {} }),
    secret: process.env.SESSION_SECRET || 'uma-chave-secreta-de-desenvolvimento',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
});
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Lógica do Socket
require('./sockets/socketManager')(io);

server.listen(PORT, () => {
    console.log(`Servidor rodando e ouvindo na porta ${PORT}`);
});