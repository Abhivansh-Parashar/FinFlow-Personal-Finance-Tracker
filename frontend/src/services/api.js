/**
 * Axios API service — connects React frontend to Spring Boot backend.
 *
 * TODO (Milestone 4 — Frontend Integration):
 * 1. Create an Axios instance with baseURL = http://localhost:8080/api/v1
 * 2. Add a request interceptor to attach the JWT token from localStorage
 * 3. Add a response interceptor to handle 401 (redirect to login)
 *
 * Uncomment and implement when backend is ready.
 */

// import axios from 'axios'

// const api = axios.create({
//   baseURL: 'http://localhost:8080/api/v1',
//   headers: { 'Content-Type': 'application/json' }
// })

// // Attach JWT token to every request
// api.interceptors.request.use(config => {
//   const token = localStorage.getItem('token')
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

// // Handle 401 — redirect to login
// api.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token')
//       window.location.href = '/login'
//     }
//     return Promise.reject(error)
//   }
// )

// export default api

// ── Auth Service ────────────────────────────────────────────────────────
// export const authService = {
//   register: (data) => api.post('/auth/register', data),
//   login:    (data) => api.post('/auth/login', data),
// }

// ── Transaction Service ─────────────────────────────────────────────────
// export const transactionService = {
//   getAll:  (params) => api.get('/transactions', { params }),
//   getById: (id)     => api.get(`/transactions/${id}`),
//   create:  (data)   => api.post('/transactions', data),
//   update:  (id, d)  => api.put(`/transactions/${id}`, d),
//   delete:  (id)     => api.delete(`/transactions/${id}`),
// }

// ── Category Service ────────────────────────────────────────────────────
// export const categoryService = {
//   getAll:  (params) => api.get('/categories', { params }),
//   create:  (data)   => api.post('/categories', data),
//   update:  (id, d)  => api.put(`/categories/${id}`, d),
//   delete:  (id)     => api.delete(`/categories/${id}`),
// }

// ── Budget Service ──────────────────────────────────────────────────────
// export const budgetService = {
//   set:     (data)   => api.post('/budgets', data),
//   getAll:  (month)  => api.get('/budgets', { params: { month } }),
//   delete:  (id)     => api.delete(`/budgets/${id}`),
// }

// ── Report Service ──────────────────────────────────────────────────────
// export const reportService = {
//   monthlySummary:    (months) => api.get('/reports/monthly-summary', { params: { months } }),
//   categoryBreakdown: (month)  => api.get('/reports/category-breakdown', { params: { month } }),
//   yearlySummary:     (year)   => api.get('/reports/yearly-summary', { params: { year } }),
// }

// ── User Service ────────────────────────────────────────────────────────
// export const userService = {
//   getProfile:     ()       => api.get('/users/me'),
//   updateProfile:  (data)   => api.put('/users/me', data),
//   changePassword: (data)   => api.put('/users/me/password', data),
//   deleteAccount:  ()       => api.delete('/users/me'),
// }

export {}
