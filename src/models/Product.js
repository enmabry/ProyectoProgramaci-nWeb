// Importa mongoose para definir el esquema del producto
const mongoose = require('mongoose');

// Define el esquema del producto con sus atributos y validaciones
const ProductSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true }, // Nombre del producto, requerido y sin espacios
  slug:       { type: String, required: true, unique: true, lowercase: true }, // Slug único para URL, requerido y en minúsculas
  shortDesc:  { type: String, default: '' }, // Descripción corta del producto
  description:{ type: String, default: '' }, // Descripción completa del producto
  price:      { type: Number, required: true, min: 0 }, // Precio del producto, requerido y no negativo
  compareAtPrice: { type: Number }, // Precio de comparación opcional para mostrar descuentos
  images:     { 
    type: [{ url: String, public_id: String }], 
    default: [] 
  }, // Array de imágenes del producto (Cloudinary)
  categories: { type: [String], default: [] }, // Categorías del producto, ej: ["Interior","Suculentas"]
  badges:     { type: [String], default: [] }, // Insignias del producto, ej: ["nuevo","top"]
  care: {
    light:    { type: String, enum: ['baja','media','alta'], default: 'media' }, // Requerimientos de luz
    watering: { type: String, enum: ['poco','medio','frecuente'], default: 'medio' }, // Frecuencia de riego
    temp:     { type: String, default: '' } // Temperatura recomendada, ej: "18–24°C"
  },
  size:       { type: String, enum: ['S','M','L'], default: 'M' }, // Tamaño del producto
  dimensions: { type: String, default: '' }, // Dimensiones del producto, ej: "20–30 cm"
  potRecommended: { type: String, default: '' }, // Tamaño de maceta recomendado
  stock:      { type: Number, default: 0 }, // Cantidad en stock
  ratingAvg:  { type: Number, default: 0, min: 0, max: 5 }, // Calificación promedio del producto
  ratingCount:{ type: Number, default: 0 }, // Cantidad de calificaciones
  salesCount: { type: Number, default: 0 }, // Cantidad de ventas
  isFeatured: { type: Boolean, default: false } // Indica si el producto es destacado
}, { timestamps: true }); // Agrega timestamps para createdAt y updatedAt

// Crea índices para mejorar la búsqueda en la base de datos
// Nota: 'slug' ya tiene unique:true, lo que crea un índice. Evitamos duplicarlo.
ProductSchema.index({ categories: 1 }); // Índice para las categorías
ProductSchema.index({ price: 1 }); // Índice para el precio
ProductSchema.index({ createdAt: -1 }); // Índice para la fecha de creación

// Exporta el modelo de producto
module.exports = mongoose.model('Product', ProductSchema);
