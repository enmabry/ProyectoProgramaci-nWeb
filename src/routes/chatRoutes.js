const { Router } = require('express');
const Chat = require('../models/Chat');
const { authenticateJWT, authorizeRoles } = require('../middleware/authenticateJWT');

const router = Router();

/**
 * @swagger
 * /api/chats/me:
 *   get:
 *     summary: Obtener chat del usuario autenticado
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat del usuario
 *       400:
 *         description: Error al obtener chat
 */
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

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Obtener todos los chats (solo admin)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de chats activos
 *       401:
 *         description: No autorizado
 */
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

/**
 * @swagger
 * /api/chats/{id}:
 *   get:
 *     summary: Obtener chat específico (solo admin)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID del chat
 *     responses:
 *       200:
 *         description: Chat encontrado
 *       404:
 *         description: Chat no encontrado
 */
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

/**
 * @swagger
 * /api/chats/{id}/close:
 *   patch:
 *     summary: Cerrar chat (solo admin)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID del chat
 *     responses:
 *       200:
 *         description: Chat cerrado correctamente
 *       404:
 *         description: Chat no encontrado
 */
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

/**
 * @swagger
 * /api/chats/{id}:
 *   delete:
 *     summary: Eliminar chat (solo admin)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID del chat a eliminar
 *     responses:
 *       200:
 *         description: Chat eliminado correctamente
 *       404:
 *         description: Chat no encontrado
 *       401:
 *         description: No autorizado
 */
// DELETE /api/chats/:id - Admin: eliminar chat
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.id);
    
    if (!chat) return res.status(404).json({ error: 'Chat no encontrado' });
    
    res.json({ message: 'Chat eliminado correctamente' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
