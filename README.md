# 🌿 A Priori Verde — Portal de productos con JWT, Roles y Chat (Socket.IO)

Bienvenido a **A Priori Verde**, un e‑commerce minimalista para vender plantas. El proyecto integra **autenticación JWT**, **roles (user/admin)**, **CRUD de productos** con **MongoDB**, y **chat en tiempo real** con **Socket.IO**.

> Pensado para correr fácil en local y listo para desplegar con **MongoDB Atlas** + un PaaS (Render/Railway/Fly).

---

## ✨ Características
- 🔐 **Auth JWT**: registro, login y `GET /api/auth/me`.
- 👤 **Roles**: `user` (ver) y `admin` (CRUD completo).
- 🪴 **Productos**: listado público, detalle por **ID** y por **slug**, filtros (opcional).
- 💬 **Chat**: tiempo real con nombre de usuario, “está escribiendo…”, validación de token en el handshake.
- 🗄️ **MongoDB/Mongoose**: esquemas y validaciones; índices útiles.
- 🧭 **Estructura limpia** y frontend mínimo en `/public` para probar rápido.

---

## 🚀 Quickstart

### 1) Requisitos
- Node.js 18+
- MongoDB Atlas (recomendado) o Mongo local

### 2) Variables de entorno (`.env` en la raíz)
```env
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/product_portal?retryWrites=true&w=majority
JWT_SECRET=cambia_esto_por_un_secreto_fuerte
PORT=3000
```

> **Atlas**: crea un **Database User**, permite tu IP (`0.0.0.0/0` para dev), copia la cadena **Drivers → Node.js** y añade `/product_portal` al final de la URL.

### 3) Instalar y ejecutar
```bash
npm install
npm run dev   # recarga con nodemon
# o
npm start
```
Abre `http://localhost:3000`.

---

## 🧱 Estructura del proyecto
```
/src
├── /public           # Frontend mínimo (index.html, chat.html, styles, client.js)
├── /routes           # authRoutes, productRoutes (y otros opcionales)
├── /models           # User.js, Product.js
├── /middleware       # authenticateJWT.js (auth y roles)
├── server.js         # Express + Mongoose + Socket.IO
└── config.js (si usas ESM) o .env (CommonJS)
```

---

## 🔑 Autenticación y Roles

- **Registro**: `POST /api/auth/register` → `{ token, user }`
- **Login**: `POST /api/auth/login` → `{ token, user }`
- **Yo**: `GET /api/auth/me` con `Authorization: Bearer <token>`

**Roles:**
- `user`: puede **ver** productos y acceder al **chat**.
- `admin`: además, **crear, editar y eliminar** productos.

---

## 🪴 API de Productos (REST)

- `GET /api/products` — listado (público)
- `GET /api/products/:id` — detalle por ID
- `GET /api/products/slug/:slug` — detalle por slug (SEO)
- `POST /api/products` — **admin**
- `PUT /api/products/:id` — **admin**
- `DELETE /api/products/:id` — **admin**

**Modelo Product (resumen):**
```js
{
  name, slug, price,
  images: [url],
  shortDesc, description,
  categories: [String],
  care: { light: 'baja|media|alta', watering: 'poco|medio|frecuente', temp },
  size: 'S|M|L',
  stock, rating, reviewCount, badges: [String]
}
```

> Extensiones opcionales: `/featured`, `/related`, filtros/orden/paginación por query params.

---

## 💬 Chat (Socket.IO)

- **Handshake seguro**: el cliente envía `auth: { token }`, el servidor valida con JWT.
- Eventos ejemplo:
  - `chat:message` → broadcast con `{ user, text, ts }`
  - `chat:typing` → indicador de “está escribiendo…”
- Vista mínima en `src/public/chat.html` (requiere sesión).

---

## 🧪 Probar con Postman (sugerido)

1. **Register (admin)** — `POST /api/auth/register`
2. **Login** — guarda el `token` como variable `{{token}}`
3. **Me** — `GET /api/auth/me` con Bearer `{{token}}`
4. **Crear producto** — `POST /api/products` (Bearer `{{token}}` de admin)
5. **Listar** — `GET /api/products`
6. **Editar/Eliminar** — `PUT`/`DELETE /api/products/:id` (admin)

> En la **Collection** pon autorización de tipo **Bearer Token** = `{{token}}` para no repetirlo en cada request.

---

## 🛫 Despliegue

- **Backend + frontend juntos** en **Render/Railway/Fly** (recomendado).  
  - Variables: `MONGO_URI`, `JWT_SECRET`, `PORT` (usa el que provee el PaaS).
- **MongoDB**: usa **Atlas M0** (gratis). Deja `0.0.0.0/0` durante dev; luego restringe.
- **Netlify/Vercel** (solo frontend): separar backend en un PaaS y configurar CORS.

---

## ✅ Checklist (rúbrica)

- [x] Autenticación JWT correcta (login/register/me)
- [x] Roles y permisos (user/admin)
- [x] CRUD de productos conectado a MongoDB
- [x] Chat integrado para usuarios autenticados
- [x] Código estructurado y claro
- [x] Documentación básica (este README ✨)

**Extras sugeridos**: persistir historial de chat con TTL, subida de imágenes (Cloudinary), UI con diseño propio o framework CSS, despliegue en cloud.

---

## 🛠️ Troubleshooting
- **`bad auth` en Mongo**: revisa Database User/Password y Network Access (`0.0.0.0/0`). Asegura `/product_portal` en la URI.
- **`401 Token inválido`**: envía `Authorization: Bearer <token>` y verifica `JWT_SECRET` en prod/dev.
- **CORS**: si separas front y back, activa `cors()` y define `origin` si hace falta.
- **Sockets**: el cliente debe enviar `auth: { token }`; en el server, valida con `io.use(...)` + `jwt.verify`.

---

## 📜 Licencia
Uso académico/educativo. Adáptalo libremente para tus prácticas.

---

### 🌱 Nombre del proyecto
**A Priori Verde**
