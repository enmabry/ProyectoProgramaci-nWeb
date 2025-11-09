const { Router } = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = Router();
const sign = (u) => jwt.sign(
  { id: u._id, username: u.username, role: u.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

router.post('/register', async (req,res)=>{
  try{
    const { username, email, password, role } = req.body;
    const exists = await User.findOne({ $or: [{email}, {username}] });
    if (exists) return res.status(400).json({ error: 'Usuario o email ya registrado' });
    const user = await User.create({ username, email, password, role: role || 'user' });
    res.json({ token: sign(user), user: { id:user._id, username:user.username, role:user.role }});
  }catch(e){ res.status(400).json({ error: e.message }); }
});

router.post('/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }
    res.json({ token: sign(user), user: { id:user._id, username:user.username, role:user.role }});
  }catch(e){ res.status(400).json({ error: e.message }); }
});

router.get('/me', (req,res)=>{
  try{
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No autorizado' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: payload });
  }catch(e){
    if (e?.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;
