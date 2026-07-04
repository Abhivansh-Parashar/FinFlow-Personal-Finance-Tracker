import React, { useState, useEffect } from 'react'
import { TrendingDown, Plus, X, ArrowDownLeft } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { transactionService, reportService, categoryService, getApiList, normaliseTransaction, addTransactionNotification } from '../services/api'
import TransactionRow from '../components/common/TransactionRow'
import StatCard from '../components/common/StatCard'
import { useAuth } from '../context/AuthContext'

export default function Expenses() {
  const { user } = useAuth()
  const [expenseTransactions, setExpenseTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [monthlySummary, setMonthlySummary]   = useState([])
  const [categoryBreakdown, setCategoryBreakdown] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ categoryId: '', amount: '', description: '', date: new Date().toISOString().split('T')[0], note: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const currentMonth = new Date().toISOString().slice(0, 7)
      const [txnRes, catRes, summaryRes, breakdownRes] = await Promise.all([
        transactionService.getAll({ type: 'EXPENSE', size: 200 }),
        categoryService.getAll(),
        reportService.monthlySummary(6),
        reportService.categoryBreakdown(currentMonth),
      ])

      setExpenseTransactions(getApiList(txnRes).map(normaliseTransaction))
      setCategories(getApiList(catRes))
      setMonthlySummary(getApiList(summaryRes).map(item => ({
        month:   item.month,
        expense: Number(item.totalExpense ?? item.expense ?? 0),
      })))
      setCategoryBreakdown(getApiList(breakdownRes).map((item, i) => ({
        name:  item.categoryName ?? item.name ?? 'Other',
        value: Number(item.totalAmount ?? item.value ?? 0),
        color: item.color ?? '#ff5c7a',
      })))
      setError('')
    } catch (err) {
      console.error('Error fetching expense data:', err)
      setError('Failed to load expense data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.amount || !form.description || !form.categoryId) return
    try {
      setSubmitting(true)
      await transactionService.create({
        transactionType: 'EXPENSE',
        categoryId: Number(form.categoryId),
        amount: Number(form.amount),
        description: form.description,
        date: form.date,
        note: form.note,
      })
      addTransactionNotification({
        type: 'EXPENSE',
        categoryName: expenseCategories.find(c => String(c.id) === String(form.categoryId))?.name,
        description: form.description,
        amount: Number(form.amount),
      }, { monthlyBudget: user?.monthlyBudget })
      await fetchData()
      setShowModal(false)
      setForm({ categoryId: '', amount: '', description: '', date: new Date().toISOString().split('T')[0], note: '' })
    } catch (err) {
      setError('Failed to add expense')
    } finally {
      setSubmitting(false)
    }
  }

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE')
  const totalExpense = expenseTransactions.reduce((s, t) => s + t.amount, 0)
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthExpense = expenseTransactions
      .filter(t => String(t.date || '').startsWith(currentMonth))
      .reduce((s, t) => s + t.amount, 0)

  const prevMonthDate = new Date();
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const prevMonth = prevMonthDate.toISOString().slice(0, 7);
  
  const currentSummary = monthlySummary.find(m => m.month === currentMonth);
  const prevSummary = monthlySummary.find(m => m.month === prevMonth);

  const getChange = (curr, prev) => prev === 0 ? null : Number((((curr - prev) / prev) * 100).toFixed(1));
  const monthExpenseChange = getChange(currentSummary?.expense ?? 0, prevSummary?.expense ?? 0);

  return (
      <div className="page">
        {error && <div style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>{error}</div>}

        <div className="page-header">
          <div>
            <div className="page-title">Expenses</div>
            <div className="page-subtitle">{expenseTransactions.length} expense records</div>
          </div>
          {/* FIX: Button now opens the add expense modal */}
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Add Expense</button>
        </div>

        <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
          <StatCard title="Total Spent"  value={totalExpense}  change={null} icon={TrendingDown} accentColor="red" />
          <StatCard title="This Month"   value={monthExpense}  change={monthExpenseChange} icon={TrendingDown}  accentColor="amber" />
          <StatCard title="Daily Avg"    value={Math.round(monthExpense / 30)} change={null} icon={TrendingDown} accentColor="purple" />
          <StatCard title="Categories"   value={categoryBreakdown.length} prefix="" change={null} icon={TrendingDown} accentColor="blue" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
          <div className="card fade-in">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>Monthly Expense Trend</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlySummary} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Expense']}
                         contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.82rem' }}
                         labelStyle={{ color: 'var(--text-muted)' }} />
                <Bar dataKey="expense" radius={[6,6,0,0]} maxBarSize={48}>
                  {monthlySummary.map((e, i) => <Cell key={i} fill={i === monthlySummary.length - 1 ? '#ff5c7a' : '#ff5c7a66'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card fade-in">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Top Categories</div>
            {categoryBreakdown.length === 0
                ? <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No expense data yet</div>
                : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {categoryBreakdown.slice(0, 5).map(item => {
                        const pct = monthExpense > 0 ? Math.round((item.value / monthExpense) * 100) : 0
                        return (
                            <div key={item.name}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.82rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                                <span style={{ fontWeight: 600, color: 'var(--accent-red)' }}>₹{Number(item.value).toLocaleString()}</span>
                              </div>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${pct}%`, background: item.color }} />
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>{pct}% of spending</div>
                            </div>
                        )
                      })}
                    </div>
                )
            }
          </div>
        </div>

        <div className="card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Expense History</div>
          </div>
          <table className="table">
            <thead><tr><th>Description</th><th>Date</th><th>Type</th><th>Amount</th></tr></thead>
            <tbody>
            {expenseTransactions.length === 0
                ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No expense records yet</td></tr>
                : expenseTransactions.map(t => <TransactionRow key={t.id} transaction={t} />)
            }
            </tbody>
          </table>
        </div>

        {/* Add Expense Modal */}
        {showModal && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
              <div className="modal">
                <div className="modal-header">
                  <div className="modal-title">Add Expense</div>
                  <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setShowModal(false)}><X size={18} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input className="form-input" placeholder="e.g. Grocery shopping" value={form.description}
                           onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Amount (₹)</label>
                      <input className="form-input" type="number" placeholder="0" value={form.amount}
                             onChange={e => setForm({ ...form, amount: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input className="form-input" type="date" value={form.date}
                             onChange={e => setForm({ ...form, date: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                      <option value="">Select expense category</option>
                      {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Note (optional)</label>
                    <input className="form-input" placeholder="Any note..." value={form.note}
                           onChange={e => setForm({ ...form, note: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 2, background: 'var(--accent-red)', color: '#fff' }}
                          onClick={handleSubmit} disabled={submitting}>
                    <ArrowDownLeft size={15} /> {submitting ? 'Adding...' : 'Add Expense'}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}
