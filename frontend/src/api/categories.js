import client from './client';

export const categoryApi = {
    getAll: (params) => client.get('/api/categories', { params }),
    getParents: () => client.get('/api/categories/parents'),
    getById: (id) => client.get(`/api/categories/${id}`),
    create: (data) => client.post('/api/categories', data),
    update: (id, data) => client.put(`/api/categories/${id}`, data),
    delete: (id) => client.delete(`/api/categories/${id}`),
};