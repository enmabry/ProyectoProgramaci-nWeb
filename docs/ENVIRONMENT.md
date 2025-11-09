# Variables de Entorno

Configura un archivo `.env` en la raíz (ver `.env.example`).

## Básicas

- `PORT` (default 3000): puerto del backend.
- `MONGO_URI`: cadena de conexión a MongoDB.
- `JWT_SECRET`: secreto para firmar JWT (usa uno largo y seguro).

## Cloudinary (uploads)

- `CLOUDINARY_URL`: `cloudinary://<api_key>:<api_secret>@<cloud_name>`

## Email (reset de contraseña)

- `EMAIL_DEV_MODE` (`true|false`): si `true`, no envía email y retorna el token en la respuesta para pruebas.
- `ETHEREAL_MODE` (`true|false`): usa cuenta temporal de Ethereal si no hay SMTP real.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`: credenciales SMTP reales.
- `CLIENT_URL`: base URL del cliente para generar enlaces de reset.

## Frontend (build)

- `VITE_API_BASE` (opcional): base URL para conectar Socket.IO y API en despliegue.

## Docker

- En `docker-compose.yml`, `MONGO_URI` apunta a `mongodb://mongo:27017/aprioriverde` por defecto.
