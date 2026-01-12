const { Router } = require('express');
const User = require('../models/User');
const { authenticateJWT, authorizeRoles } = require('../middleware/authenticateJWT');

const router = Router();

// ============================================
// CRUD DE USUARIOS - SOLO ADMINISTRADORES
// ============================================

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar todos los usuarios (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: ['user', 'admin'] }
 *         description: Filtrar por rol
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Buscar por username o email
 *       - in: query
 *         name: page
 *         schema: { type: number, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: number, default: 10 }
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No es administrador
 */
router.get('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    
    // Construir filtro
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Paginar
    const skip = (page - 1) * limit;
    const users = await User.find(filter)
      .select('-password -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message, code: 'LIST_USERS_ERROR' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: No es administrador
 */
router.get('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil');
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado', code: 'USER_NOT_FOUND' });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message, code: 'GET_USER_ERROR' });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear nuevo usuario (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               role: { type: string, enum: ['user', 'admin'], default: 'user' }
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos o usuario ya existe
 *       403:
 *         description: No es administrador
 */
router.post('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validaciones básicas
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'username, email y password son requeridos',
        code: 'MISSING_FIELDS'
      });
    }

    // Verificar si el usuario/email ya existe
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({
        error: 'Usuario o email ya registrado',
        code: 'USER_EXISTS'
      });
    }

    // Crear usuario
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'user'
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    // Manejo de errores de validación de Mongoose
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', '), code: 'VALIDATION_ERROR' });
    }

    res.status(500).json({ error: err.message, code: 'CREATE_USER_ERROR' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               role: { type: string, enum: ['user', 'admin'] }
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No es administrador
 */
router.put('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const userId = req.params.id;

    // Buscar el usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado', code: 'USER_NOT_FOUND' });
    }

    // Verificar duplicados de username/email (excepto el actual)
    if (username || email) {
      const duplicate = await User.findOne({
        _id: { $ne: userId },
        $or: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : [])
        ]
      });

      if (duplicate) {
        return res.status(400).json({
          error: 'Username o email ya está en uso',
          code: 'USER_EXISTS'
        });
      }
    }

    // Actualizar campos
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password;
    if (role) user.role = role;

    await user.save();

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        updatedAt: user.updatedAt
      }
    });
  } catch (err) {
    // Manejo de errores de validación
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', '), code: 'VALIDATION_ERROR' });
    }

    res.status(500).json({ error: err.message, code: 'UPDATE_USER_ERROR' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar usuario (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: No es administrador o no puedes eliminarte a ti mismo
 */
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const userId = req.params.id;

    // Evitar que el admin se elimine a sí mismo
    if (userId === req.user.id) {
      return res.status(403).json({
        error: 'No puedes eliminar tu propia cuenta',
        code: 'CANNOT_DELETE_SELF'
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado', code: 'USER_NOT_FOUND' });
    }

    res.json({
      message: 'Usuario eliminado exitosamente',
      deletedUser: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message, code: 'DELETE_USER_ERROR' });
  }
});

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Cambiar rol de un usuario (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: ['user', 'admin'] }
 *     responses:
 *       200:
 *         description: Rol actualizado
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: No puedes cambiar tu propio rol
 */
router.patch('/:id/role', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        error: 'Rol debe ser "user" o "admin"',
        code: 'INVALID_ROLE'
      });
    }

    // No permitir cambiar el rol del propio admin
    if (userId === req.user.id) {
      return res.status(403).json({
        error: 'No puedes cambiar tu propio rol',
        code: 'CANNOT_CHANGE_OWN_ROLE'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado', code: 'USER_NOT_FOUND' });
    }

    res.json({
      message: 'Rol actualizado exitosamente',
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message, code: 'UPDATE_ROLE_ERROR' });
  }
});

module.exports = router;
