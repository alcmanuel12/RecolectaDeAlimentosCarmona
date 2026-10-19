# App de gestión de recogidas de alimentos benéficas

Sustituye la recogida física de alimentos por un modelo de **donación virtual**: el
donante "compra" productos de un catálogo a precio de mercado y paga con tarjeta
(datáfono físico de la hermandad) o en efectivo. La app registra la donación; es la
organización quien compra después los alimentos a proveedores con trazabilidad
garantizada. **La app no es una pasarela de pago** — no procesa tarjetas.

## Estructura

- [backend/](backend/) — API REST en Node.js + Express + Prisma (PostgreSQL).
- [frontend/](frontend/) — SPA en React (Vite) + React Router.

## Puesta en marcha (desarrollo)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # revisa/edita los valores, sobre todo DATABASE_URL, JWT_SECRET y SMTP
npm run prisma:migrate    # aplica el esquema en PostgreSQL (la BBDD debe existir)
npm run seed               # catálogo de productos + usuarios de prueba
npm run dev                 # arranca en http://localhost:4000
```

Usuarios de prueba (definidos en `.env`, `ADMIN_*` y `RECOLECTOR_*`):

| Rol        | Email                 | Contraseña |
|------------|-----------------------|------------|
| Admin      | `admin@admin.com`     | `12345678` |
| Recolector | `usuario@usuario.com` | `12345678` |

**Cámbialos antes de producción.**

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL debe apuntar al backend
npm run dev                 # arranca en http://localhost:5173
```

## Roles

- **Recolector**: lo da de alta un administrador (no hay registro público); abre
  un turno, registra donaciones y lo cierra.
- **Administrador**: gestiona recolectores, catálogo de productos, ve todos los
  turnos y exporta informes en CSV. Se marca con `rol: "admin"` en la tabla de
  recolectores (no hay una tabla separada de administradores).
- **Público**: panel de transparencia en `/transparencia`, sin login ni datos
  personales.

## Notas de diseño

- Los campos "enum" del modelo de datos (`categoria`, `metodoPago`, `rol`) se
  guardan como `String` y se validan en la capa de aplicación
  (`backend/src/utils/enums.js`); se pueden convertir a enums nativos de
  PostgreSQL sin cambiar la forma de los datos.
- El correo de agradecimiento se envía de forma asíncrona tras responder al
  cliente, y si SMTP no está configurado se omite sin romper el flujo.
- El endpoint de exportación CSV requiere JWT de administrador, así que el
  frontend lo descarga como blob autenticado en vez de usar un enlace directo.

Ver el resto de detalles funcionales en el briefing original del proyecto.
