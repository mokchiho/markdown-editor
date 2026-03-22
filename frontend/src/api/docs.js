import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

export const docsApi = {
  list: () => api.get('/docs'),
  get: (id) => api.get(`/docs/${id}`),
  create: (data) => api.post('/docs', data),
  update: (id, data) => api.put(`/docs/${id}`, data),
  delete: (id) => api.delete(`/docs/${id}`)
}
