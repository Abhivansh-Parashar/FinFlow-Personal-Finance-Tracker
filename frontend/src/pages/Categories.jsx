import React, { useState } from 'react'
import { Plus, X, Tag } from 'lucide-react'
import { CATEGORIES, TRANSACTIONS } from '../utils/dummyData'

const EMOJI_OPTIONS = ['🍽️','🚗','🛍️','💡','🏥','🎮','📚','🏠','💼','💻','📈','🎁','✈️','🏋️','☕','🎵','💊','🐾','🔧','📱']

export default function Categories() {
  const [categories, setCategories] = useState(CATEGORIES)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'EXPENSE', icon: '🍽️', color: '#ff5c7a' })
  const [filter, setFilter] = useState('ALL')

  const filtered = filter === 'ALL' ? categories : categories.filter(c => c.type === filter)

  const getUsage = (catId) => TRANSACTIONS.filter(t => t.categoryId === catId).length

  const handleAdd = () => {
    if (!form.name) return
    setCategories([...categories, { id: Date.now(), ...form }])
    setShowModal(false)
    setForm({ name: '', type: 'EXPENSE', icon: '🍽️', color: '#ff5c7a' })
  }

  const handleDelete = (id) => setCategories(prev => prev.filter(c => c.id !== id))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Categories</div>
          <div className="page-subtitle">{categories.length} categories — {categories.filter(c => c.type === 'INCOME').length} income · {categories.filter(c => c.type === 'EXPENSE').length} expense</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Add Category</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['ALL', 'INCOME', 'EXPENSE'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '7px 18px', fontSize: '0.82rem' }}
            onClick={() => setFilter(f)}>
            {f === 'ALL' ? 'All' : f === 'INCOME' ? '↑ Income' : '↓ Expense'}
          </button>
        ))}
      </div>

      <div className="grid-3 stagger">
        {filtered.map(cat => {
          const usageCount = getUsage(cat.id)
          return (
            <div key={cat.id} className="card" style={{ borderColor: 'var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44,
                    background: cat.color + '20',
                    border: `1px solid ${cat.color}40`,
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    {cat.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{cat.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {usageCount} transactions
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className={`badge ${cat.type === 'INCOME' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.7rem' }}>
                    {cat.type}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{cat.color}</span>
                <div style={{ flex: 1 }} />
                <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleDelete(cat.id)}>
                  Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add Category</div>
              <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input className="form-input" placeholder="e.g. Gym & Fitness" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['INCOME', 'EXPENSE'].map(t => (
                    <button key={t} className="btn" style={{
                      flex: 1,
                      background: form.type === t ? (t === 'INCOME' ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--bg-secondary)',
                      color: form.type === t ? '#000' : 'var(--text-secondary)',
                      border: '1px solid var(--border)', fontWeight: 600
                    }} onClick={() => setForm({ ...form, type: t })}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Choose Icon</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {EMOJI_OPTIONS.map(emoji => (
                    <button key={emoji} onClick={() => setForm({ ...form, icon: emoji })}
                      style={{
                        width: 36, height: 36, borderRadius: 8, border: `2px solid ${form.icon === emoji ? 'var(--accent-green)' : 'var(--border)'}`,
                        background: form.icon === emoji ? 'var(--accent-green-dim)' : 'var(--bg-secondary)',
                        fontSize: '1rem', cursor: 'pointer'
                      }}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {['#00c896','#ff5c7a','#4d9fff','#ffb74d','#a78bfa','#ff8f5c','#f87171','#60c8ff'].map(col => (
                    <button key={col} onClick={() => setForm({ ...form, color: col })}
                      style={{
                        width: 28, height: 28, borderRadius: '50%', background: col,
                        border: form.color === col ? `3px solid white` : '2px solid transparent',
                        cursor: 'pointer', outline: form.color === col ? `2px solid ${col}` : 'none',
                        outlineOffset: 2
                      }} />
                  ))}
                  <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                    style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleAdd}><Plus size={15} /> Create Category</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
