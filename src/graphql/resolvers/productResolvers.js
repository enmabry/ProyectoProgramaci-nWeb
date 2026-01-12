const Product = require('../../models/Product');

const productResolvers = {
  Query: {
    // Obtener todos los productos con paginación y filtros
    products: async (_, { limit = 10, skip = 0, category }) => {
      try {
        const filter = {};
        if (category) filter.categories = category;
        
        const products = await Product.find(filter)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 });
        
        return products;
      } catch (err) {
        throw new Error(`Error al obtener productos: ${err.message}`);
      }
    },

    // Obtener producto por ID
    productById: async (_, { id }) => {
      try {
        const product = await Product.findById(id);
        if (!product) throw new Error('Producto no encontrado');
        return product;
      } catch (err) {
        throw new Error(`Error al obtener producto: ${err.message}`);
      }
    },

    // Obtener producto por slug (URL friendly)
    productBySlug: async (_, { slug }) => {
      try {
        const product = await Product.findOne({ slug });
        if (!product) throw new Error('Producto no encontrado');
        return product;
      } catch (err) {
        throw new Error(`Error al obtener producto: ${err.message}`);
      }
    },

    // Obtener productos por categoría
    productsByCategory: async (_, { category }) => {
      try {
        const products = await Product.find({ categories: category }).sort({ createdAt: -1 });
        return products;
      } catch (err) {
        throw new Error(`Error al obtener productos por categoría: ${err.message}`);
      }
    },

    // Obtener productos destacados
    featuredProducts: async (_, { limit = 6 }) => {
      try {
        const products = await Product.find({ isFeatured: true })
          .limit(limit)
          .sort({ createdAt: -1 });
        return products;
      } catch (err) {
        throw new Error(`Error al obtener productos destacados: ${err.message}`);
      }
    },

    // Buscar productos por nombre o descripción
    searchProducts: async (_, { query }) => {
      try {
        const products = await Product.find({
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { shortDesc: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
          ]
        });
        return products;
      } catch (err) {
        throw new Error(`Error al buscar productos: ${err.message}`);
      }
    }
  }
};

module.exports = productResolvers;
