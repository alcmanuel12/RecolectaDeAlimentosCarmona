import { useState } from 'react';
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
  const [pestanaActiva, setPestanaActiva] = useState('recolectores');
  const Activa = PESTANAS.find((p) => p.id === pestanaActiva).Componente;

  return (
    <div className="page">
      <h1>Panel de administrador</h1>
      <div className="tabs">
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
