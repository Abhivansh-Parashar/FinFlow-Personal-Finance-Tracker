import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
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

const NOTIFICATION_STORAGE_KEY = 'finflow.notifications'
const NOTIFICATION_SETTINGS_KEY = 'finflow.notification-settings'

export const DEFAULT_NOTIFICATION_SETTINGS = {
  budgetAlerts: true,
  txnReminders: true,
  monthlySummary: true,
  largeTxnAlert: true,
  weeklyReport: false,
}

const readStoredNotifications = () => {
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeStoredNotifications = (notifications) => {
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications))
}

export const formatNotificationTime = (timestamp) => {
  if (!timestamp) return ''

  const diffMs = Date.now() - new Date(timestamp).getTime()
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))

  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

const readStoredJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : fallback
  } catch {
    return fallback
  }
}

export const buildTransactionNotification = (transaction) => {
  const type = (transaction?.type ?? transaction?.transactionType ?? 'EXPENSE').toUpperCase()
  const amount = Number(transaction?.amount ?? 0)
  const description = transaction?.description?.trim() || 'Transaction'
  const category = transaction?.categoryName?.trim()
  const amountLabel = `₹${amount.toLocaleString('en-IN')}`

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title: `${type === 'INCOME' ? 'Income' : 'Expense'} added`,
    body: category
      ? `${description} in ${category} for ${amountLabel}`
      : `${description} for ${amountLabel}`,
    createdAt: new Date().toISOString(),
    read: false,
  }
}

export const getNotificationSettings = () => ({
  ...DEFAULT_NOTIFICATION_SETTINGS,
  ...readStoredJson(NOTIFICATION_SETTINGS_KEY, {}),
})

export const setNotificationSettings = (settings) => {
  const next = {
    ...DEFAULT_NOTIFICATION_SETTINGS,
    ...settings,
  }
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(next))
  return next
}

export const addTransactionNotification = (transaction, options = {}) => {
  const settings = options.settings ?? getNotificationSettings()
  const amount = Number(transaction?.amount ?? 0)
  const monthlyBudget = Number(options.monthlyBudget ?? 0)
  const notifications = []

  if (settings.txnReminders !== false) {
    notifications.push(buildTransactionNotification(transaction))
  }

  if (settings.largeTxnAlert && amount >= 10000) {
    notifications.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-large`,
      type: 'ALERT',
      title: 'Large transaction alert',
      body: `A ₹${amount.toLocaleString('en-IN')} transaction was added.`,
      createdAt: new Date().toISOString(),
      read: false,
    })
  }

  if (settings.budgetAlerts && monthlyBudget > 0 && transaction?.type === 'EXPENSE') {
    const usage = amount / monthlyBudget
    if (usage >= 0.9) {
      notifications.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-budget`,
        type: 'BUDGET',
        title: usage >= 1 ? 'Budget exceeded' : 'Budget alert',
        body: usage >= 1
          ? `This expense pushed you over your monthly budget of ₹${monthlyBudget.toLocaleString('en-IN')}.`
          : `This expense used ${Math.round(usage * 100)}% of your monthly budget.`,
        createdAt: new Date().toISOString(),
        read: false,
      })
    }
  }

  if (settings.monthlySummary) {
    notifications.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-summary`,
      type: 'SUMMARY',
      title: 'Monthly summary updated',
      body: 'Your summary view has been refreshed with the latest transaction.',
      createdAt: new Date().toISOString(),
      read: false,
    })
  }

  if (settings.weeklyReport) {
    notifications.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-weekly`,
      type: 'REPORT',
      title: 'Weekly report updated',
      body: 'Your weekly insights have been updated with this transaction.',
      createdAt: new Date().toISOString(),
      read: false,
    })
  }

  if (notifications.length === 0) return []

  const merged = [...notifications, ...readStoredNotifications()].slice(0, 10)
  writeStoredNotifications(merged)
  window.dispatchEvent(new CustomEvent('transactions:notifications-updated', { detail: merged }))
  return notifications
}

export const getStoredNotifications = () => readStoredNotifications()
export const setStoredNotifications = (notifications) => {
  writeStoredNotifications(notifications)
  window.dispatchEvent(new CustomEvent('transactions:notifications-updated', { detail: notifications }))
}

// ── Auth Service ─────────────────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
}

export const getGoogleAuthUrl = () => "http://localhost:8080/oauth2/authorization/google";

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

export const userService = {
  getProfile:     ()     => api.get('/users/me'),
  updateProfile:  (data) => api.put('/users/me', data),
  changePassword: (data) => api.put('/users/me/password', data),
  deleteAccount:  ()     => api.delete('/users/me'),

  // NEW — profile picture
  uploadProfilePicture: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/users/me/profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  deleteProfilePicture: () => api.delete('/users/me/profile-picture'),
}