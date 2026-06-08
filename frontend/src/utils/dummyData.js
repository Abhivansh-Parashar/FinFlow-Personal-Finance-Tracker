// ── Categories ─────────────────────────────────────────────────
export const CATEGORIES = [
  { id: 1, name: 'Salary',        type: 'INCOME',  icon: '💼', color: '#00c896' },
  { id: 2, name: 'Freelance',     type: 'INCOME',  icon: '💻', color: '#4d9fff' },
  { id: 3, name: 'Investments',   type: 'INCOME',  icon: '📈', color: '#a78bfa' },
  { id: 4, name: 'Other Income',  type: 'INCOME',  icon: '🎁', color: '#ffb74d' },
  { id: 5, name: 'Food & Dining', type: 'EXPENSE', icon: '🍽️', color: '#ff5c7a' },
  { id: 6, name: 'Transport',     type: 'EXPENSE', icon: '🚗', color: '#ffb74d' },
  { id: 7, name: 'Shopping',      type: 'EXPENSE', icon: '🛍️', color: '#a78bfa' },
  { id: 8, name: 'Utilities',     type: 'EXPENSE', icon: '💡', color: '#4d9fff' },
  { id: 9, name: 'Healthcare',    type: 'EXPENSE', icon: '🏥', color: '#00c896' },
  { id: 10, name: 'Entertainment',type: 'EXPENSE', icon: '🎮', color: '#ff8f5c' },
  { id: 11, name: 'Education',    type: 'EXPENSE', icon: '📚', color: '#60c8ff' },
  { id: 12, name: 'Rent',         type: 'EXPENSE', icon: '🏠', color: '#f87171' },
]

// ── Transactions ────────────────────────────────────────────────
export const TRANSACTIONS = [
  { id: 1,  type: 'INCOME',  categoryId: 1,  amount: 75000, description: 'Monthly Salary — June',         date: '2025-06-01', note: '' },
  { id: 2,  type: 'EXPENSE', categoryId: 12, amount: 15000, description: 'Apartment Rent',                date: '2025-06-02', note: 'Paid on time' },
  { id: 3,  type: 'EXPENSE', categoryId: 5,  amount: 3200,  description: 'Grocery — DMart',               date: '2025-06-03', note: '' },
  { id: 4,  type: 'INCOME',  categoryId: 2,  amount: 12000, description: 'Website Project — Client A',    date: '2025-06-04', note: '' },
  { id: 5,  type: 'EXPENSE', categoryId: 6,  amount: 1200,  description: 'Ola / Metro commute',           date: '2025-06-05', note: '' },
  { id: 6,  type: 'EXPENSE', categoryId: 10, amount: 799,   description: 'Netflix Subscription',          date: '2025-06-06', note: '' },
  { id: 7,  type: 'EXPENSE', categoryId: 8,  amount: 2100,  description: 'Electricity + Internet bill',   date: '2025-06-07', note: '' },
  { id: 8,  type: 'EXPENSE', categoryId: 7,  amount: 4500,  description: 'Amazon — Headphones',           date: '2025-06-08', note: '' },
  { id: 9,  type: 'INCOME',  categoryId: 3,  amount: 5200,  description: 'Dividend — MF Portfolio',       date: '2025-06-09', note: '' },
  { id: 10, type: 'EXPENSE', categoryId: 11, amount: 2500,  description: 'LeetCode Premium + Udemy',      date: '2025-06-10', note: '' },
  { id: 11, type: 'EXPENSE', categoryId: 9,  amount: 800,   description: 'Pharmacy — vitamins',           date: '2025-06-11', note: '' },
  { id: 12, type: 'EXPENSE', categoryId: 5,  amount: 1800,  description: 'Zomato orders (weekly)',        date: '2025-06-12', note: '' },
  { id: 13, type: 'INCOME',  categoryId: 2,  amount: 8000,  description: 'Logo Design — Client B',        date: '2025-06-13', note: '' },
  { id: 14, type: 'EXPENSE', categoryId: 6,  amount: 2400,  description: 'Petrol refill',                 date: '2025-06-14', note: '' },
  { id: 15, type: 'EXPENSE', categoryId: 7,  amount: 3200,  description: 'Myntra — Clothing',             date: '2025-06-15', note: '' },
  // May transactions
  { id: 16, type: 'INCOME',  categoryId: 1,  amount: 75000, description: 'Monthly Salary — May',          date: '2025-05-01', note: '' },
  { id: 17, type: 'EXPENSE', categoryId: 12, amount: 15000, description: 'Apartment Rent',                date: '2025-05-02', note: '' },
  { id: 18, type: 'EXPENSE', categoryId: 5,  amount: 4200,  description: 'Grocery + Eating out',          date: '2025-05-10', note: '' },
  { id: 19, type: 'INCOME',  categoryId: 2,  amount: 15000, description: 'App Dev Project',               date: '2025-05-15', note: '' },
  { id: 20, type: 'EXPENSE', categoryId: 10, amount: 1200,  description: 'Movie + Events',                date: '2025-05-20', note: '' },
  { id: 21, type: 'EXPENSE', categoryId: 8,  amount: 2100,  description: 'Utility Bills — May',           date: '2025-05-22', note: '' },
  { id: 22, type: 'EXPENSE', categoryId: 7,  amount: 6800,  description: 'New shoes + accessories',       date: '2025-05-25', note: '' },
  // April
  { id: 23, type: 'INCOME',  categoryId: 1,  amount: 75000, description: 'Monthly Salary — April',        date: '2025-04-01', note: '' },
  { id: 24, type: 'EXPENSE', categoryId: 12, amount: 15000, description: 'Apartment Rent',                date: '2025-04-02', note: '' },
  { id: 25, type: 'EXPENSE', categoryId: 5,  amount: 3800,  description: 'Groceries April',               date: '2025-04-12', note: '' },
  { id: 26, type: 'INCOME',  categoryId: 3,  amount: 3900,  description: 'Stock gains — Nifty',           date: '2025-04-18', note: '' },
  { id: 27, type: 'EXPENSE', categoryId: 11, amount: 5000,  description: 'Online Course — Full Stack',    date: '2025-04-20', note: '' },
]

