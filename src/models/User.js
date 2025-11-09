// Importar mongoose y bcrypt para la gestión de usuarios
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definición del esquema de usuario
const UserSchema = new mongoose.Schema({
  // Nombre de usuario, requerido y único
  username: { type: String, required: true, unique: true, trim: true },
  // Correo electrónico, requerido y único, en minúsculas
  email:    { type: String, required: true, unique: true, lowercase: true },
  // Contraseña, requerida y con una longitud mínima de 6 caracteres
  password: { type: String, required: true, minlength: 6 },
  // Rol del usuario, puede ser 'user' o 'admin', por defecto 'user'
  role:     { type: String, enum: ['user','admin'], default: 'user' },
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

// Exportar el modelo de usuario
module.exports = mongoose.model('User', UserSchema);
