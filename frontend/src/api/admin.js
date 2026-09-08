import client from './client';

export const listarRecolectores = () => client.get('/admin/recolectores').then((r) => r.data.recolectores);

export const crearRecolector = (datos) => client.post('/admin/recolectores', datos).then((r) => r.data.recolector);

export const actualizarRecolector = (id, datos) =>
  client.put(`/admin/recolectores/${id}`, datos).then((r) => r.data.recolector);

export const bajaRecolector = (id) => client.delete(`/admin/recolectores/${id}`).then((r) => r.data.recolector);

// El endpoint requiere JWT, así que no puede enlazarse como <a href>: se pide
// como blob autenticado y se descarga simulando un click.
export const exportarDonacionesCsv = async (filtros = {}) => {
  const respuesta = await client.get('/admin/export/donaciones', {
    params: filtros,
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([respuesta.data], { type: 'text/csv' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = 'donaciones.csv';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.URL.revokeObjectURL(url);
};
