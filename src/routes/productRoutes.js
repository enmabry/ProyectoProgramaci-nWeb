const { Router } = require('express');
const Product = require('../models/Product');
const { authenticateJWT, authorizeRoles } = require('../middleware/authenticateJWT');
const { upload, cloudinary } = require('../config/cloudinary');
const careOptions = require('../config/careOptions');

const router = Router();

/**
 * @swagger
 * /api/products/slug/{slug}:
 *   get:
 *     summary: Obtener producto por slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
// GET por slug (detalle de producto)
router.get('/slug/:slug', async (req, res) => {
  try {
    const p = await Product.findOne({ slug: req.params.slug });
    if (!p) return res.status(404).json({ error: 'No encontrado' });
    res.json(p);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Listar todos los productos
 *     tags: [Products]
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
 *         description: Lista de productos
 */
// GET todos los productos (con filtros opcionales)
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort } = req.query;
    let filter = {};
    
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

// GET producto por ID
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear nuevo producto (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, description: 'Nombre del producto' }
 *               slug: { type: string, description: 'URL slug único' }
 *               price: { type: number, description: 'Precio en pesos' }
 *               stock: { type: number, description: 'Cantidad disponible' }
 *               care: { type: string, description: 'JSON con luz, riego, temperatura' }
 *               images: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *       400:
 *         description: Error en validación
 *       401:
 *         description: No autorizado
 */

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar producto (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               stock: { type: number }
 *               care: { type: string }
 *               images: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autorizado
 *
 *   delete:
 *     summary: Eliminar producto (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autorizado
 */

// Helper para castear y parsear campos desde multipart/form-data o JSON
async function buildPayloadFromBody(body, files){
  const payload = { ...body };
  // Números
  if (payload.price !== undefined) payload.price = Number(payload.price);
  if (payload.compareAtPrice !== undefined) payload.compareAtPrice = Number(payload.compareAtPrice);
  if (payload.stock !== undefined) payload.stock = Number(payload.stock);
  // Bools
  if (payload.isFeatured !== undefined) payload.isFeatured = payload.isFeatured === 'true' || payload.isFeatured === true;
  // Arrays potencialmente como string
  const toArray = (val) => {
    if (val === undefined) return undefined;
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { /* fallthrough */ }
    return String(val)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  };
  const maybeCats = toArray(payload.categories);
  if (maybeCats) payload.categories = maybeCats;
  const maybeBadges = toArray(payload.badges);
  if (maybeBadges) payload.badges = maybeBadges;

  // Objeto care (light, watering, temp)
  if (payload.care) {
    if (typeof payload.care === 'string') {
      try {
        payload.care = JSON.parse(payload.care);
      } catch {
        // Si falla el parse, dejarlo como está
      }
    }
    
    // Mapear valores simples a objetos completos con careOptions
    if (payload.care.light && typeof payload.care.light === 'string') {
      payload.care.light = careOptions.light[payload.care.light] || careOptions.light.media;
    }
    if (payload.care.watering && typeof payload.care.watering === 'string') {
      payload.care.watering = careOptions.watering[payload.care.watering] || careOptions.watering.medio;
    }
    if (payload.care.temp && typeof payload.care.temp === 'string') {
      payload.care.temp = careOptions.temp[payload.care.temp] || careOptions.temp.moderado;
    }
  }

  // Imágenes subidas como archivos: file.path = URL y file.filename = public_id
  const uploaded = Array.isArray(files)
    ? files
        .filter(f => f.path && f.filename)
        .map(f => ({ url: f.path, public_id: f.filename }))
    : [];

  // Imágenes a partir de URLs (imageUrls puede ser JSON ["http..",...] o CSV)
  const maybeUrls = toArray(body.imageUrls);
  let uploadedFromUrls = [];
  if (maybeUrls && maybeUrls.length){
    for (const url of maybeUrls){
      try {
        const r = await cloudinary.uploader.upload(url, { folder: 'products' });
        uploadedFromUrls.push({ url: r.secure_url, public_id: r.public_id });
      } catch { /* ignoramos URLs que fallen */ }
    }
  }

  // Combinar: si hay archivos, usarlos; si no, usar URLs; si ambos, solo archivos
  const combined = uploaded.length > 0 ? uploaded : uploadedFromUrls;
  if (combined.length) payload.images = combined;
  return payload;
}

// POST crear producto (solo admin) con subida de imágenes
router.post('/', authenticateJWT, authorizeRoles('admin'), upload.array('images', 8), async (req, res) => {
  try {
    const payload = await buildPayloadFromBody(req.body, req.files);
    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PUT actualizar producto (solo admin) con posibilidad de subir nuevas imágenes
router.put('/:id', authenticateJWT, authorizeRoles('admin'), upload.array('images', 8), async (req, res) => {
  try {
    const payload = await buildPayloadFromBody(req.body, req.files);

    // Manejar imágenes: si hay nuevas imágenes, reemplazar las antiguas
    // Si NO hay nuevas imágenes, preservar las existentes
    if (!payload.images || payload.images.length === 0) {
      // No hay nuevas imágenes, no cambiar las existentes
      delete payload.images;
    }
    // Si hay nuevas imágenes (en payload.images), reemplazar las antiguas

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Ruta utilitaria: subir solo una imagen y devolver URL (solo admin)
/**
 * @swagger
 * /api/products/upload:
 *   post:
 *     summary: Subir imagen a Cloudinary (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Imagen subida exitosamente
 *       400:
 *         description: No se recibió imagen
 *       401:
 *         description: No autorizado
 */
router.post('/upload', authenticateJWT, authorizeRoles('admin'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file?.path) return res.status(400).json({ error: 'No se recibió imagen' });
    res.json({ url: req.file.path, filename: req.file.filename });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Subir imagen desde URL y devolver {url, public_id}
/**
 * @swagger
 * /api/products/upload/url:
 *   post:
 *     summary: Subir imagen desde URL a Cloudinary (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url: { type: string, description: 'URL de la imagen a subir' }
 *     responses:
 *       200:
 *         description: Imagen subida exitosamente desde URL
 *       400:
 *         description: URL no proporcionada o error en subida
 *       401:
 *         description: No autorizado
 */
router.post('/upload/url', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const url = req.body.url || req.body.imageUrl;
    if (!url) return res.status(400).json({ error: 'url requerida' });
    const r = await cloudinary.uploader.upload(url, { folder: 'products' });
    res.json({ url: r.secure_url, public_id: r.public_id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE eliminar producto (solo admin)
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    // Antes de borrar el producto, elimina imágenes en Cloudinary
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });
    if (Array.isArray(prod.images)){
      for (const img of prod.images){
        if (img?.public_id){
          try { await cloudinary.uploader.destroy(img.public_id); } catch {}
        }
      }
    }
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE imágenes específicas del producto (solo admin)
// Body JSON: { publicIds: ["products/abc123", "products/xyz456"] }
/**
 * @swagger
 * /api/products/{id}/images/delete:
 *   post:
 *     summary: Eliminar imágenes específicas de un producto (admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicIds: { type: array, items: { type: string }, description: 'IDs de Cloudinary a eliminar' }
 *     responses:
 *       200:
 *         description: Imágenes eliminadas exitosamente
 *       400:
 *         description: publicIds requerido o vacío
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autorizado
 */
router.post('/:id/images/delete', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const { publicIds } = req.body;
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({ error: 'publicIds requerido' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    // Eliminar en Cloudinary
    for (const pid of publicIds){
      try { await cloudinary.uploader.destroy(pid); } catch {}
    }

    // Remover del documento
    product.images = product.images.filter(img => !publicIds.includes(img.public_id));
    await product.save();
    res.json({ images: product.images });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
