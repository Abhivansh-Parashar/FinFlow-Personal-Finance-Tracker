import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Target, Plus, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { budgetService, categoryService, getApiList } from '../services/api'

const currentMonth = new Date().toISOString().slice(0, 7)

export default function Budget() {
  const [budgets, setBudgets]         = useState([])
  const [categories, setCategories]   = useState([])
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState({ categoryId: '', budgetAmount: '', month: currentMonth })
  const [submitting, setSubmitting]   = useState(false)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [successMsg, setSuccessMsg]   = useState('')

  useEffect(() => {
    categoryService.getAll()
        .then(r => setCategories(getApiList(r).filter(c => c.type === 'EXPENSE')))
        .catch(() => {})
  }, [])

  useEffect(() => { fetchBudgets() }, [selectedMonth])

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const res = await budgetService.getAll(selectedMonth)
      setBudgets(getApiList(res))
      setError('')
    } catch (err) {
      setError('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.categoryId || !form.budgetAmount) return
    try {
      setSubmitting(true)
      // FIX: calls upsert endpoint — backend handles create vs update
      await budgetService.set({
        categoryId:   Number(form.categoryId),
        budgetAmount: Number(form.budgetAmount),
        month:        form.month,
      })
      await fetchBudgets()
      setShowModal(false)
      setForm({ categoryId: '', budgetAmount: '', month: selectedMonth })
      setSuccessMsg('Budget saved successfully')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setError('Failed to save budget')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this budget?')) return
    try {
      await budgetService.delete(id)
      await fetchBudgets()
    } catch {
      setError('Failed to delete budget')
    }
  }

  const totalBudget = budgets.reduce((s, b) => s + Number(b.budgetAmount ?? 0), 0)
  const totalSpent  = budgets.reduce((s, b) => s + Number(b.spentAmount  ?? 0), 0)
  const overBudget  = budgets.filter(b => Number(b.spentAmount) > Number(b.budgetAmount))

  return (
      <div className="page">
        {error && (
            <div style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
              {error}
            </div>
        )}
        {successMsg && (
            <div style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)', padding: '12px 16px', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={15} /> {successMsg}
            </div>
        )}

        <div className="page-header">
          <div>
            <div className="page-title">Budget</div>
            <div className="page-subtitle">
              {selectedMonth} · {overBudget.length > 0 ? `${overBudget.length} categories over budget` : 'All categories on track'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="month" className="form-input" value={selectedMonth}
                   style={{ width: 'auto', padding: '8px 12px' }}
                   onChange={e => setSelectedMonth(e.target.value)} />
            <button className="btn btn-primary" onClick={() => { setForm({ categoryId: '', budgetAmount: '', month: selectedMonth }); setShowModal(true) }}>
              <Plus size={15} /> Set Budget
            </button>
          </div>
        </div>

        {/* Overview cards */}
        <div className="grid-3 stagger" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Budgeted', val: totalBudget,              color: 'var(--accent-blue)'  },
            { label: 'Total Spent',    val: totalSpent,               color: 'var(--accent-amber)' },
            { label: 'Remaining',      val: totalBudget - totalSpent, color: totalBudget - totalSpent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
          ].map(s => (
              <div key={s.label} className="card" style={{ padding: '20px 22px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.6rem', color: s.color }}>
                  ₹{Number(s.val).toLocaleString('en-IN')}
                </div>
              </div>
          ))}
        </div>

        {/* Overall progress bar */}
        {totalBudget > 0 && (
            <div className="card fade-in" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Overall Budget Usage</span>
                <span style={{ fontWeight: 600, color: totalSpent > totalBudget ? 'var(--accent-red)' : 'var(--accent-green)' }}>
              {Math.round((totalSpent / totalBudget) * 100)}%
            </span>
              </div>
              <div className="progress-bar" style={{ height: 10 }}>
                <div className="progress-fill" style={{
                  width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
                  background: totalSpent > totalBudget ? 'var(--accent-red)' : 'var(--accent-green)'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>₹{totalSpent.toLocaleString()} spent</span>
                <span>₹{totalBudget.toLocaleString()} budgeted</span>
              </div>
            </div>
        )}

        {/* Budget cards */}
        {loading ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading budgets...</div>
        ) : budgets.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <Target size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div style={{ fontWeight: 600, marginBottom: 6 }}>No budgets for {selectedMonth}</div>
              <div style={{ fontSize: '0.85rem', marginBottom: 20 }}>Set spending limits to track your expenses</div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Set First Budget</button>
            </div>
        ) : (
            <div className="grid-2 stagger">
              {budgets.map(b => {
                const budgetAmt = Number(b.budgetAmount ?? 0)
                const spentAmt  = Number(b.spentAmount  ?? 0)
                const pct       = budgetAmt > 0 ? Math.round((spentAmt / budgetAmt) * 100) : 0
                const isOver    = spentAmt > budgetAmt
                const isWarning = pct >= 80 && !isOver

                return (
                    <div key={b.id} className="card" style={{ borderColor: isOver ? 'rgba(255,92,122,0.3)' : 'var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#a78bfa20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                            {b.categoryIcon ?? '📦'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.categoryName ?? 'Category'}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.month}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isOver
                              ? <span className="badge badge-red"><AlertTriangle size={11} /> Over</span>
                              : isWarning
                                  ? <span className="badge badge-amber">⚠ {pct}%</span>
                                  : <span className="badge badge-green"><CheckCircle size={11} /> On track</span>
                          }
                          <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                                  onClick={() => handleDelete(b.id)}>✕</button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Spent: <strong style={{ color: isOver ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                      ₹{spentAmt.toLocaleString()}
                    </strong>
                  </span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                    Budget: <strong>₹{budgetAmt.toLocaleString()}</strong>
                  </span>
                      </div>

                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${Math.min(pct, 100)}%`,
                          background: isOver ? 'var(--accent-red)' : isWarning ? 'var(--accent-amber)' : 'var(--accent-green)'
                        }} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                        {isOver
                            ? `₹${(spentAmt - budgetAmt).toLocaleString()} over budget`
                            : `₹${(budgetAmt - spentAmt).toLocaleString()} remaining`
                        }
                      </div>
                    </div>
                )
              })}
            </div>
        )}

        {/* Modal */}
        {showModal && createPortal(
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
              <div className="modal">
                <div className="modal-header">
                  <div className="modal-title">Set Budget</div>
                  <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setShowModal(false)}><X size={18} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Month</label>
                    <input type="month" className="form-input" value={form.month}
                           onChange={e => setForm({ ...form, month: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expense Category</label>
                    <select className="form-input" value={form.categoryId}
                            onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Budget Amount (₹)</label>
                    <input type="number" className="form-input" placeholder="e.g. 5000"
                           value={form.budgetAmount}
                           onChange={e => setForm({ ...form, budgetAmount: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleSubmit} disabled={submitting}>
                    <Plus size={15} /> {submitting ? 'Saving...' : 'Save Budget'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
        )}
      </div>
  )
}
