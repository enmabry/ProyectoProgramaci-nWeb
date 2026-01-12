// Importar mongoose para definir el esquema de pedidos
const mongoose = require('mongoose');

// Define el esquema de pedidos
const OrderSchema = new mongoose.Schema({
  // Referencia al usuario que realizó el pedido
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Array de items del pedido
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      // Nombre del producto (copia del momento de la orden)
      productName: { type: String, required: true },
      // Cantidad solicitada
      quantity: { type: Number, required: true, min: 1 },
      // Precio unitario al momento de la compra
      price: { type: Number, required: true, min: 0 },
      // Subtotal (cantidad × precio)
      subtotal: { type: Number, required: true, min: 0 }
    }
  ],

  // Totales del pedido
  subtotal: { type: Number, required: true, min: 0 }, // suma de subtotales
  tax: { type: Number, default: 0, min: 0 }, // impuestos (si aplica)
  shippingCost: { type: Number, default: 0, min: 0 }, // costo de envío
  total: { type: Number, required: true, min: 0 }, // total = subtotal + tax + shippingCost

  // Estado del pedido
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },

  // Información de envío
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'Argentina' }
  },

  // Método de pago
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'transfer', 'cash', 'other'],
    default: 'credit_card'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },

  // Notas del pedido
  notes: { type: String, default: '' },

  // Fechas importantes
  confirmedAt: { type: Date },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  
}, { timestamps: true }); // createdAt y updatedAt automáticos

// Índices para optimizar búsquedas
OrderSchema.index({ userId: 1 }); // Para obtener pedidos de un usuario
OrderSchema.index({ status: 1 }); // Para filtrar por estado
OrderSchema.index({ createdAt: -1 }); // Para ordenar por fecha
OrderSchema.index({ userId: 1, createdAt: -1 }); // Para obtener pedidos de usuario ordenados

// Método para cambiar el estado del pedido
OrderSchema.methods.updateStatus = function(newStatus) {
  if (!['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(newStatus)) {
    throw new Error('Estado inválido');
  }

  this.status = newStatus;

  // Actualizar fechas según el estado
  if (newStatus === 'confirmed' && !this.confirmedAt) {
    this.confirmedAt = new Date();
  } else if (newStatus === 'shipped' && !this.shippedAt) {
    this.shippedAt = new Date();
  } else if (newStatus === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  } else if (newStatus === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }

  return this.save();
};

// Método para calcular el total automáticamente
OrderSchema.methods.calculateTotal = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.total = this.subtotal + (this.tax || 0) + (this.shippingCost || 0);
  return this.total;
};

// Middleware pre-save para validar y calcular totales
OrderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    // Calcular subtotal de cada item si no está definido
    this.items.forEach(item => {
      if (!item.subtotal) {
        item.subtotal = item.quantity * item.price;
      }
    });

    // Calcular total del pedido
    this.calculateTotal();
  }

  next();
});

// Exportar el modelo de pedidos
module.exports = mongoose.model('Order', OrderSchema);
