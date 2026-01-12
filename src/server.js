// src/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

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

// --- Swagger ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
console.log('📚 Swagger disponible en: http://localhost:3000/api-docs');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const chatRoutes = require('./routes/chatRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/orders', orderRoutes);


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
  const userId = socket.user.id;
  const userRole = socket.user.role;
  
  console.log(`Socket conectado: ${socket.user.username} (${userRole})`);
  
  // Usuario se une a su sala personal
  socket.join(`user:${userId}`);
  
  // Admin se une a sala de admins
  if (userRole === 'admin') {
    socket.join('admins');
  }

  // Evento: envío de mensaje (usuario o admin)
  // Para usuario: crea/usa su propio chat único.
  // Para admin: requiere chatId del chat del usuario destino. Nunca crea chat para el admin.
  socket.on('chat:send', async (data) => {
    try {
      const Chat = require('./models/Chat');
      const { content, chatId } = data;
      if (!content || !content.trim()) return;

      let chat;
      if (userRole === 'user') {
        // Buscar o crear chat del usuario autenticado
        chat = await Chat.findOne({ user: userId });
        if (!chat) chat = new Chat({ user: userId });
      } else if (userRole === 'admin') {
        // Admin debe indicar el chat objetivo
        if (!chatId) return; // Falta chatId -> ignorar
        chat = await Chat.findById(chatId);
        if (!chat) return; // Chat inexistente
        if (chat.status === 'closed') return; // No enviar a chats cerrados
      }

      const message = {
        sender: userId,
        senderRole: userRole,
        content: content.trim(),
        read: false
      };

      chat.messages.push(message);
      chat.lastMessage = new Date();

      // Incrementar contador solo si mensaje proviene del usuario (admin responde no incrementa)
      if (userRole === 'user') {
        chat.unreadCount = (chat.unreadCount || 0) + 1;
      }

      await chat.save();

      await chat.populate('user', 'username email');
      await chat.populate('messages.sender', 'username role');
      const lastMsg = chat.messages[chat.messages.length - 1];

      // Emitir al remitente (para que actualice su vista inmediatamente)
      socket.emit('chat:message', lastMsg);

      if (userRole === 'user') {
        // Notificar a admins nuevo mensaje de usuario
        io.to('admins').emit('chat:newMessage', {
          chatId: chat._id,
          message: lastMsg,
          user: chat.user
        });
      } else if (userRole === 'admin') {
        // Enviar mensaje al usuario específico
        io.to(`user:${chat.user._id}`).emit('chat:message', lastMsg);
      }
    } catch (err) {
      console.error('Error en chat:send:', err);
      socket.emit('chat:error', { error: 'Error al enviar mensaje' });
    }
  });

  // Admin marca mensajes como leídos
  socket.on('chat:markRead', async (chatId) => {
    try {
      if (userRole !== 'admin') return;
      
      const Chat = require('./models/Chat');
      const chat = await Chat.findById(chatId);
      if (!chat) return;
      
      chat.messages.forEach(msg => {
        if (msg.senderRole === 'user') msg.read = true;
      });
      chat.unreadCount = 0;
      await chat.save();
      
      socket.emit('chat:markedRead', { chatId });
    } catch (err) {
      console.error('Error en chat:markRead:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket desconectado: ${socket.user.username}`);
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
