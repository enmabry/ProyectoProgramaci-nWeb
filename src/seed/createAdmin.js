require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')

const ADMIN_DATA = {
  username: 'admin1',
  email: 'admin1@admin.com',
  password: 'Admin123',
  role: 'admin'
}

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Conectado a MongoDB')

    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ email: ADMIN_DATA.email })
    if (existingAdmin) {
      console.log('⚠️  El usuario admin ya existe')
      console.log(`   Email: ${existingAdmin.email}`)
      console.log(`   Username: ${existingAdmin.username}`)
      console.log(`   Role: ${existingAdmin.role}`)
      process.exit(0)
    }

    // Crear el admin
    const admin = await User.create(ADMIN_DATA)
    console.log('✅ Usuario admin creado exitosamente:')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Username: ${admin.username}`)
    console.log(`   Password: ${ADMIN_DATA.password}`)
    console.log(`   Role: ${admin.role}`)
    console.log('\n📝 Guarda estas credenciales para acceder al panel de administración')

    process.exit(0)
  } catch (err) {
    console.error('❌ Error al crear admin:', err.message)
    process.exit(1)
  }
}

createAdmin()
