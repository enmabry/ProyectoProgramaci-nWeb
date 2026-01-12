# Práctica 2 - E-commerce con GraphQL

## Descripción General

Implementación de un **sistema de gestión de órdenes de compra** con **GraphQL** como capa de API principal. Los usuarios pueden realizar compras con un flujo completo (carrito → checkout → modal de pago), mientras que los administradores pueden gestionar productos, usuarios y órdenes desde un panel centralizado.

---

## 1. GraphQL API (Apollo Server)

### Configuración Base

**Archivo:** `src/server.js` y `src/graphql/`

Apollo Server está configurado en Express con:
- **Endpoint:** `/graphql`
- **Autenticación:** JWT en header `Authorization: Bearer {token}`
- **Context:** Extrae el usuario del token JWT

```javascript
// server.js
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers: {
    DateTime: dateTimeScalar,
    ...resolvers
  },
  context: ({ req }) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    let user = null;
    if (token) {
      try {
        user = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        console.log('Token inválido en GraphQL');
      }
    }
    return { user, token };
  }
});
```

### Scalar DateTime

**Archivo:** `src/graphql/scalars.js`

Scalar personalizado que convierte automáticamente Date objects de Mongoose a ISO strings:

```javascript
const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return null;
  }
});
```

---

## 2. Product Queries (GraphQL)

**Archivo:** `src/graphql/resolvers/productResolvers.js`

Operaciones disponibles:

| Query | Descripción | Parámetros |
|-------|-------------|-----------|
| `products()` | Obtiene todos los productos | `limit`, `skip`, `category` |
| `productById(id)` | Obtiene un producto por ID | `id` (required) |
| `productBySlug(slug)` | Obtiene producto por slug URL | `slug` (required) |
| `productsByCategory()` | Filtra por categoría | `category` (required) |
| `searchProducts(query)` | Búsqueda por texto | `query` (required) |
| `featuredProducts()` | Obtiene destacados | `limit` |

**Ejemplo de uso:**
```graphql
query {
  products(limit: 10, category: "plantas") {
    id
    name
    price
    images { url }
  }
}
```

---

## 3. Order Model

**Archivo:** `src/models/Order.js`

Esquema MongoDB con campos:

```javascript
{
  userId: ObjectId,              // Referencia a usuario
  items: [
    {
      productId: ObjectId,
      productName: String,
      quantity: Number,
      price: Number,
      subtotal: Number
    }
  ],
  subtotal: Number,              // Suma de items
  tax: Number,                   // Impuestos (10% en demo)
  shippingCost: Number,          // $0 si > 100, $10 si < 100
  total: Number,                 // subtotal + tax + shipping
  status: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String,
    country: String
  },
  paymentMethod: String,         // 'credit_card', 'debit_card', etc
  paymentStatus: String,
  notes: String,
  timestamps: createdAt, updatedAt,
  statusDates: confirmedAt, shippedAt, deliveredAt, cancelledAt
}
```

**Método updateStatus:**
```javascript
OrderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  // Actualiza timestamps automáticamente
  if (newStatus === 'confirmed') this.confirmedAt = new Date();
  if (newStatus === 'shipped') this.shippedAt = new Date();
  if (newStatus === 'delivered') this.deliveredAt = new Date();
  if (newStatus === 'cancelled') this.cancelledAt = new Date();
  
  return this; // Retorna sin guardar (el resolver hace save())
};
```

---

## 4. Order Queries (GraphQL)

**Archivo:** `src/graphql/resolvers/orderResolvers.js`

### Queries

| Query | Descripción | Autenticación | Parámetros |
|-------|-------------|----------------|-----------|
| `orders()` | Lista todas las órdenes | Admin | `status`, `limit`, `skip` |
| `orderById(id)` | Obtiene detalles de una orden | Admin o propietario | `id` |
| `userOrders(userId)` | Obtiene órdenes del usuario | Usuario o Admin | `userId`, `limit` |

### Mutations

| Mutation | Descripción | Autenticación | Parámetros |
|----------|-------------|----------------|-----------|
| `createOrder()` | Crea una nueva orden | Autenticado | `items`, `shippingAddress`, `paymentMethod` |
| `updateOrderStatus()` | Cambia estado de orden | Admin | `id`, `status` |
| `cancelOrder()` | Cancela una orden | Admin o propietario | `id` |

**Ejemplo GraphQL:**
```graphql
mutation {
  createOrder(
    items: [
      { productId: "123", quantity: 2 }
    ],
    shippingAddress: {
      fullName: "Juan Pérez",
      phone: "3001234567",
      address: "Calle 1 #23",
      city: "Bogotá",
      postalCode: "110111",
      country: "Colombia"
    },
    paymentMethod: "credit_card",
    notes: "Entrega en la tarde"
  ) {
    id
    total
    status
  }
}
```

