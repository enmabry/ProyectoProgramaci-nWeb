// Importar mongoose y bcrypt para la gestión de usuarios
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Política de lockout
const MAX_LOGIN_ATTEMPTS = 5; // intentos fallidos permitidos
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutos

// Definición del esquema de usuario
const UserSchema = new mongoose.Schema({
  // Nombre de usuario, requerido y único
  username: { type: String, required: true, unique: true, trim: true },
  // Correo electrónico, requerido y único, en minúsculas
  email:    { type: String, required: true, unique: true, lowercase: true },
  // Contraseña, requerida, mínimo 8 y complejidad: mayúscula, minúscula y número
  password: { 
    type: String, 
    required: true, 
    minlength: 8,
    validate: {
      validator: function(v){
        // Al menos 8, una minúscula, una mayúscula y un número
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v)
      },
      message: 'La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula y número.'
    }
  },
  // Rol del usuario, puede ser 'user' o 'admin', por defecto 'user'
  role:     { type: String, enum: ['user','admin'], default: 'user' },
  // Seguridad de autenticación
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Date },
  // Reset de contraseña
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date }
}, { timestamps: true });

// Middleware para encriptar la contraseña antes de guardar el usuario
UserSchema.pre('save', async function(next){
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar la contraseña ingresada con la almacenada
UserSchema.methods.comparePassword = function(candidate){
  return bcrypt.compare(candidate, this.password);
};

// Virtual: indica si la cuenta está temporalmente bloqueada
UserSchema.virtual('isLocked').get(function(){
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Incrementa intentos fallidos y aplica bloqueo si corresponde
UserSchema.methods.incLoginAttempts = async function(){
  // si el lock expiró, reiniciar contador y comenzar desde 1
  if (this.lockUntil && this.lockUntil < Date.now()){
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts = (this.loginAttempts || 0) + 1;
    if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS && !this.isLocked){
      this.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
    }
  }
  return this.save();
};

// Resetea el contador tras login exitoso
UserSchema.methods.resetLoginAttempts = async function(){
  if (this.loginAttempts !== 0 || this.lockUntil){
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    await this.save();
  }
  return this;
};

// Exponer constantes como estáticos del modelo (informativos)
UserSchema.statics.MAX_LOGIN_ATTEMPTS = MAX_LOGIN_ATTEMPTS;
UserSchema.statics.LOCK_TIME_MS = LOCK_TIME_MS;

// Genera y guarda un token de reset (no devuelve el hash, sino el token plano para enviar por email)
UserSchema.methods.createPasswordResetToken = function(){
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  // 1 hora de validez
  this.passwordResetToken = hash;
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  return token;
};

UserSchema.methods.clearPasswordResetToken = function(){
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
};

// Exportar el modelo de usuario
module.exports = mongoose.model('User', UserSchema);
