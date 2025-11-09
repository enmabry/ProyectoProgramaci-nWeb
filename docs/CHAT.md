# Chat en Tiempo Real

Sistema de mensajería entre usuario y administradores usando Socket.IO.

## Modelo

- Un documento `Chat` por usuario (`user` único).
- `messages[]`: `{ sender, senderRole, content, read, createdAt }`.
- `unreadCount`: número de mensajes de usuario no leídos por admin.
- `status`: `active` | `closed`.

## Salas

- `user:<id>`: canal privado de cada usuario.
- `admins`: todos los administradores conectados.

## Eventos Socket

### `chat:send`
Payload:
```json
{ "content": "texto", "chatId": "<solo si admin>" }
```
- Usuario: crea/usa su chat único; incrementa `unreadCount` y emite `chat:newMessage` a `admins`.
- Admin: requiere `chatId` existente; no incrementa `unreadCount`.
- El servidor emite `chat:message` al emisor y al destinatario correspondiente.

### `chat:newMessage`
Notifica a todos los admins que un usuario envió un mensaje nuevo.
```json
{ "chatId": "...", "message": {..}, "user": { id, username, email } }
```

### `chat:message`
Mensaje individual para actualizar la conversación en tiempo real (emisor y receptor).

### `chat:markRead`
Emite el admin con `chatId` para marcar mensajes del usuario como leídos y poner `unreadCount=0`.

## Rutas REST relacionadas

- `GET /api/chats/me` (usuario) obtiene/crea su chat.
- `GET /api/chats` (admin) lista chats activos.
- `GET /api/chats/:id` (admin) obtiene chat específico.
- `PATCH /api/chats/:id/close` (admin) cambia `status` a `closed`.

## Flujo típico

1. Usuario abre widget → fetch `/api/chats/me`.
2. Envía mensaje (`chat:send` con `content`).
3. Admin recibe `chat:newMessage` y ve incremento de unread.
4. Admin abre chat, lee (opcional `chat:markRead`).
5. Admin responde (`chat:send` con `{ chatId, content }`).
6. Usuario recibe `chat:message` y actualiza su vista.

## Mejoras futuras

- Indicador de escritura (typing) con eventos throttle.
- Estado de conexión / reconexión visible.
- Cierre de chat visible en la interfaz (status `closed`).
- Sistema de notificaciones push/email al recibir respuesta admin.