---

## 5. CartPage - Checkout Completo

**Archivo:** `client/src/pages/CartPage.jsx`

### Flujo de Compra

1. **Visualizar carrito** - Tabla con productos, cantidades, precios
2. **Formulario de envío** - 6 campos requeridos:
   - Nombre completo
   - Teléfono
   - Dirección
   - Ciudad
   - Código postal
   - País

3. **Hacer clic en "Finalizar compra"** - Valida formulario y abre modal de pago

### Estado Local
```javascript
const [shippingForm, setShippingForm] = useState({
  fullName: user?.username || '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'Colombia'
});

const [processingPayment, setProcessingPayment] = useState(false);
```

### Resumen de Compra
Muestra en tiempo real:
- Total de items
- Subtotal
- Impuesto (10%)
- Costo de envío (calculado)
- Total final

---

## 6. PaymentModal - Stepper de Pago

**Archivo:** `client/src/components/PaymentModal.jsx`

### Estructura de 3 Pasos

**Paso 1: Datos de Tarjeta**
- Tipo de tarjeta (Visa, Mastercard, Amex)
- Nombre del titular
- Número de tarjeta (16 dígitos)

**Paso 2: Verificación**
- Mes de vencimiento (01-12)
- Año de vencimiento (próximos 10 años)
- CVV (3-4 dígitos)
- Aviso: "Esto es una demostración"

**Paso 3: Confirmación**
- Resumen de tarjeta (últimos 4 dígitos)
- Última 4 cifra del titular
- Vencimiento
- **Total a pagar** destacado
- Botón "Confirmar compra"

### Validaciones
```javascript
// Paso 1: Valida formato tarjeta
if (!/^\d{16}$/.test(cardData.cardNumber.replace(/\s/g, ''))) {
  throw 'El número debe tener 16 dígitos';
}

// Paso 2: Valida CVV
if (!/^\d{3,4}$/.test(cardData.cvv)) {
  throw 'CVV debe tener 3 o 4 dígitos';
}
```

### Creación de Orden
Al confirmar, envía **GraphQL mutation** con los datos del pago:

```javascript
const mutation = `mutation {
  createOrder(
    items: [...],
    shippingAddress: {...},
    paymentMethod: "credit_card",
    notes: "Tarjeta: VISA •••• 3456"
  ) { id total status }
}`;
```

Luego redirige a `/profile` para que el usuario vea sus órdenes.

---

## 7. Admin - OrdersTab

**Archivo:** `client/src/components/OrdersTab.jsx`

### Tabla de Órdenes

Columnas mostradas:
| Columna | Tipo | Descripción |
|---------|------|-------------|
| ID Pedido | String | Primeros 8 caracteres |
| Usuario ID | String | ID del usuario que compró |
| Total | Currency | Formateado en COP |
| Estado | Badge | Color según estado |
| Fecha | Date | Formato localizado |
| Acciones | Buttons | Ver detalles, cambiar estado |

### Filtrado por Estado
- Select dropdown con opciones: Todos, Pendiente, Confirmada, Enviada, Entregada, Cancelada
- Actualiza tabla en tiempo real

### Modal de Detalles
Muestra cuando admin hace clic en "Ver detalles":
- ID completo de la orden
- Estado actual
- Fecha de creación
- Productos (nombre, cantidad, precio)
- Dirección de entrega completa
- Desglose de totales

### Cambiar Estado
Botón "Cambiar estado" abre diálogo con Select para elegir nuevo estado:
```javascript
const mutation = `mutation {
  updateOrderStatus(
    id: "${orderId}",
    status: "${newStatus}"
  ) { id status }
}`;
```

---

## 8. ProfilePage - "Mis Pedidos"

**Archivo:** `client/src/pages/ProfilePage.jsx`

### Estructura

**Sección Superior:**
- Título "Mi Perfil"
- Información del usuario (nombre, email)
- Formateado de forma clara

**Tabs:**
- **Mis Pedidos** (activo) - Tabla de órdenes del usuario
- **Configuración** - Placeholder para futuro

### MyOrdersTab

**Archivo:** `client/src/components/MyOrdersTab.jsx`

Tabla similar a OrdersTab pero solo muestra órdenes del usuario actual:

```javascript
const query = `query {
  userOrders(userId: "${user.id}") {
    id
    total
    status
    createdAt
    items { productName quantity price }
    shippingAddress { fullName address city }
  }
}`;
```

