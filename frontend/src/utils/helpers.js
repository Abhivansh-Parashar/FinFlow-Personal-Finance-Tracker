/**
 * Shared helper utilities for the FinFlow frontend.
 */

/**
 * Format a currency amount.
 * @param {number} amount
 * @param {string} currency  symbol prefix (default ₹)
 */
export const formatCurrency = (amount, currency = '₹') => {
  const num = Number(amount ?? 0)
  return `${currency}${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

/**
 * Format a date string or Date object to "DD Mon YYYY".
 * Handles:
 *   - ISO datetime:  "2025-06-01T00:00:00"  → "01 Jun 2025"
 *   - Date-only:     "2025-06-01"            → "01 Jun 2025"
 *   - LocalDate[]:   [2025, 6, 1]            → "01 Jun 2025"  (Spring can return arrays)
 *   - null/undefined → "—"
 */
export const formatDate = (date) => {
  if (!date) return '—'

  // Spring Boot can serialize LocalDateTime as a JSON array [2025, 6, 1, 10, 30, 0]
  if (Array.isArray(date)) {
    const [year, month, day] = date
    const d = new Date(year, month - 1, day)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  try {
    const d = new Date(String(date))
    if (isNaN(d.getTime())) return String(date).slice(0, 10)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return String(date).slice(0, 10)
  }
}

/**
 * Format a month key like "2025-06" to "June 2025".
 */
export const formatMonth = (monthKey) => {
  if (!monthKey) return ''
  try {
    const [year, month] = monthKey.split('-')
    return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  } catch {
    return monthKey
  }
}

/**
 * Shorten a large number for display in charts.
 * e.g. 75000 → "75k", 1500000 → "15L"
 */
export const shortNumber = (n) => {
  const num = Number(n ?? 0)
  if (num >= 10_00_000) return `${(num / 10_00_000).toFixed(1)}L`
  if (num >= 1000)      return `${(num / 1000).toFixed(0)}k`
  return String(num)
}

/**
 * Returns the current month in "yyyy-MM" format.
 */
export const currentYearMonth = () => new Date().toISOString().slice(0, 7)

/**
 * Clamp a percentage between 0 and 100.
 */
export const clampPct = (spent, budget) => {
  if (!budget || budget === 0) return 0
  return Math.min(Math.round((spent / budget) * 100), 100)
}
