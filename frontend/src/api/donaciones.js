import client from './client';

export const crearDonacion = (datos) => client.post('/donaciones', datos).then((r) => r.data.donacion);

export const listarDonacionesPorTurno = (turnoId) =>
  client.get('/donaciones', { params: { turnoId } }).then((r) => r.data.donaciones);