**Características:**
- GraphQL query con userId del contexto
- Tabla con estado color-codificado
- Modal de detalles con información completa
- Usuario puede ver actualizaciones en tiempo real

---

## 9. Botón "Añadir al Carrito"

### ProductDetailPage

**Archivo:** `client/src/pages/ProductDetailPage.jsx` (línea ~241)

```jsx
<Button 
  colorScheme="brand" 
  size="lg" 
  onClick={() => {
    addToCart(product);
    toast({ title: 'Agregado al carrito' });
  }}
>
  Añadir al carrito
</Button>
```

### CatalogPage

**Archivo:** `client/src/pages/CatalogPage.jsx`

Actualizado para agregar directamente sin navegar:

```jsx
function ProductTile({ p }) {
  const { addToCart } = useCart();
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(p);
    toast({ title: 'Agregado al carrito' });
  };
  
  return (
    <Box as={Link} to={`/product/${p.slug}`}>
      {/* ... contenido ... */}
      <Button onClick={handleAddToCart}>Añadir al carrito</Button>
    </Box>
  );
}
```

El evento `onClick` previene la navegación y agrega el producto al CartContext.

---

## 10. Flujo Completo de Compra

```
1. Usuario en CatalogPage o ProductDetailPage
   ↓
2. Hace clic en "Añadir al carrito"
   ↓ CartContext actualiza estado local
3. Navega a /cart
   ↓
4. Ve carrito, rellena formulario de envío
   ↓
5. Hace clic en "Finalizar compra"
   ↓ Valida formulario
6. Se abre PaymentModal
   ↓
7. Completa 3 pasos del stepper
   ↓
8. Hace clic en "Confirmar compra"
   ↓
9. Envía GraphQL mutation createOrder
   ↓ Servidor crea documento en MongoDB
10. Redirige a /profile
   ↓
11. Usuario ve su orden en "Mis Pedidos"
   ↓
12. Admin en /admin → Pedidos
   ↓
13. Admin ve la orden y puede cambiar estado
```

---

## 11. Cambios en Autenticación

**Archivo:** `src/routes/authRoutes.js`

Se agregó `email` al JWT para que esté disponible en todas las sesiones:

```javascript
const sign = (u) => jwt.sign(
  { 
    id: u._id, 
    username: u.username, 
    email: u.email,      // ← NUEVO
    role: u.role 
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

También se retorna en login y register:
```javascript
res.json({ 
  token: sign(user), 
  user: { 
    id: user._id, 
    username: user.username, 
    email: user.email,   // ← NUEVO
    role: user.role 
  }
});
```

---

## 12. Stack Tecnológico

### Backend
- **Node.js** + **Express 5.1.0**
- **Apollo Server 3.13.0** (GraphQL)
- **Mongoose 8.19.3** (MongoDB)
- **JWT** para autenticación
- **bcryptjs** para hashing de contraseñas
- **Nodemailer** para emails
- **Cloudinary** para imágenes

### Frontend
- **React** + **Vite**
- **Chakra UI** para componentes
- **React Router** para navegación
- **Socket.io-client** para chat en tiempo real

### Base de Datos
- **MongoDB Atlas** en la nube
- Colecciones: `users`, `products`, `orders`, `chats`

---

## 13. Endpoints GraphQL Disponibles

### Para Productos
```graphql
query {
  products(limit: 10, skip: 0, category: "plantas") { id name price }
  productById(id: "123") { id name description }
  productBySlug(slug: "monstera-deliciosa") { id name }
  searchProducts(query: "monstera") { id name }
}
```

### Para Órdenes
```graphql
query {
  orders(status: "pending", limit: 20) { id total status }
  orderById(id: "order123") { id items { productName } }
  userOrders(userId: "user123") { id status }
}

mutation {
  createOrder(
    items: [{productId: "123", quantity: 2}],
    shippingAddress: {...},
    paymentMethod: "credit_card"
  ) { id total }
  
  updateOrderStatus(id: "order123", status: "shipped") { id status }
  cancelOrder(id: "order123") { id status }
}
```

---

## 14. Variables de Entorno Requeridas

```env
# Backend (.env en raíz)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/plantas
JWT_SECRET=your_secret_key
PORT=3000

# Frontend (.env.local en /client)
VITE_SOCKET_URL=http://localhost:3000
```

---

## Conclusión

Esta Práctica 2 implementa un **sistema e-commerce profesional** con:
- ✅ GraphQL como API moderna
- ✅ Gestión de órdenes completa
- ✅ Flujo de compra intuitivo
- ✅ Panel administrativo funcional
- ✅ Autenticación y autorización
- ✅ Datos en tiempo real

