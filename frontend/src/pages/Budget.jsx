import React, { useState } from 'react'
import { Target, Plus, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { BUDGETS, getCategoryById, formatCurrency } from '../utils/dummyData'

export default function Budget() {
  const [budgets, setBudgets] = useState(BUDGETS)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ categoryId: '', budgetAmount: '', month: '2025-06' })

  const totalBudget = budgets.reduce((s, b) => s + b.budgetAmount, 0)
  const totalSpent  = budgets.reduce((s, b) => s + b.spentAmount, 0)
  const overBudget  = budgets.filter(b => b.spentAmount > b.budgetAmount)

  const handleAdd = () => {
    if (!form.categoryId || !form.budgetAmount) return
    setBudgets([...budgets, { id: Date.now(), categoryId: Number(form.categoryId), month: form.month, budgetAmount: Number(form.budgetAmount), spentAmount: 0 }])
    setShowModal(false)
    setForm({ categoryId: '', budgetAmount: '', month: '2025-06' })
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Budget</div>
          <div className="page-subtitle">June 2025 — {overBudget.length} categories over budget</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Set Budget</button>
      </div>

      {/* Overview cards */}
      <div className="grid-3 stagger" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Budgeted', val: totalBudget, color: 'var(--accent-blue)' },
          { label: 'Total Spent',    val: totalSpent,  color: 'var(--accent-amber)' },
          { label: 'Remaining',      val: totalBudget - totalSpent, color: totalBudget - totalSpent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.6rem', color: s.color }}>₹{s.val.toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>

      {/* Overall progress */}
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

      {/* Budget cards grid */}
      <div className="grid-2 stagger">
        {budgets.map(b => {
          const cat = getCategoryById(b.categoryId)
          const pct = Math.round((b.spentAmount / b.budgetAmount) * 100)
          const isOver = b.spentAmount > b.budgetAmount
          const isWarning = pct >= 80 && !isOver

          return (
            <div key={b.id} className="card" style={{ borderColor: isOver ? 'rgba(255,92,122,0.3)' : 'var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: cat?.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                    {cat?.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat?.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.month}</div>
                  </div>
                </div>
                {isOver
                  ? <span className="badge badge-red"><AlertTriangle size={11} /> Over</span>
                  : isWarning
                    ? <span className="badge badge-amber">⚠ {pct}%</span>
                    : <span className="badge badge-green"><CheckCircle size={11} /> On track</span>
                }
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Spent: <strong style={{ color: isOver ? 'var(--accent-red)' : 'var(--text-primary)' }}>₹{b.spentAmount.toLocaleString()}</strong></span>
                <span style={{ color: 'var(--text-secondary)' }}>Budget: <strong>₹{b.budgetAmount.toLocaleString()}</strong></span>
              </div>

              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${Math.min(pct, 100)}%`,
                  background: isOver ? 'var(--accent-red)' : isWarning ? 'var(--accent-amber)' : 'var(--accent-green)'
                }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                {isOver
                  ? `₹${(b.spentAmount - b.budgetAmount).toLocaleString()} over budget`
                  : `₹${(b.budgetAmount - b.spentAmount).toLocaleString()} remaining`
                }
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Set Budget</div>
              <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Month</label>
                <input type="month" className="form-input" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">Select category</option>
                  {/* Categories would be fetched from backend */}
                  <option value="5">🍽️ Food & Dining</option>
                  <option value="6">🚗 Transport</option>
                  <option value="7">🛍️ Shopping</option>
                  <option value="8">💡 Utilities</option>
                  <option value="9">🏥 Healthcare</option>
                  <option value="10">🎮 Entertainment</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Budget Amount (₹)</label>
                <input type="number" className="form-input" placeholder="e.g. 5000" value={form.budgetAmount}
                  onChange={e => setForm({ ...form, budgetAmount: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleAdd}><Plus size={15} /> Set Budget</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
