import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

// Datos de donación. Provisionales: se sustituyen con las variables
// VITE_BIZUM_TELEFONO, VITE_IBAN y VITE_TITULAR_CUENTA al desplegar.
const BIZUM = import.meta.env.VITE_BIZUM_TELEFONO || '600 000 000';
const IBAN = import.meta.env.VITE_IBAN || 'ES00 0000 0000 0000 0000 0000';
const TITULAR = import.meta.env.VITE_TITULAR_CUENTA || 'Hermandad (provisional)';

function FilaDato({ etiqueta, valor }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el usuario puede seleccionar el texto.
    }
  }

  return (
    <div className="dona-dato">
      <span className="stat-label">{etiqueta}</span>
      <strong>{valor}</strong>
      <button type="button" className="btn btn-secondary" onClick={copiar}>
        {copiado ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}

export default function DonaDesdeCasa() {
  const [qr, setQr] = useState('');

  // El QR lleva a esta misma página, donde se muestran el Bizum y la cuenta.
  useEffect(() => {
    QRCode.toDataURL(window.location.href, { width: 240, margin: 1, color: { dark: '#12294f' } })
      .then(setQr)
      .catch(() => setQr(''));
  }, []);

  return (
    <div className="page page-narrow dona-page">
      <h1>Dona desde casa</h1>
      <p className="page-subtitle">
        Si no puedes encontrarnos en la calle, puedes ayudar igualmente por Bizum o con una
        transferencia. Escanea el código QR con tu móvil para ver los datos.
      </p>

      {qr && (
        <div className="card dona-qr">
          <img src={qr} alt="Código QR con los datos para donar" width="240" height="240" />
          <span className="stat-label">Escanéalo para abrir esta página en tu móvil</span>
        </div>
      )}

      <div className="card dona-datos">
        <h2>Bizum</h2>
        <FilaDato etiqueta="Teléfono" valor={BIZUM} />
        <h2>Transferencia bancaria</h2>
        <FilaDato etiqueta="IBAN" valor={IBAN} />
        <p className="page-subtitle">Titular: {TITULAR}</p>
        <p className="page-subtitle">En el concepto escribe «Recogida solidaria».</p>
      </div>
    </div>
  );
}
