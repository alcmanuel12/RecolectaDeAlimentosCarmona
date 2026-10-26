import { Link } from 'react-router-dom';

const DATOS = [
  { cifra: '1 de cada 4', texto: 'familias de nuestro entorno tiene dificultades para llenar la despensa cada mes.' },
  { cifra: '100 %', texto: 'de lo recaudado se destina a comprar alimentos y productos de higiene.' },
  { cifra: '0', texto: 'intermediarios: compramos a proveedores con trazabilidad y lo publicamos.' },
];

const PASOS = [
  { titulo: 'Eliges qué donar', texto: 'Alimentos no perecederos, productos para bebés o de higiene, a precio de mercado.' },
  { titulo: 'Donas en la calle o desde casa', texto: 'Con tarjeta o efectivo ante un recolector, o por Bizum y transferencia.' },
  { titulo: 'Lo compramos y lo repartimos', texto: 'La hermandad compra los productos y los entrega a las familias que lo necesitan.' },
];

export default function Landing() {
  return (
    <div className="landing">
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <span className="landing-badge">Recogida solidaria · Carmona</span>
          <h1>Una despensa llena es una familia con esperanza</h1>
          <p>
            Cada mes, muchas familias de Carmona tienen que elegir entre pagar los recibos o llenar
            la nevera. Con tu donación, la hermandad compra alimentos y productos básicos para
            quienes más lo necesitan.
          </p>
          <div className="landing-actions">
            <Link to="/dona-desde-casa" className="btn landing-btn-gold">
              Dona desde casa
            </Link>
            <Link to="/transparencia" className="btn landing-btn-ghost">
              Ver a dónde va tu dinero
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <h2>Por qué tu ayuda importa</h2>
        <div className="landing-grid">
          {DATOS.map((d) => (
            <div key={d.cifra} className="landing-dato">
              <strong>{d.cifra}</strong>
              <p>{d.texto}</p>
            </div>
          ))}
        </div>
        <p className="landing-nota">Datos de ejemplo provisionales.</p>
      </section>

      <section className="landing-section landing-section-soft">
        <h2>Cómo funciona</h2>
        <ol className="landing-pasos">
          {PASOS.map((p, i) => (
            <li key={p.titulo}>
              <span className="landing-paso-num">{i + 1}</span>
              <div>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-cta">
        <h2>Cada euro cuenta</h2>
        <p>Un paquete de pasta, un bote de leche o unos pañales pueden cambiar la semana de una familia.</p>
        <Link to="/dona-desde-casa" className="btn landing-btn-gold">
          Quiero ayudar
        </Link>
      </section>
    </div>
  );
}
