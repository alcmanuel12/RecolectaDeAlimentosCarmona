-- CreateTable
CREATE TABLE "recolectores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dni_ultimos_digitos" TEXT NOT NULL,
    "hermandad" TEXT NOT NULL,
    "zona_texto" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'recolector',
    "fecha_alta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "turnos_recogida" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recolector_id" INTEGER NOT NULL,
    "fecha_inicio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" DATETIME,
    "total_efectivo_esperado" REAL NOT NULL DEFAULT 0,
    "total_efectivo_entregado" REAL,
    "total_tarjeta" REAL NOT NULL DEFAULT 0,
    "cerrado" BOOLEAN NOT NULL DEFAULT false,
    "notas_cierre" TEXT,
    CONSTRAINT "turnos_recogida_recolector_id_fkey" FOREIGN KEY ("recolector_id") REFERENCES "recolectores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "productos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "precio" REAL NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "donaciones" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recolector_id" INTEGER NOT NULL,
    "turno_id" INTEGER NOT NULL,
    "metodo_pago" TEXT NOT NULL,
    "importe_total" REAL NOT NULL,
    "importe_recibido_efectivo" REAL,
    "confirmacion_datafono" BOOLEAN NOT NULL DEFAULT false,
    "nombre_donante" TEXT,
    "email_donante" TEXT,
    "email_agradecimiento_enviado" BOOLEAN NOT NULL DEFAULT false,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "donaciones_recolector_id_fkey" FOREIGN KEY ("recolector_id") REFERENCES "recolectores" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "donaciones_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turnos_recogida" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "donacion_lineas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "donacion_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" REAL NOT NULL,
    CONSTRAINT "donacion_lineas_donacion_id_fkey" FOREIGN KEY ("donacion_id") REFERENCES "donaciones" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "donacion_lineas_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "recolectores_email_key" ON "recolectores"("email");
