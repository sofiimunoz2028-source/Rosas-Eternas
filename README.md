# Rosas Eternas

PWA para promocionar y vender regalos de cinta fantasía. Frontend en React + Tailwind (Vercel). API en Node.js + Express. Base de datos MySQL en Clever Cloud.

## Arranque local

1. Crea `backend-rosas-eternas/.env` a partir de `.env.example` (host, usuario, clave y JWT).
2. Crea `frontend-rosas-eternas/.env` a partir de `.env.example`.
3. En el backend:

```bash
cd backend-rosas-eternas
npm install
npm run db:seed
npm run dev
```

Si `db:seed` falla con `ETIMEDOUT`, el colegio o Clever Cloud están bloqueando el puerto 3306. En el add-on de MySQL autoriza tu IP pública (o `0.0.0.0/0` solo para pruebas) y, si sigue fallando, importa `src/scripts/seed-listo.sql` (se genera al correr el seed) desde la consola SQL de Clever Cloud.

4. En el frontend:

```bash
cd frontend-rosas-eternas
npm install
npm run dev
```

Cuentas de prueba (después del seed):

- Administrador: `admin@rosaseternas.test` / `AdminRosas2026!`
- Cliente: `cliente@rosaseternas.test` / `ClienteRosas2026!`

## Despliegue en Vercel

Un solo proyecto (por ejemplo `https://rosas-eternas-olive.vercel.app`):

1. **Root Directory** vacío (la raíz del repositorio, no `backend-rosas-eternas`).
2. Variables: las de MySQL de Clever Cloud, `JWT_SECRET`, `FRONTEND_ORIGIN=https://rosas-eternas-olive.vercel.app` y `NODE_ENV=production`.
3. La PWA queda en `/` y la API en `/api` (por ejemplo `/api/salud`).

En Clever Cloud, MySQL suele exigir que la IP del servidor esté autorizada. Si la API en Vercel no conecta, habilita conexiones externas o usa un host con IP estable.

## Seguridad

No subas archivos `.env`. Si una clave de base de datos se pegó en un chat o captura, cámbiala en Clever Cloud.
