import client from './client';

export const listarProductos = () => client.get('/productos').then((r) => r.data.productos);

export const listarTodosProductos = () => client.get('/productos?todos=true').then((r) => r.data.productos);

export const crearProducto = (datos) => client.post('/productos', datos).then((r) => r.data.producto);

export const actualizarProducto = (id, datos) => client.put(`/productos/${id}`, datos).then((r) => r.data.producto);

export const darDeBajaProducto = (id) => client.delete(`/productos/${id}`).then((r) => r.data.producto);
