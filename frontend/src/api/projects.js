import client from './client';

export const projectApi = {
    getAll: () => client.get('/api/projects'),
    getById: (id) => client.get(`/api/projects/${id}`),
    create: (data) => client.post('/api/projects', data),
    update: (id, data) => client.put(`/api/projects/${id}`, data),
    delete: (id) => client.delete(`/api/projects/${id}`),
};