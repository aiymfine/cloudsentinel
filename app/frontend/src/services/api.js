import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const auth = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
}

export const documents = {
  list: (params) => api.get('/documents', { params }),
  upload: (formData, onProgress) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  }),
  download: (key) => api.get(`/documents/download`, { params: { key }, responseType: 'blob' }),
  preview: (key) => api.get(`/documents/preview`, { params: { key }, responseType: 'blob' }),
  delete: (key) => api.delete(`/documents`, { params: { key } }),
}

export const admin = {
  users: () => api.get('/admin/users'),
  dashboard: () => api.get('/admin/dashboard'),
  audit: (params) => api.get('/admin/audit-logs', { params }),
  changeRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  toggleStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  health: () => api.get('/health/detailed'),
}

export default api