// ── Budgets ─────────────────────────────────────────────────────
export const BUDGETS = [
  { id: 1, categoryId: 5,  month: '2025-06', budgetAmount: 6000,  spentAmount: 5000 },
  { id: 2, categoryId: 6,  month: '2025-06', budgetAmount: 3000,  spentAmount: 3600 },
  { id: 3, categoryId: 7,  month: '2025-06', budgetAmount: 5000,  spentAmount: 7700 },
  { id: 4, categoryId: 8,  month: '2025-06', budgetAmount: 2500,  spentAmount: 2100 },
  { id: 5, categoryId: 10, month: '2025-06', budgetAmount: 1500,  spentAmount: 799  },
  { id: 6, categoryId: 11, month: '2025-06', budgetAmount: 3000,  spentAmount: 2500 },
  { id: 7, categoryId: 12, month: '2025-06', budgetAmount: 15000, spentAmount: 15000},
  { id: 8, categoryId: 9,  month: '2025-06', budgetAmount: 1500,  spentAmount: 800  },
]

// ── Monthly Summary (for charts) ────────────────────────────────
export const MONTHLY_SUMMARY = [
  { month: 'Jan', income: 75000, expense: 42000 },
  { month: 'Feb', income: 75000, expense: 38500 },
  { month: 'Mar', income: 87000, expense: 45200 },
  { month: 'Apr', income: 78900, expense: 41800 },
  { month: 'May', income: 93500, expense: 44300 },
  { month: 'Jun', income: 100200, expense: 37500 },
]

// ── Category Expense Breakdown (pie chart) ──────────────────────
export const CATEGORY_BREAKDOWN = [
  { name: 'Rent',         value: 15000, color: '#f87171' },
  { name: 'Food',         value: 5000,  color: '#ff5c7a' },
  { name: 'Shopping',     value: 7700,  color: '#a78bfa' },
  { name: 'Transport',    value: 3600,  color: '#ffb74d' },
  { name: 'Utilities',    value: 2100,  color: '#4d9fff' },
  { name: 'Education',    value: 2500,  color: '#60c8ff' },
  { name: 'Entertainment',value: 799,   color: '#ff8f5c' },
  { name: 'Healthcare',   value: 800,   color: '#00c896' },
]

// ── Helpers ─────────────────────────────────────────────────────
export const getCategoryById = (id) => CATEGORIES.find(c => c.id === id)

export const formatCurrency = (amount, currency = '₹') =>
  `${currency}${amount.toLocaleString('en-IN')}`

export const getTransactionsByMonth = (yearMonth) =>
  TRANSACTIONS.filter(t => t.date.startsWith(yearMonth))
