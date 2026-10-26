export const URL_ESCUDO = 'https://res.cloudinary.com/dfc5psy3z/image/upload/v1792401103/Escudo-_qnafgb.svg';

// Escudo de la hermandad. Es decorativo: el texto de la página ya dice quién somos.
export default function Escudo({ className = '', size = 72 }) {
  return <img className={`escudo ${className}`} src={URL_ESCUDO} width={size} height={size} alt="" aria-hidden="true" />;
}
