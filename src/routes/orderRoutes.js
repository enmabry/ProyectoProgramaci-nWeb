const { Router } = require('express');
const Product = require('../models/Product');
const { authenticateJWT } = require('../middleware/authenticateJWT');

const router = Router();

/**
 * @swagger
 * /api/orders/checkout:
 *   post:
 *     summary: Procesar pago y actualizar stock
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: string }
 *                     quantity: { type: number }
 *     responses:
 *       200:
 *         description: Pago procesado exitosamente
 *       400:
 *         description: Stock insuficiente o datos inválidos
 */
// POST - Procesar pago y actualizar stock
// Esperamos un array de items: [{ productId, quantity }, ...]
router.post('/checkout', async (req, res) => {
  try {
    const { items } = req.body; // items = [{ productId, quantity }, ...]
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items vacío o inválido' });
    }

    // Verificar stock disponible para todos los productos
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Producto ${item.productId} no encontrado` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}` 
        });
      }
    }

    // Actualizar stock de todos los productos
    const updatedProducts = [];
    for (const item of items) {
      const product = await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { new: true, runValidators: true }
      );
      updatedProducts.push(product);
    }

    // Simular respuesta de pago exitoso
    res.json({
      success: true,
      message: 'Pago procesado exitosamente',
      orderId: `ORD-${Date.now()}`, // Simulamos ID de orden
      updatedProducts: updatedProducts,
      timestamp: new Date()
    });

  } catch (err) {
    console.error('Error en checkout:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// GET - Obtener productos con stock > 0 (para catálogo)
/**
 * @swagger
 * /api/orders/available:
 *   get:
 *     summary: Obtener productos con stock disponible
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: ['price-asc', 'price-desc', 'newest'] }
 *     responses:
 *       200:
 *         description: Lista de productos con stock > 0
 */
router.get('/available', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort } = req.query;
    let filter = { stock: { $gt: 0 } }; // Solo productos con stock > 0
    
    if (category) filter.categories = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    let query = Product.find(filter);
    if (sort === 'price-asc') query = query.sort({ price: 1 });
    if (sort === 'price-desc') query = query.sort({ price: -1 });
    if (sort === 'newest') query = query.sort({ createdAt: -1 });
    
    const products = await query;
    res.json(products);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
