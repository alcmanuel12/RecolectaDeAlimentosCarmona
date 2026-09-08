import client from './client';

export const obtenerTransparencia = () => client.get('/publico/transparencia').then((r) => r.data);
