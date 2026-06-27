import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — logout and redirect to login
api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        if (window.__authLogout) {
          window.__authLogout()
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      }
      return Promise.reject(error)
    }
)

export default api

// ── Response helpers ─────────────────────────────────────────────────────────

/**
 * Extracts the data payload from a backend ApiResponse wrapper.
 * Handles: { success, message, data: <payload> } and raw payloads.
 */
export const getApiPayload = (response) => response?.data?.data ?? response?.data ?? null

/**
 * Extracts a list from the payload.
 * Handles: plain arrays, Spring Page { content: [...] }, and ApiResponse wrappers.
 */
export const getApiList = (response) => {
  const payload = getApiPayload(response)
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.content)) return payload.content
  return []
}

/**
 * Extracts the Spring Page metadata (for pagination UI).
 */
export const getPageMeta = (response) => {
  const payload = getApiPayload(response)
  if (payload?.totalElements !== undefined) {
    return {
      totalElements: payload.totalElements,
      totalPages:    payload.totalPages,
      size:          payload.size,
      number:        payload.number,
    }
  }
  return null
}

/**
 * Extracts auth token + user from a login/register response.
 * Handles both { token, name, email } and { token, user: {...} } shapes.
 */
export const getAuthPayload = (response) => {
  const payload = getApiPayload(response)
  const token = payload?.token ?? payload?.accessToken ?? null
  const user = payload?.user ?? (
      payload && (payload.name || payload.email || payload.userId || payload.id)
          ? { id: payload.userId ?? payload.id, name: payload.name ?? '', email: payload.email ?? '' }
          : null
  )
  return { token, user }
}

/**
 * Normalises a transaction from the backend to the shape the frontend uses.
 * Backend:  transactionType, date as ISO string
 * Frontend: type, date
 */
export const normaliseTransaction = (t) => ({
  ...t,
  type: t.type ?? t.transactionType,
  amount: Number(t.amount ?? 0),
})

// ── Auth Service ─────────────────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
}

// ── Transaction Service ──────────────────────────────────────────────────────
export const transactionService = {
  getAll:  (params) => api.get('/transactions', { params }),
  getById: (id)     => api.get(`/transactions/${id}`),
  /**
   * Create a transaction.
   * Frontend sends { type, ... } — we map to { transactionType, ... } for the backend.
   */
  create: (data) => api.post('/transactions', {
    ...data,
    transactionType: data.transactionType ?? data.type,
    // Ensure date is a full ISO datetime string (backend expects LocalDateTime)
    date: data.date?.length === 10 ? `${data.date}T00:00:00` : data.date,
  }),
  update: (id, data) => api.put(`/transactions/${id}`, {
    ...data,
    transactionType: data.transactionType ?? data.type,
    date: data.date?.length === 10 ? `${data.date}T00:00:00` : data.date,
  }),
  delete: (id) => api.delete(`/transactions/${id}`),
}

// ── Category Service ─────────────────────────────────────────────────────────
export const categoryService = {
  getAll:  (params) => api.get('/categories', { params }),
  create:  (data)   => api.post('/categories', data),
  update:  (id, d)  => api.put(`/categories/${id}`, d),
  delete:  (id)     => api.delete(`/categories/${id}`),
}

// ── Budget Service ───────────────────────────────────────────────────────────
export const budgetService = {
  set:    (data)  => api.post('/budgets', data),
  getAll: (month) => api.get('/budgets', { params: { month } }),
  getById:(id)    => api.get(`/budgets/${id}`),
  delete: (id)    => api.delete(`/budgets/${id}`),
}

// ── Report Service ───────────────────────────────────────────────────────────
export const reportService = {
  monthlySummary:    (months) => api.get('/reports/monthly-summary',    { params: { months } }),
  categoryBreakdown: (month)  => api.get('/reports/category-breakdown', { params: { month } }),
  yearlySummary:     (year)   => api.get('/reports/yearly-summary',     { params: { year } }),
}

// ── User Service ─────────────────────────────────────────────────────────────
export const userService = {
  getProfile:     ()     => api.get('/users/me'),
  updateProfile:  (data) => api.put('/users/me', data),
  changePassword: (data) => api.put('/users/me/password', data),
  deleteAccount:  ()     => api.delete('/users/me'),
}
