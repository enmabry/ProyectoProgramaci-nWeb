const Order = require('../../models/Order');
const Product = require('../../models/Product');

const orderResolvers = {
  Query: {
    orders: async (_, { status, limit = 10, skip = 0 }, { user }) => {
      // Solo admins pueden ver todas las órdenes
      if (!user || user.role !== 'admin') {
        throw new Error('No autorizado para ver todas las órdenes');
      }

      const query = status ? { status } : {};
      
      try {
        const orders = await Order.find(query)
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(skip);
        return orders;
      } catch (err) {
        throw new Error(`Error al obtener órdenes: ${err.message}`);
      }
    },

    orderById: async (_, { id }, { user }) => {
      if (!user) {
        throw new Error('Debe estar autenticado para ver órdenes');
      }

      try {
        const order = await Order.findById(id);
        
        if (!order) {
          throw new Error('Orden no encontrada');
        }

        // Solo admin o el propietario pueden ver la orden
        if (user.role !== 'admin' && order.userId.toString() !== user.id) {
          throw new Error('No autorizado para ver esta orden');
        }

        return order;
      } catch (err) {
        throw new Error(`Error al obtener orden: ${err.message}`);
      }
    },

    userOrders: async (_, { userId, limit = 10, skip = 0 }, { user }) => {
      if (!user) {
        throw new Error('Debe estar autenticado');
      }

      // Solo admin o el usuario mismo puede ver sus órdenes
      if (user.role !== 'admin' && user.id !== userId) {
        throw new Error('No autorizado para ver estas órdenes');
      }

      try {
        const orders = await Order.find({ userId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(skip);
        return orders;
      } catch (err) {
        throw new Error(`Error al obtener órdenes del usuario: ${err.message}`);
      }
    }
  },

  Mutation: {
    createOrder: async (
      _,
      { items, shippingAddress, paymentMethod, notes },
      { user }
    ) => {
      if (!user) {
        throw new Error('Debe estar autenticado para crear una orden');
      }

      try {
        // Validar que existan productos y calcular precios
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
          const product = await Product.findById(item.productId);
          
          if (!product) {
            throw new Error(`Producto ${item.productId} no encontrado`);
          }

          if (product.stock < item.quantity) {
            throw new Error(`Stock insuficiente para ${product.name}`);
          }

          const itemSubtotal = product.price * item.quantity;
          subtotal += itemSubtotal;

          orderItems.push({
            productId: product._id,
            productName: product.name,
            quantity: item.quantity,
            price: product.price,
            subtotal: itemSubtotal
          });
        }

        // Calcular impuestos y envío (valores de ejemplo)
        const tax = subtotal * 0.10; // 10% impuesto
        const shippingCost = subtotal > 100 ? 0 : 10; // Envío gratis si > 100
        const total = subtotal + tax + shippingCost;

        const order = new Order({
          userId: user.id,
          items: orderItems,
          subtotal,
          tax,
          shippingCost,
          total,
          shippingAddress,
          paymentMethod,
          paymentStatus: 'pending',
          status: 'pending',
          notes
        });

        await order.save();
        return order;
      } catch (err) {
        throw new Error(`Error al crear orden: ${err.message}`);
      }
    },

    updateOrderStatus: async (_, { id, status }, { user }) => {
      if (!user || user.role !== 'admin') {
        throw new Error('Solo administradores pueden actualizar el estado de órdenes');
      }

      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        throw new Error(`Estado inválido. Estados válidos: ${validStatuses.join(', ')}`);
      }

      try {
        const order = await Order.findById(id);
        
        if (!order) {
          throw new Error('Orden no encontrada');
        }

        order.updateStatus(status);
        await order.save();
        
        return order;
      } catch (err) {
        throw new Error(`Error al actualizar orden: ${err.message}`);
      }
    },

    cancelOrder: async (_, { id }, { user }) => {
      if (!user) {
        throw new Error('Debe estar autenticado para cancelar órdenes');
      }

      try {
        const order = await Order.findById(id);
        
        if (!order) {
          throw new Error('Orden no encontrada');
        }

        // Solo admin o el propietario pueden cancelar
        if (user.role !== 'admin' && order.userId.toString() !== user.id) {
          throw new Error('No autorizado para cancelar esta orden');
        }

        // No se puede cancelar si ya está entregada
        if (order.status === 'delivered') {
          throw new Error('No se puede cancelar una orden ya entregada');
        }

        order.updateStatus('cancelled');
        await order.save();
        
        return order;
      } catch (err) {
        throw new Error(`Error al cancelar orden: ${err.message}`);
      }
    }
  }
};

module.exports = orderResolvers;
