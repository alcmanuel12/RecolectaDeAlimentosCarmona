import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerTransparencia } from '../api/publico';

const FORMATO_EUROS = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Landing() {
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    obtenerTransparencia()
      .then(setDatos)
      .catch(() => setDatos(null));
  }, []);

  return (
    <div className="landing">
      <div className="landing-kicker">Consejo de Hermandades y Cofradías de Carmona</div>
      <h1 className="landing-title">
        Este año la
        <br />
        recogida es
        <br />
        en euros
      </h1>
      <p className="landing-lead">
        La normativa impide recoger alimentos en mano. El Consejo de Hermandades y Cofradías de
        Carmona recauda el importe de cada producto y lo entrega a las organizaciones que lo
        compran y lo reparten.
      </p>

      {datos && (
        <div className="landing-figures">
          <div>
            <div className="stat-label">Recaudado</div>
            <div className="landing-figure">{FORMATO_EUROS.format(datos.totalRecaudado)} €</div>
          </div>
          <div>
            <div className="stat-label">Donaciones registradas</div>
            <div className="landing-figure">{datos.numeroDonaciones.toLocaleString('es-ES')}</div>
          </div>
        </div>
      )}

      <div className="landing-cta">
        <Link className="btn btn-primary btn-block" to="/transparencia">
          Ver las cuentas de la campaña
        </Link>
        <Link className="btn btn-secondary btn-block" to="/login">
          Soy recolector · entrar
        </Link>
      </div>

      <div className="landing-note">
        La app no procesa pagos con tarjeta. Los cobros se hacen con el datáfono físico de la
        hermandad, y cada donación queda firmada por el recolector que la registra.
      </div>
    </div>
  );
}
