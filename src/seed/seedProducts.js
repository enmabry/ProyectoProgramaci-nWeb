require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const data = require('./productsSeedData');

async function connect() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/plantshop';
  await mongoose.connect(uri, {
    autoIndex: true,
  });
}

async function seed() {
  try {
    await connect();
    console.log('Conectado a MongoDB');

    const existing = await Product.countDocuments();
    console.log(`Productos existentes: ${existing}`);

    // Opcional: limpiar solo los slugs que vamos a insertar para no borrar otros
    const slugs = data.map(p => p.slug);
    await Product.deleteMany({ slug: { $in: slugs } });
    console.log('Eliminados productos previos con mismos slugs');

    // Insertar
    const inserted = await Product.insertMany(data);
    console.log(`Insertados ${inserted.length} productos`);
  } catch (err) {
    console.error('Error al sembrar productos:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado');
  }
}

async function clear() {
  try {
    await connect();
    const slugs = data.map(p => p.slug);
    const result = await Product.deleteMany({ slug: { $in: slugs } });
    console.log(`Eliminados ${result.deletedCount} productos de la semilla`);
  } catch (err) {
    console.error('Error al limpiar productos:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado');
  }
}

const action = process.argv[2];
if (action === 'clear') {
  clear();
} else {
  seed();
}
