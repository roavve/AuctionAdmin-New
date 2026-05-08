import client from './client';

export const companyApi = {
    getAll: () => client.get('/api/companies'),
    getById: (id) => client.get(`/api/companies/${id}`),
    create: (data) => client.post('/api/companies', data),
    update: (id, data) => client.put(`/api/companies/${id}`, data),
    cancel: (id) => client.post(`/api/companies/${id}/cancel`),
    getUsers: (id) => client.get(`/api/companies/${id}/users`),
};