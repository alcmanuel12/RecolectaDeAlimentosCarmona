import client from './client';

export const login = (email, password) => client.post('/auth/login', { email, password }).then((r) => r.data);

export const registro = (datos) => client.post('/auth/registro', datos).then((r) => r.data);

export const me = () => client.get('/auth/me').then((r) => r.data);
