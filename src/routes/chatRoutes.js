const { Router } = require('express');
const Chat = require('../models/Chat');
const { authenticateJWT, authorizeRoles } = require('../middleware/authenticateJWT');

const router = Router();

// GET /api/chats/me - Obtener chat del usuario autenticado
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    let chat = await Chat.findOne({ user: req.user.id })
      .populate('user', 'username email')
      .populate('messages.sender', 'username role');
    
    if (!chat) {
      // Crear chat vacío si no existe
      chat = await Chat.create({ user: req.user.id });
      await chat.populate('user', 'username email');
    }
    
    res.json(chat);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/chats - Admin: obtener todos los chats
router.get('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const chats = await Chat.find({ status: 'active' })
      .populate('user', 'username email')
      .populate('messages.sender', 'username role')
      .sort({ lastMessage: -1 });
    
    res.json(chats);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/chats/:id - Admin: obtener chat específico
router.get('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('user', 'username email')
      .populate('messages.sender', 'username role');
    
    if (!chat) return res.status(404).json({ error: 'Chat no encontrado' });
    
    res.json(chat);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PATCH /api/chats/:id/close - Admin: cerrar chat
router.patch('/:id/close', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true }
    );
    
    if (!chat) return res.status(404).json({ error: 'Chat no encontrado' });
    
    res.json(chat);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
