require('dotenv').config();
const express = require('express'); // AQUI ESTÁ A CORREÇÃO
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');
const fs = require('fs').promises;
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

const isProduction = process.env.NODE_ENV === 'production';

const sessionMiddleware = session({
    store: new FileStore({ path: path.join(__dirname, '..', 'sessions'), logFn: function() {} }),
    secret: process.env.SESSION_SECRET || 'uma-chave-secreta-de-desenvolvimento',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24,
        //Configurações cruciais para o cookie funcionar em produção (cross-domain)
        secure: isProduction, //Em produção, o cookie só será enviado via HTTPS
        sameSite: isProduction ? 'none' : 'lax' //Permite o envio do cookie de um domínio diferente
    }
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

// ROTA SECRETA DE ADMIN PARA INICIALIZAR O BANCO DE DADOS NA PRODUÇÃO
app.get('/admin/init-db/:secret', async (req, res) => {
    // Compara a senha da URL com a variável de ambiente
    if (req.params.secret !== process.env.ADMIN_SECRET) {
        return res.status(401).send('Acesso não autorizado.');
    }
    try {
        // Usa o schema do PostgreSQL, pois esta rota só será usada na produção
        const schemaPath = path.join(__dirname, 'database', 'schema-postgres.sql');
        const schemaSql = await fs.readFile(schemaPath, 'utf8');
        const db = require('./config/database'); // Importa nosso adaptador
        
        await db.query(schemaSql); // Executa o script de criação das tabelas
        
        res.status(200).send('Banco de dados de produção inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar o banco de produção:', error);
        res.status(500).send('Erro ao inicializar o banco: ' + error.message);
    }
});

server.listen(PORT, () => {
    console.log(`Servidor rodando e ouvindo na porta ${PORT}`);
});