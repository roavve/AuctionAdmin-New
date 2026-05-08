import client from './client';

export const dictionaryApi = {
    getAll: () => client.get('/api/dictionary/items'),
    getByKey: (key) => client.get(`/api/dictionary/items/byKey/${key}`),
};