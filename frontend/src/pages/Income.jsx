import React, { useState, useEffect } from 'react'
import { TrendingUp, ArrowUpRight, Plus, X, ArrowDownLeft } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { transactionService, reportService, categoryService, getApiList, normaliseTransaction } from '../services/api'
import TransactionRow from '../components/common/TransactionRow'
import StatCard from '../components/common/StatCard'

export default function Income() {
  const [incomeTransactions, setIncomeTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [monthlySummary, setMonthlySummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ categoryId: '', amount: '', description: '', date: new Date().toISOString().split('T')[0], note: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [txnRes, catRes, summaryRes] = await Promise.all([
        transactionService.getAll({ type: 'INCOME', size: 200 }),
        categoryService.getAll(),
        reportService.monthlySummary(6),
      ])

      setIncomeTransactions(getApiList(txnRes).map(normaliseTransaction))
      setCategories(getApiList(catRes))
      setMonthlySummary(getApiList(summaryRes).map(item => ({
        month:  item.month,
        income: Number(item.totalIncome ?? item.income ?? 0),
      })))
      setError('')
    } catch (err) {
      console.error('Error fetching income data:', err)
      setError('Failed to load income data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.amount || !form.description || !form.categoryId) return
    try {
      setSubmitting(true)
      await transactionService.create({
        transactionType: 'INCOME',
        categoryId: Number(form.categoryId),
        amount: Number(form.amount),
        description: form.description,
        date: form.date,
        note: form.note,
      })
      await fetchData()
      setShowModal(false)
      setForm({ categoryId: '', amount: '', description: '', date: new Date().toISOString().split('T')[0], note: '' })
    } catch (err) {
      setError('Failed to add income')
    } finally {
      setSubmitting(false)
    }
  }

  const incomeCategories = categories.filter(c => c.type === 'INCOME')
  const totalIncome = incomeTransactions.reduce((s, t) => s + t.amount, 0)
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthIncome = incomeTransactions
      .filter(t => String(t.date || '').startsWith(currentMonth))
      .reduce((s, t) => s + t.amount, 0)

  const categoryStats = incomeCategories.map(cat => ({
    ...cat,
    total: incomeTransactions.filter(t => t.categoryId === cat.id).reduce((s, t) => s + t.amount, 0),
    count: incomeTransactions.filter(t => t.categoryId === cat.id).length,
  })).filter(c => c.total > 0)

  const prevMonthDate = new Date();
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const prevMonth = prevMonthDate.toISOString().slice(0, 7);
  
  const currentSummary = monthlySummary.find(m => m.month === currentMonth);
  const prevSummary = monthlySummary.find(m => m.month === prevMonth);

  const getChange = (curr, prev) => prev === 0 ? null : Number((((curr - prev) / prev) * 100).toFixed(1));
  const monthIncomeChange = getChange(currentSummary?.income ?? 0, prevSummary?.income ?? 0);

  return (
      <div className="page">
        {error && <div style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>{error}</div>}

        <div className="page-header">
          <div>
            <div className="page-title">Income</div>
            <div className="page-subtitle">{incomeTransactions.length} income entries tracked</div>
          </div>
          {/* FIX: Button now opens the add income modal */}
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Add Income</button>
        </div>

        <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
          <StatCard title="Total Income"   value={totalIncome}  change={null} icon={TrendingUp}   accentColor="green" />
          <StatCard title="This Month"     value={monthIncome}  change={monthIncomeChange} icon={ArrowUpRight}  accentColor="blue" />
          <StatCard title="Avg / Month"    value={Math.round(totalIncome / Math.max(monthlySummary.length, 1))} change={null} icon={TrendingUp} accentColor="purple" />
          <StatCard title="Income Sources" value={categoryStats.length} prefix="" change={null} icon={TrendingUp} accentColor="amber" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
          <div className="card fade-in">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>Monthly Income Trend</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlySummary} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Income']}
                         contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.82rem' }}
                         labelStyle={{ color: 'var(--text-muted)' }} />
                <Bar dataKey="income" fill="var(--accent-green)" radius={[6,6,0,0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card fade-in">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>By Source</div>
            {categoryStats.length === 0
                ? <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No income data yet</div>
                : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {categoryStats.map(cat => {
                        const pct = Math.round((cat.total / totalIncome) * 100)
                        return (
                            <div key={cat.id}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.82rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{cat.icon}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                        </span>
                                <span style={{ fontWeight: 600 }}>₹{cat.total.toLocaleString()}</span>
                              </div>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${pct}%`, background: cat.color || 'var(--accent-green)' }} />
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>{pct}% of total</div>
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
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Income History</div>
          </div>
          <table className="table">
            <thead><tr><th>Description</th><th>Date</th><th>Type</th><th>Amount</th></tr></thead>
            <tbody>
            {incomeTransactions.length === 0
                ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No income records yet</td></tr>
                : incomeTransactions.map(t => <TransactionRow key={t.id} transaction={t} />)
            }
            </tbody>
          </table>
        </div>

        {/* Add Income Modal */}
        {showModal && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
              <div className="modal">
                <div className="modal-header">
                  <div className="modal-title">Add Income</div>
                  <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setShowModal(false)}><X size={18} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input className="form-input" placeholder="e.g. Monthly Salary" value={form.description}
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
                      <option value="">Select income category</option>
                      {incomeCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
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
                  <button className="btn btn-primary" style={{ flex: 2, background: 'var(--accent-green)', color: '#000' }}
                          onClick={handleSubmit} disabled={submitting}>
                    <ArrowUpRight size={15} /> {submitting ? 'Adding...' : 'Add Income'}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}
