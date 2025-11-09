## Backend

Express + MongoDB + Socket.IO. Proporciona autenticación JWT, CRUD de productos, subida de imágenes a Cloudinary y chat en tiempo real.

### Estructura principal

```
src/
  server.js            # Inicializa Express, Socket.IO y rutas
  models/              # Mongoose schemas (User, Product, Chat)
  routes/              # authRoutes, productRoutes, chatRoutes
  middleware/          # authenticateJWT.js (auth + roles)
  config/cloudinary.js # Configuración Multer + Cloudinary
  seed/                # Scripts de seeding
```

### Modelos

#### User
- Campos: username, email, password (hash bcrypt), role, intentos de login y bloqueo temporal.
- Métodos: `comparePassword`, control de bloqueo, reset contraseña.

#### Product
- Campos clave: title, slug, description, price, compareAtPrice, stock, categories[], badges[], images[], care{ light, watering, temp }.
- Las imágenes se guardan como objetos `{ url, public_id }`.

#### Chat
- Un documento por usuario (`user` único).
- `messages[]` con `{ sender, senderRole, content, read, createdAt }`.
- `unreadCount` para mensajes de usuario no leídos por admin.

### Rutas

Autenticación (`/api/auth`)
- POST `/register`  (rate limit)
- POST `/login`     (rate limit, bloqueo por intentos)
- GET  `/me`        (decodifica token)
- GET  `/profile`   (datos completos, requiere JWT)
- POST `/forgot`    (token de recuperación; email simulado/dev)
- POST `/reset`     (reset contraseña con token válido)

Productos (`/api/products`)
- GET `/` filtros: `?category=&minPrice=&maxPrice=&sort=`
- GET `/slug/:slug`
- GET `/:id`
- POST `/` (admin) multipart, campos + imágenes
- PUT `/:id` (admin) actualización + merge de imágenes existentes
- DELETE `/:id` (admin)
- POST `/:id/images/delete` eliminar imágenes específicas
- POST `/upload` subir una imagen (admin)
- POST `/upload/url` subir desde URL (admin)

Chat (`/api/chats`)
- GET `/me` obtiene (o crea) el chat del usuario logueado
- GET `/` lista todos los chats activos (admin)
- GET `/:id` obtiene un chat (admin)
- PATCH `/:id/close` cierra chat (admin)

### Autenticación y Roles
- Middleware `authenticateJWT` verifica Bearer token.
- `authorizeRoles('admin')` restringe rutas.
- Tokens expiran en 7d.

### Subida de Imágenes
- Multer configurado con `multer-storage-cloudinary`.
- Rutas POST/PUT reciben `images` (array) y/o `imageUrls` (URLs a transformar en Cloudinary).
- En edición se manda `existingImages` (JSON) para conservar y añadir nuevas.

### Socket.IO
Eventos en `server.js`:
- `chat:send`
  - Usuario: crea/usa su chat y aumenta `unreadCount` para admin.
  - Admin: requiere `chatId`, no incrementa unread.
  - Emite `chat:newMessage` a sala `admins` si viene del usuario.
  - Emite `chat:message` al emisor y al destinatario.
- `chat:markRead` (admin) marca mensajes de usuario como leídos, pone `unreadCount=0`.

Salas:
- `user:<id>` cada usuario.
- `admins` para todos los admins.

### Variables de entorno clave
Ver `docs/ENVIRONMENT.md` (JWT_SECRET, MONGO_URI, CLOUDINARY_URL, modos de email, etc.).

### Seeding
- `npm run seed:admin` crea usuario admin por defecto.
- `npm run seed:products` inserta productos de ejemplo.
Ver `docs/SEEDING.md`.

### Errores y códigos
Se emplean códigos como `BAD_CREDENTIALS`, `USER_EXISTS`, `RATE_LIMIT`, `ACCOUNT_LOCKED` para facilitar manejo en frontend.

### Seguridad básica
- Rate limit en login/registro.
- Bloqueo temporal por intentos fallidos.
- Validación de roles y JWT.
- Eliminación de imágenes en Cloudinary al borrar productos.

### Próximas mejoras sugeridas
- Validación de tamaño y tipo de archivo en uploads.
- Endpoint de cierre de chat reflejado en interfaz admin.
- Auditoría de productos (historial de cambios).
- Sanitización más estricta de HTML si se permitiera contenido enriquecido.
