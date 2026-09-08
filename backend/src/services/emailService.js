const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(
      '[emailService] SMTP no configurado (faltan variables de entorno). ' +
        'Los correos de agradecimiento se omitirán.'
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

/**
 * Envía el correo de agradecimiento por una donación. Pensado para llamarse
 * de forma asíncrona (fire-and-forget) desde el controlador de donaciones,
 * sin bloquear la respuesta al cliente.
 */
async function enviarAgradecimiento({ email, nombre, importeTotal, lineas }) {
  const t = getTransporter();
  if (!t) return { enviado: false, motivo: 'SMTP no configurado' };

  const detalle = lineas
    .map((l) => `- ${l.cantidad} x ${l.producto?.nombre ?? 'producto'} (${l.precioUnitario.toFixed(2)} €/ud)`)
    .join('\n');

  const asunto = '¡Gracias por tu donación!';
  const texto = `Hola${nombre ? ' ' + nombre : ''},

Muchas gracias por tu donación de ${importeTotal.toFixed(2)} €. Gracias a tu ayuda podemos
seguir comprando alimentos con garantía de trazabilidad para quienes más lo necesitan.

Detalle de tu donación:
${detalle}

Un saludo y gracias de corazón.`;

  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: asunto,
      text: texto,
    });
    return { enviado: true };
  } catch (err) {
    console.error('[emailService] Error enviando correo de agradecimiento:', err.message);
    return { enviado: false, motivo: err.message };
  }
}

module.exports = { enviarAgradecimiento };
