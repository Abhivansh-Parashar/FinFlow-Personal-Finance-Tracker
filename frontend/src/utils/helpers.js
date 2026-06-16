/**
 * Utility helper functions (without dummy data)
 */

export const formatCurrency = (amount, currency = '₹') =>
  `${currency}${amount.toLocaleString('en-IN')}`

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

