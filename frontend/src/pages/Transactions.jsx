import React, { useState, useEffect } from 'react'
import { Plus, Filter, Search, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import TransactionRow from '../components/common/TransactionRow'
import { transactionService, categoryService } from '../services/api'


export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState({ type: 'ALL', search: '', month: '' })
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ type: 'EXPENSE', categoryId: '', amount: '', description: '', date: new Date().toISOString().split('T')[0], note: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const txnRes = await transactionService.getAll()
      setTransactions(txnRes.data)
      
      const catRes = await categoryService.getAll()
      setCategories(catRes.data)
      
      setError('')
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const filtered = transactions.filter(t => {
    if (filter.type !== 'ALL' && t.type !== filter.type) return false
    if (filter.search && !t.description.toLowerCase().includes(filter.search.toLowerCase())) return false
    if (filter.month && !t.date.startsWith(filter.month)) return false
    return true
  })

  const totalIncome  = filtered.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)

  const handleSubmit = async () => {
    if (!form.amount || !form.description || !form.categoryId) return
    try {
      await transactionService.create({
        type: form.type,
        categoryId: Number(form.categoryId),
        amount: Number(form.amount),
        description: form.description,
        date: form.date,
        note: form.note
      })
      await fetchData()
      setShowModal(false)
      setForm({ type: 'EXPENSE', categoryId: '', amount: '', description: '', date: new Date().toISOString().split('T')[0], note: '' })
    } catch (err) {
      setError('Failed to create transaction')
    }
  }

  const handleDelete = async (id) => {
    try {
      await transactionService.delete(id)
      await fetchData()
    } catch (err) {
      setError('Failed to delete transaction')
    }
  }

  const relevantCategories = categories.filter(c => c.type === form.type)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Transactions</div>
          <div className="page-subtitle">{filtered.length} transactions · ₹{totalIncome.toLocaleString()} in · ₹{totalExpense.toLocaleString()} out</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Add Transaction
        </button>
      </div>

      {/* Summary row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Income',  val: totalIncome,  color: 'var(--accent-green)' },
          { label: 'Total Expense', val: totalExpense, color: 'var(--accent-red)' },
          { label: 'Net Balance',   val: totalIncome - totalExpense, color: totalIncome - totalExpense >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: s.color }}>
              ₹{s.val.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar card" style={{ padding: '14px 18px', marginBottom: 16 }}>
        <div className="search-wrap2">
          <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input className="form-input" placeholder="Search..." style={{ padding: '6px 10px', flex: 1 }}
            value={filter.search} onChange={e => setFilter({ ...filter, search: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['ALL', 'INCOME', 'EXPENSE'].map(t => (
            <button key={t} className={`btn ${filter.type === t ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={() => setFilter({ ...filter, type: t })}>
              {t === 'ALL' ? 'All' : t === 'INCOME' ? '↑ Income' : '↓ Expense'}
            </button>
          ))}
        </div>
        <input type="month" className="form-input" style={{ width: 'auto', padding: '6px 10px' }}
          value={filter.month} onChange={e => setFilter({ ...filter, month: e.target.value })} />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Description</th><th>Date</th><th>Type</th><th>Amount</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No transactions found</td></tr>
                : filtered.map(t => <TransactionRow key={t.id} transaction={t} showActions onDelete={handleDelete} />)
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add Transaction</div>
              <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Type toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {['INCOME', 'EXPENSE'].map(t => (
                <button key={t} className="btn" style={{
                  flex: 1, padding: '10px',
                  background: form.type === t ? (t === 'INCOME' ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--bg-secondary)',
                  color: form.type === t ? '#000' : 'var(--text-secondary)',
                  border: '1px solid var(--border)', fontWeight: 600
                }} onClick={() => setForm({ ...form, type: t, categoryId: '' })}>
                  {t === 'INCOME' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />} {t}
                </button>
              ))}
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
                  <option value="">Select category</option>
                  {relevantCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Note (optional)</label>
                <input className="form-input" placeholder="Any additional note..." value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit}>
                <Plus size={15} /> Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .filter-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .search-wrap2 { display: flex; align-items: center; gap: 8px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 6px 10px; flex: 1; min-width: 180px; }
        .search-wrap2 .form-input { background: transparent; border: none; padding: 0; box-shadow: none; }
        .search-wrap2 .form-input:focus { box-shadow: none; border: none; }
      `}</style>
    </div>
  )
}
