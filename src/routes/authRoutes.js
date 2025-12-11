const { Router } = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { authenticateJWT } = require('../middleware/authenticateJWT');
const nodemailer = require('nodemailer');

const router = Router();
const sign = (u) => jwt.sign(
  { id: u._id, username: u.username, role: u.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Rate limiter para login y registro (por IP)
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 20, // máximo 20 intentos dentro de la ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos, espera unos minutos.', code: 'RATE_LIMIT' }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, default: 'user' }
 *     responses:
 *       200:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Usuario o email ya registrado
 */
router.post('/register', authLimiter, async (req,res)=>{
  try{
    const { username, email, password, role } = req.body;
    const exists = await User.findOne({ $or: [{email}, {username}] });
    if (exists) return res.status(400).json({ error: 'Usuario o email ya registrado', code: 'USER_EXISTS' });
    const user = await User.create({ username, email, password, role: role || 'user' });
    res.json({ token: sign(user), user: { id:user._id, username:user.username, role:user.role }});
  }catch(e){ res.status(400).json({ error: e.message, code: 'REGISTER_ERROR' }); }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Sesión iniciada exitosamente
 *       400:
 *         description: Credenciales inválidas
 */
router.post('/login', authLimiter, async (req,res)=>{
  try{
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // Si existe el usuario y está bloqueado temporalmente
    if (user && user.lockUntil && user.lockUntil > Date.now()){
      const remainingMs = user.lockUntil.getTime() - Date.now();
      const minutes = Math.ceil(remainingMs / 60000);
      return res.status(423).json({ error: 'Cuenta bloqueada temporalmente', code: 'ACCOUNT_LOCKED', until: user.lockUntil, minutes });
    }

    if (!user || !(await user.comparePassword(password))) {
      // Incrementar intentos si el usuario existe
      if (user) { try { await user.incLoginAttempts(); } catch(_){} }
      return res.status(400).json({ error: 'Credenciales inválidas', code: 'BAD_CREDENTIALS' });
    }

    // Login exitoso: resetear contador/bloqueo si aplica
    try { await user.resetLoginAttempts(); } catch(_){}

    res.json({ token: sign(user), user: { id:user._id, username:user.username, role:user.role }});
  }catch(e){ res.status(400).json({ error: e.message, code: 'LOGIN_ERROR' }); }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener usuario actual del token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario decodificado del token
 *       401:
 *         description: Token inválido o expirado
 */
router.get('/me', (req,res)=>{
  try{
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No autorizado', code: 'NO_TOKEN' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: payload });
  }catch(e){
    if (e?.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    res.status(401).json({ error: 'Token inválido', code: 'TOKEN_INVALID' });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil completo del usuario
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil completo del usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado', code: 'USER_NOT_FOUND' });
    res.json({ user });
  } catch (e) {
    res.status(400).json({ error: e.message, code: 'PROFILE_ERROR' });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión (endpoint sin efecto, token se invalida en cliente)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 */
router.post('/logout', authenticateJWT, (req, res) => {
  res.json({ message: 'Sesión cerrada exitosamente', code: 'LOGOUT_OK' });
});

// --- Reset de contraseña ---
// Solicitar reset: envía (simulado) un token
// Transport de correo (usar variables .env; si no, fallback a consola)
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, CLIENT_URL, EMAIL_DEV_MODE, ETHEREAL_MODE } = process.env;
let transporter;
async function buildTransport(){
  // Modo desarrollo forzado: siempre jsonTransport y devolvemos token
  if (EMAIL_DEV_MODE === 'true') {
    return nodemailer.createTransport({ jsonTransport: true });
  }
  // Ethereal (sandbox temporal) si se solicita y no hay credenciales reales
  if (ETHEREAL_MODE === 'true' && (!SMTP_HOST || !SMTP_USER)) {
    const acct = await nodemailer.createTestAccount();
    console.log('Cuenta Ethereal creada:', acct.user);
    return nodemailer.createTransport({
      host: acct.smtp.host,
      port: acct.smtp.port,
      secure: acct.smtp.secure,
      auth: { user: acct.user, pass: acct.pass }
    });
  }
  // Credenciales reales
  if (SMTP_HOST && SMTP_USER) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? parseInt(SMTP_PORT,10) : 587,
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
  }
  // Último recurso: jsonTransport
  return nodemailer.createTransport({ jsonTransport: true });
}

// Inicializar transport de forma async (para Ethereal)
(async () => { transporter = await buildTransport(); })();

/**
 * @swagger
 * /api/auth/forgot:
 *   post:
 *     summary: Solicitar reset de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Email de reset enviado (o token en dev mode)
 *       404:
 *         description: Usuario no encontrado
 */
// router.post('/forgot', async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ error: 'Email requerido', code: 'EMAIL_REQUIRED' });
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ error: 'No existe usuario con ese email', code: 'EMAIL_NOT_FOUND' });
//     const plainToken = user.createPasswordResetToken();
//     await user.save();
//     const resetLink = `${CLIENT_URL || 'http://localhost:5173'}/reset?token=${plainToken}`;

//     // Si estamos en dev mode, devolvemos directamente el token y enlace
//     if (EMAIL_DEV_MODE === 'true') {
//       return res.json({ message: 'Token generado (dev mode)', resetToken: plainToken, link: resetLink, expiresInMinutes: 60 });
//     }

//     const mail = {
//       from: EMAIL_FROM || 'no-reply@example.com',
//       to: user.email,
//       subject: 'Recupera tu contraseña',
//       html: `
//         <p>Has solicitado restablecer tu contraseña.</p>
//         <p>Haz clic en el siguiente enlace (válido 60 minutos):</p>
//         <p><a href="${resetLink}">${resetLink}</a></p>
//         <p>Si no solicitaste esto, ignora este correo.</p>
//       `
//     };
//     try {
//       const info = await transporter.sendMail(mail);
//       let previewUrl;
//       if (nodemailer.getTestMessageUrl && ETHEREAL_MODE === 'true') {
//         previewUrl = nodemailer.getTestMessageUrl(info);
//       }
//       res.json({ message: 'Email enviado', expiresInMinutes: 60, preview: previewUrl });
//     } catch (mailErr) {
//       console.error('Error enviando email reset:', mailErr.message);
//       // Fallback: devolver token para poder continuar pruebas
//       res.status(200).json({ message: 'Email no enviado, usando fallback', resetToken: plainToken, link: resetLink, code: 'EMAIL_FALLBACK' });
//     }
//   } catch (e) {
//     res.status(400).json({ error: e.message, code: 'FORGOT_ERROR' });
//   }
// });

// Confirmar reset: requiere token y nueva contraseña
/**
 * @swagger
 * /api/auth/reset:
 *   post:
 *     summary: Confirmar reset de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *       400:
 *         description: Token inválido o expirado
 */
// router.post('/reset', async (req, res) => {
//   try {
//     const { token, password } = req.body;
//     if (!token || !password) return res.status(400).json({ error: 'Token y password requeridos', code: 'RESET_DATA_REQUIRED' });
//     // Hash del token recibido para comparar
//     const hash = require('crypto').createHash('sha256').update(token).digest('hex');
//     const user = await User.findOne({
//       passwordResetToken: hash,
//       passwordResetExpires: { $gt: new Date() }
//     });
//     if (!user) return res.status(400).json({ error: 'Token inválido o expirado', code: 'RESET_TOKEN_INVALID' });
//     user.password = password; // se aplicará hash en pre save si cambia
//     user.clearPasswordResetToken();
//     await user.save();
//     res.json({ message: 'Contraseña actualizada', code: 'PASSWORD_RESET_OK' });
//   } catch (e) {
//     res.status(400).json({ error: e.message, code: 'RESET_ERROR' });
//   }
// });

module.exports = router;
