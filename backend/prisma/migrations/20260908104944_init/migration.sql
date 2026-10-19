-- CreateTable
CREATE TABLE "recolectores" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dni_ultimos_digitos" TEXT NOT NULL,
    "hermandad" TEXT NOT NULL,
    "zona_texto" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'recolector',
    "fecha_alta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "recolectores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos_recogida" (
    "id" SERIAL NOT NULL,
    "recolector_id" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),
    "total_efectivo_esperado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_efectivo_entregado" DOUBLE PRECISION,
    "total_tarjeta" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cerrado" BOOLEAN NOT NULL DEFAULT false,
    "notas_cierre" TEXT,

    CONSTRAINT "turnos_recogida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donaciones" (
    "id" SERIAL NOT NULL,
    "recolector_id" INTEGER NOT NULL,
    "turno_id" INTEGER NOT NULL,
    "metodo_pago" TEXT NOT NULL,
    "importe_total" DOUBLE PRECISION NOT NULL,
    "importe_recibido_efectivo" DOUBLE PRECISION,
    "confirmacion_datafono" BOOLEAN NOT NULL DEFAULT false,
    "nombre_donante" TEXT,
    "email_donante" TEXT,
    "email_agradecimiento_enviado" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donacion_lineas" (
    "id" SERIAL NOT NULL,
    "donacion_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "donacion_lineas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recolectores_email_key" ON "recolectores"("email");

-- AddForeignKey
ALTER TABLE "turnos_recogida" ADD CONSTRAINT "turnos_recogida_recolector_id_fkey" FOREIGN KEY ("recolector_id") REFERENCES "recolectores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_recolector_id_fkey" FOREIGN KEY ("recolector_id") REFERENCES "recolectores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_turno_id_fkey" FOREIGN KEY ("turno_id") REFERENCES "turnos_recogida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donacion_lineas" ADD CONSTRAINT "donacion_lineas_donacion_id_fkey" FOREIGN KEY ("donacion_id") REFERENCES "donaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donacion_lineas" ADD CONSTRAINT "donacion_lineas_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

