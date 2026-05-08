import client from './client';

export const userApi = {
    search: (params) => client.get('/api/users', { params }),
    getById: (id) => client.get(`/api/users/${id}`),
    create: (data) => client.post('/api/users', data),
    update: (id, data) => client.put(`/api/users/${id}`, data),
    lock: (id) => client.post(`/api/users/${id}/lock`),
    unlock: (id) => client.post(`/api/users/${id}/unlock`),
    cancel: (id) => client.post(`/api/users/${id}/cancel`),
    changePassword: (id, password) => client.post(`/api/users/${id}/changePassword`, { password }),
};