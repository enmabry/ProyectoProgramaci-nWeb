# Sistema de Autenticación y Roles

## 🔐 Roles de Usuario

### Cliente Normal (role: 'user')
**Acceso permitido:**
- ✅ `/` - Dashboard principal
- ✅ `/catalog` - Catálogo de productos
- ✅ `/product/:slug` - Detalles de producto
- ✅ `/cart` - Carrito de compras

**Acceso denegado:**
- ❌ `/admin` - Panel de administración (redirige a `/`)

### Administrador (role: 'admin')
**Acceso permitido:**
- ✅ `/admin` - Panel de administración (ruta por defecto)
- ✅ `/catalog` - Ver catálogo de productos
- ✅ `/product/:slug` - Ver detalles de producto

**Acceso denegado:**
- ❌ `/` - Dashboard de cliente (redirige a `/admin`)
- ❌ `/cart` - Carrito (no visible en navbar)

## 🚀 Flujo de Autenticación

### Login
1. Usuario ingresa credenciales en `/login`
2. Backend valida y retorna token JWT + datos de usuario
3. Frontend determina redirección según rol:
   - **Admin** → `/admin`
   - **Cliente** → `/`

### Navegación
- **Logo "A PRIORI • VERDE"**:
  - Admin: redirige a `/admin`
  - Cliente: redirige a `/`

- **Navbar para Admin**:
  - Tienda (catálogo)
  - Panel Admin
  - Avatar con menú (Salir)
  - ❌ No muestra carrito

- **Navbar para Cliente**:
  - Tienda
  - Sobre Nosotros
  - Contacto
  - Carrito con badge contador
  - Avatar con menú (Salir)

## 👤 Credenciales de Administrador

Para crear el usuario admin, ejecutar:
```bash
npm run seed:admin
```

**Credenciales por defecto:**
- Email: `admin@aprioriverde.com`
- Username: `admin`
- Password: `Admin123`
- Role: `admin`

## 🔒 Componentes de Protección

### `ProtectedRoute`
Protege rutas de cliente normal. Si el usuario es admin, redirige a `/admin`.

### `AdminRoute`
Solo permite acceso a usuarios con `role: 'admin'`. Redirige a `/login` si no está autenticado, o a `/` si no es admin.

### `PublicAuthRoute`
Permite acceso a usuarios autenticados (admin o cliente). Útil para rutas compartidas como el catálogo.

### `GuestRoute`
Solo para usuarios no autenticados. Al hacer login redirige según el rol.

## 📝 Notas Importantes

1. Los administradores NO tienen carrito de compras
2. Los administradores NO pueden acceder al dashboard de cliente
3. Los clientes NO pueden acceder al panel de administración
4. Ambos roles pueden ver el catálogo y detalles de productos
5. El token JWT se almacena en `localStorage` y se incluye en todas las peticiones protegidas
