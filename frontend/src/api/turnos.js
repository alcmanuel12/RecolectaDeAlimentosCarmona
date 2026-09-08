import client from './client';

export const obtenerTurnoActivo = () => client.get('/turnos/activo').then((r) => r.data.turno);

export const abrirTurno = () => client.post('/turnos').then((r) => r.data.turno);

export const obtenerTurno = (id) => client.get(`/turnos/${id}`).then((r) => r.data.turno);

export const cerrarTurno = (id, datos) => client.post(`/turnos/${id}/cerrar`, datos).then((r) => r.data.turno);

export const listarTurnos = (filtros = {}) =>
  client.get('/turnos', { params: filtros }).then((r) => r.data.turnos);
