import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminRecolectores from './admin/AdminRecolectores';
import AdminProductos from './admin/AdminProductos';
import AdminTurnos from './admin/AdminTurnos';
import AdminExport from './admin/AdminExport';

const PESTANAS = [
  { id: 'recolectores', etiqueta: 'Recolectores', Componente: AdminRecolectores },
  { id: 'turnos', etiqueta: 'Turnos', Componente: AdminTurnos },
  { id: 'productos', etiqueta: 'Catálogo', Componente: AdminProductos },
  { id: 'export', etiqueta: 'Exportar', Componente: AdminExport },
];

export default function PanelAdmin() {
  const { recolector } = useAuth();
  const [pestanaActiva, setPestanaActiva] = useState('recolectores');
  const Activa = PESTANAS.find((p) => p.id === pestanaActiva).Componente;

  return (
    <div className="page">
      <div className="dateline">
        <span>Panel del Consejo</span>
        <span>{recolector?.nombre} · admin</span>
      </div>
      <h1 style={{ marginTop: 18 }}>Administración</h1>
      <p className="page-subtitle" style={{ maxWidth: '62ch' }}>
        Gestiona recolectores, catálogo, turnos e informes de la hermandad.
      </p>
      <div className="tabs" style={{ marginTop: 24 }}>
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            className={`tab ${pestanaActiva === p.id ? 'tab-activa' : ''}`}
            onClick={() => setPestanaActiva(p.id)}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>
      <div className="tab-content">
        <Activa />
      </div>
    </div>
  );
}
