# Guía de Desarrollo

## Modo recomendado: Docker

Este proyecto está configurado para trabajar con Docker Compose, que levanta MongoDB, backend y frontend en contenedores aislados.

### Comandos principales

**Iniciar todo**
```powershell
docker compose up -d
```
- Frontend: http://localhost:8080
- Backend/API: http://localhost:3000
- MongoDB: puerto 27017

**Ver logs en tiempo real**
```powershell
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongo
```

**Reiniciar un servicio (ej: tras cambios en código)**
```powershell
docker compose restart backend
```

**Reconstruir tras cambios en dependencias o Dockerfile**
```powershell
docker compose build
docker compose up -d
```

**Detener todo**
```powershell
docker compose down
```

**Detener y borrar datos (¡cuidado, borra MongoDB!)**
```powershell
docker compose down -v
```

### Semillas (datos de ejemplo)

**Crear usuario admin**
```powershell
docker compose exec backend npm run seed:admin
```
Credenciales por defecto: revisa `src/seed/createAdmin.js`

**Poblar productos**
```powershell
docker compose exec backend npm run seed:products
```

**Limpiar productos**
```powershell
docker compose exec backend npm run seed:products:clear
```

### Ver datos en MongoDB

```powershell
# Conectar a shell de Mongo
docker compose exec mongo mongosh

# Luego dentro del shell:
use aprioriverde
db.users.find().pretty()
db.products.find().limit(5).pretty()
db.chats.find().pretty()
```

### Troubleshooting común

**Contenedores pausados (timeout en login)**
```powershell
docker compose unpause
```

**Puerto 3000 ocupado por otro proceso**
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000

# Matar proceso (reemplaza <PID> con el número de la columna final)
taskkill /PID <PID> /F

# O simplemente baja Docker y vuelve a levantar
docker compose down
docker compose up -d
```

**Backend no responde tras cambios**
```powershell
# Reconstruir imagen
docker compose build backend
docker compose up -d backend
```

**Resetear todo (fresh start)**
```powershell
docker compose down -v
docker compose build
docker compose up -d
docker compose exec backend npm run seed:admin
docker compose exec backend npm run seed:products
```

### Modo desarrollo local (opcional)

Si prefieres editar código y ver cambios sin reconstruir Docker constantemente:

**Opción 1: Solo Mongo en Docker**
```powershell
docker compose -f docker-compose.dev.yml up -d
npm run dev
cd client; npm run dev
```
Ajusta `.env`: `MONGO_URI=mongodb://localhost:27017/aprioriverde`

**Opción 2: Hot reload en Docker (no implementado por defecto)**
Descomentar volúmenes en `docker-compose.yml`:
```yaml
backend:
  volumes:
    - ./src:/app/src
```
Cambiar CMD a `nodemon src/server.js`

### Variables de entorno

Ver `docs/ENVIRONMENT.md` y `.env.example`.

En Docker, las variables se toman de `.env` y se sobrescriben en `docker-compose.yml` según sea necesario (ej: `MONGO_URI` apunta al servicio `mongo`).

### Acceso a logs detallados

```powershell
# Backend: errores, rutas, Socket.IO
docker compose logs backend --tail=100 -f

# Frontend (Nginx): peticiones HTTP
docker compose logs frontend --tail=50 -f
```

### Flujo típico de trabajo

1. Levantar stack: `docker compose up -d`
2. Verificar health: http://localhost:3000/api/health
3. Abrir app: http://localhost:8080
4. Hacer cambios en código
5. Reconstruir si es necesario: `docker compose build backend`
6. Reiniciar: `docker compose restart backend`
7. Ver logs: `docker compose logs -f backend`
8. Al terminar: `docker compose down` (o dejar corriendo)

### Atajos útiles

```powershell
# Alias para PowerShell (opcional, añadir a $PROFILE)
function dc { docker compose $args }
function dcl { docker compose logs -f $args }
function dcr { docker compose restart $args }

# Uso:
dc up -d
dcl backend
dcr backend
```

### Próximos pasos

- Panel admin: http://localhost:8080/admin (usuario admin)
- Chat: popup en esquina inferior derecha (usuarios)
- Conversaciones: pestaña en panel admin

