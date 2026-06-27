import React, { useState, useEffect } from 'react'
import { Plus, X, Tag } from 'lucide-react'
import { categoryService, getApiList } from '../services/api'

const EMOJI_OPTIONS = ['🍽️','🚗','🛍️','💡','🏥','🎮','📚','🏠','💼','💻','📈','🎁','✈️','🏋️','☕','🎵','💊','🐾','🔧','📱']
const PRESET_COLORS = ['#00c896','#ff5c7a','#4d9fff','#ffb74d','#a78bfa','#ff8f5c','#f87171','#60c8ff']

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [filter, setFilter]         = useState('ALL')
  const [showModal, setShowModal]   = useState(false)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm]             = useState({ name: '', type: 'EXPENSE', icon: '🍽️', color: '#ff5c7a' })
  const [editTarget, setEditTarget] = useState(null)

  useEffect(() => { fetchCategories() }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await categoryService.getAll()
      setCategories(getApiList(res))
      setError('')
    } catch (err) {
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!form.name) return
    try {
      setSubmitting(true)
      if (editTarget) {
        await categoryService.update(editTarget.id, form)
      } else {
        await categoryService.create(form)
      }
      await fetchCategories()
      setShowModal(false)
      setForm({ name: '', type: 'EXPENSE', icon: '🍽️', color: '#ff5c7a' })
      setEditTarget(null)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to save category')
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (cat) => {
    setEditTarget(cat)
    setForm({ name: cat.name, type: cat.type, icon: cat.icon, color: cat.color })
    setShowModal(true)
  }

  const openAdd = () => {
    setEditTarget(null)
    setForm({ name: '', type: 'EXPENSE', icon: '🍽️', color: '#ff5c7a' })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? This will fail if transactions use it.')) return
    try {
      await categoryService.delete(id)
      await fetchCategories()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Cannot delete — category is in use by transactions')
    }
  }

  const filtered = filter === 'ALL' ? categories : categories.filter(c => c.type === filter)
  const incomeCount  = categories.filter(c => c.type === 'INCOME').length
  const expenseCount = categories.filter(c => c.type === 'EXPENSE').length

  return (
      <div className="page">
        {error && (
            <div style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>
              {error}
            </div>
        )}

        <div className="page-header">
          <div>
            <div className="page-title">Categories</div>
            <div className="page-subtitle">{categories.length} categories · {incomeCount} income · {expenseCount} expense</div>
          </div>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Category</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['ALL', 'INCOME', 'EXPENSE'].map(f => (
              <button key={f}
                      className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '7px 18px', fontSize: '0.82rem' }}
                      onClick={() => setFilter(f)}>
                {f === 'ALL' ? 'All' : f === 'INCOME' ? '↑ Income' : '↓ Expense'}
              </button>
          ))}
        </div>

        {loading ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <Tag size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div style={{ fontWeight: 600, marginBottom: 6 }}>No categories yet</div>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={openAdd}><Plus size={15} /> Add Category</button>
            </div>
        ) : (
            <div className="grid-3 stagger">
              {filtered.map(cat => (
                  <div key={cat.id} className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, background: (cat.color || '#666') + '20', border: `1px solid ${cat.color || '#666'}40`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                          {cat.icon || '📦'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{cat.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {cat.default ? 'Default category' : 'Custom category'}
                          </div>
                        </div>
                      </div>
                      <span className={`badge ${cat.type === 'INCOME' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.7rem' }}>
                  {cat.type}
                </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: cat.color || '#666', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', flex: 1 }}>{cat.color || 'N/A'}</span>
                      {/* Only allow editing/deleting non-default categories */}
                      {!cat.default && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => openEdit(cat)}>
                              Edit
                            </button>
                            <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleDelete(cat.id)}>
                              Remove
                            </button>
                          </div>
                      )}
                    </div>
                  </div>
              ))}
            </div>
        )}

        {showModal && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
              <div className="modal">
                <div className="modal-header">
                  <div className="modal-title">{editTarget ? 'Edit Category' : 'Add Category'}</div>
                  <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setShowModal(false)}><X size={18} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Category Name</label>
                    <input className="form-input" placeholder="e.g. Gym & Fitness"
                           value={form.name}
                           onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['INCOME', 'EXPENSE'].map(t => (
                          <button key={t} className="btn" style={{
                            flex: 1,
                            background: form.type === t ? (t === 'INCOME' ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--bg-secondary)',
                            color: form.type === t ? (t === 'INCOME' ? '#000' : '#fff') : 'var(--text-secondary)',
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
                          <button key={emoji} onClick={() => setForm({ ...form, icon: emoji })} style={{
                            width: 36, height: 36, borderRadius: 8,
                            border: `2px solid ${form.icon === emoji ? 'var(--accent-green)' : 'var(--border)'}`,
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
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {PRESET_COLORS.map(col => (
                          <button key={col} onClick={() => setForm({ ...form, color: col })} style={{
                            width: 28, height: 28, borderRadius: '50%', background: col, cursor: 'pointer',
                            border: form.color === col ? '3px solid white' : '2px solid transparent',
                            outline: form.color === col ? `2px solid ${col}` : 'none', outlineOffset: 2
                          }} />
                      ))}
                      <input type="color" value={form.color}
                             onChange={e => setForm({ ...form, color: e.target.value })}
                             style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleAdd} disabled={submitting}>
                    <Plus size={15} /> {submitting ? 'Saving...' : (editTarget ? 'Update Category' : 'Create Category')}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}
