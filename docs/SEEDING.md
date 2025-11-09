# Seeding

Scripts para poblar datos de ejemplo y crear el usuario administrador.

## Scripts disponibles

- `npm run seed:admin` crea un usuario admin (si no existe) con credenciales por defecto definidas en el script.
- `npm run seed:products` inserta productos de demostración (10 plantas con imágenes y categorías).
- `npm run seed:products:clear` borra los productos actuales y vuelve a insertar (o limpia si usas `clear`).

## Uso en entorno local

```bash
npm run seed:admin
npm run seed:products
```

## Uso en Docker

```powershell
docker compose exec backend npm run seed:admin
docker compose exec backend npm run seed:products
```

## Consideraciones

- Los scripts asumen conexión a la base definida en `MONGO_URI` de `.env`.
- Si cambias el modelo de `Product`, ajusta el payload del seeder.
- Para entornos productivos considera eliminar los seeders o protegerlos tras una flag.

## Próximas mejoras

- Seed condicional según variable de entorno (`SEED_ON_START=true`).
- Script unificado que pregunte acción (crear admin, productos, limpiar todo).
