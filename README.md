# App de gestión de recogidas de alimentos benéficas

Sustituye la recogida física de alimentos por un modelo de **donación virtual**: el
donante "compra" productos de un catálogo a precio de mercado y paga con tarjeta
(datáfono físico de la hermandad) o en efectivo. La app registra la donación; es la
organización quien compra después los alimentos a proveedores con trazabilidad
garantizada. **La app no es una pasarela de pago** — no procesa tarjetas.

## Estructura

- [backend/](backend/) — API REST en Node.js + Express + Prisma (SQLite en desarrollo).
- [frontend/](frontend/) — SPA en React (Vite) + React Router.

## Puesta en marcha (desarrollo)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # revisa/edita los valores, sobre todo JWT_SECRET y SMTP
npm run prisma:migrate    # crea la BBDD SQLite y aplica el esquema
npm run seed               # catálogo de productos + usuario admin de ejemplo
npm run dev                 # arranca en http://localhost:4000
```

Usuario administrador de ejemplo (definido en `.env`, `ADMIN_EMAIL`/`ADMIN_PASSWORD`):
`admin@hermandad.local` / `CambiaEstaClave123!` — **cámbialo antes de producción**.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL debe apuntar al backend
npm run dev                 # arranca en http://localhost:5173
```

## Roles

- **Recolector**: se registra, abre un turno, registra donaciones y lo cierra.
- **Administrador**: gestiona recolectores, catálogo de productos, ve todos los
  turnos y exporta informes en CSV. Se marca con `rol: "admin"` en la tabla de
  recolectores (no hay una tabla separada de administradores).
- **Público**: panel de transparencia en `/transparencia`, sin login ni datos
  personales.

## Notas de diseño

- SQLite no soporta enums nativos en Prisma: los campos "enum" del modelo de datos
  original (`categoria`, `metodoPago`, `rol`) se guardan como `String` y se validan
  en la capa de aplicación (`backend/src/utils/enums.js`). Al migrar a PostgreSQL
  se pueden convertir a enums nativos sin cambiar la forma de los datos.
- El correo de agradecimiento se envía de forma asíncrona tras responder al
  cliente, y si SMTP no está configurado se omite sin romper el flujo.
- El endpoint de exportación CSV requiere JWT de administrador, así que el
  frontend lo descarga como blob autenticado en vez de usar un enlace directo.

Ver el resto de detalles funcionales en el briefing original del proyecto.
