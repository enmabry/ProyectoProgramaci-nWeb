# Frontend (React + Vite)

Interfaz de e‑commerce con Chakra UI, React Router y socket.io-client. Incluye catálogo, detalle, carrito con persistencia, autenticación, panel de admin y chat.

## Scripts

```bash
npm run dev       # desarrollo (5173)
npm run build     # build producción en /dist
npm run preview   # sirve el build localmente
```

## Estructura destacada

```
client/src/
  components/          # UI (Navbar, Cards, Modals, ChatWidget, ChatsTab)
  pages/               # Vistas (Catalog, ProductDetail, Cart, Admin, Auth)
  context/             # AuthContext, CartContext, SocketContext
  main.jsx             # bootstrap de la app
  App.jsx              # ruteo y guards por rol
```

## Entorno

- Por defecto, el socket apunta a `http://localhost:3000`.
- Recomendado: usar una variable `VITE_API_BASE` y fallback a `window.location.origin` para despliegues.

Ejemplo en `SocketContext.jsx`:
```js
const apiBase = import.meta.env.VITE_API_BASE || window.location.origin
const newSocket = io(apiBase, { auth: { token } })
```

Al construir:
```bash
VITE_API_BASE=https://api.tu-dominio.com npm run build
```

## Rutas principales

- Productos: `/` catálogo, `/product/:slug` detalle
- Carrito: `/cart`
- Auth: `/login`, `/register`
- Admin: `/admin` (sólo rol admin)

## Chat

- `ChatWidget` (usuarios): obtiene `/api/chats/me`, escucha y envía mensajes.
- `ChatsTab` (admin): lista chats, selecciona, marca leído y responde (envía `{chatId, content}`).

## Estilos

- Chakra UI con tema extendido (colores brand, etc.).
- Componentes responsivos y accesibles.

## Buenas prácticas

- Mantén llamadas a API como rutas relativas (`/api/...`) para aprovechar el proxy de Nginx en Docker.
- Usa `localStorage` para persistir estado del carrito y tokens (según el caso de tu app).
