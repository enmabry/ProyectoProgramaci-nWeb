# Docker

## Servicios

`docker-compose.yml` levanta:
- mongo (puerto 27017)
- backend (Node/Express + Socket.IO, puerto 3000)
- frontend (Nginx sirviendo build Vite, puerto 8080 → 80 interno)

## Pasos básicos

```powershell
docker compose build
docker compose up -d
docker compose exec backend npm run seed:admin
docker compose exec backend npm run seed:products
```

SPA: http://localhost:8080  |  API/WS: http://localhost:3000

## Variables

Ver `.env.example` y `docs/ENVIRONMENT.md`.

## Semillas

Dentro del contenedor backend: `npm run seed:admin`, `npm run seed:products`.

## Desarrollo (opcional)

Montar volumen del backend (descomentar en compose) para hot reload si se usa nodemon.

## Limpieza

```powershell
docker compose down          # detener
docker compose down -v       # detener y borrar datos Mongo
docker image prune           # borrar imágenes huérfanas
```

## Proxy y WebSockets

- Nginx proxyea `/api/*` y `/socket.io/*` a backend.
- Llamadas en frontend deben usar rutas relativas (`/api/...`).
