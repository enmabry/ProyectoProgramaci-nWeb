// src/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const { MONGO_URI, PORT = 3000, JWT_SECRET = 'dev' } = process.env;

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET','POST','PUT','DELETE'] } });

// --- DB ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => { console.error('Error DB:', err.message); process.exit(1); });

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(require('path').join(__dirname, 'public')));

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);


// --- Rutas de prueba ---
app.get('/api/health', (req, res) => res.json({ ok: true }));

// --- Auth en sockets ---
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    socket.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    next(new Error('Token inválido'));
  }
});

io.on('connection', (socket) => {
  console.log('Socket conectado:', socket.user?.username || socket.user?.id);
  socket.on('chat:message', (text) => {
    io.emit('chat:message', { user: socket.user.username, text, ts: Date.now() });
  });
});

// --- Inicio servidor con fallback de puerto ---
let currentPort = parseInt(PORT, 10);
function attemptListen() {
  server.listen(currentPort, () => console.log(`Server on http://localhost:${currentPort}`));
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`Puerto ${currentPort} en uso, probando ${currentPort + 1}...`);
    currentPort += 1; // incrementa puerto y reintenta
    setTimeout(attemptListen, 250);
  } else {
    console.error('Error al iniciar servidor:', err);
    process.exit(1);
  }
});

attemptListen();
