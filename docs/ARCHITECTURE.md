# Arquitectura

## Visión general

- Frontend (React + Vite) consume la API por `/api/*` y el WebSocket por `/socket.io/`.
- Nginx (en Docker) sirve la SPA y hace proxy a `backend:3000` para API + WS.
- Backend (Express) expone REST y Socket.IO, y se conecta a MongoDB.
- MongoDB almacena usuarios, productos y chats.

## Flujo de autenticación

1. Registro/Login → `/api/auth/register|login` → JWT (7 días)
2. Frontend guarda token y lo envía en `Authorization: Bearer <jwt>`
3. Rutas protegidas usan `authenticateJWT` y, si aplica, `authorizeRoles('admin')`

## Productos

- CRUD admin con imágenes en Cloudinary.
- Filtros en listados por categoría/precio/sort.
- Detalle por slug (`/slug/:slug`).

## Chat en tiempo real

- Cada usuario tiene un `Chat` único. Mensajes conservan `senderRole`.
- Salas: `user:<id>` y `admins`.
- Eventos:
  - `chat:send` (usuario o admin)
  - `chat:message` (nuevo mensaje al emisor/receptor)
  - `chat:newMessage` (notificación a admins de mensaje de usuario)
  - `chat:markRead` (admin marca mensajes de usuario como leídos)

## Contextos del Frontend

- `AuthContext` token y usuario.
- `CartContext` carrito persistente en localStorage.
- `SocketContext` conexión a Socket.IO con token.

## Seguridad

- Rate limit en login/registro y bloqueo temporal.
- JWT, validación de roles y protección de rutas.
- Limpieza de imágenes al borrar productos.
