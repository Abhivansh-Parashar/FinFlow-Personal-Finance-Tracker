import React, { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useOutletContext } from 'react-router-dom'
import { Plus, Search, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import TransactionRow from '../components/common/TransactionRow'
import { transactionService, categoryService, getApiList, getPageMeta, normaliseTransaction, addTransactionNotification } from '../services/api'
import { useAuth } from '../context/AuthContext'

const EMPTY_FORM = {
  type: 'EXPENSE', categoryId: '', amount: '', description: '',
  date: new Date().toISOString().split('T')[0], note: ''
}

export default function Transactions() {
  const { user } = useAuth()
  const { searchTerm = '' } = useOutletContext() || {}
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories]     = useState([])
  const [pageMeta, setPageMeta]         = useState(null)
  const [page, setPage]                 = useState(0)

  const [filter, setFilter] = useState({ type: 'ALL', search: '', month: '' })
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm]   = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  // Load categories once
  useEffect(() => {
    categoryService.getAll()
        .then(r => setCategories(getApiList(r)))
        .catch(() => {})
  }, [])

  // Load transactions whenever filter or page changes
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        size: 15,
        page,
        sort: 'date,desc',
        ...(filter.type !== 'ALL' && { type: filter.type }),
      }
      const res = await transactionService.getAll(params)
      let list = getApiList(res).map(normaliseTransaction)

      // Client-side search filter (backend doesn't support description search)
      const searchQ = (filter.search || searchTerm || '').toLowerCase()
      if (searchQ) {
        list = list.filter(t =>
          t.description?.toLowerCase().includes(searchQ) ||
          (t.categoryName || '').toLowerCase().includes(searchQ)
        )
      }
      // Client-side month filter
      if (filter.month) {
        list = list.filter(t => String(t.date || '').startsWith(filter.month))
      }

      setTransactions(list)
      setPageMeta(getPageMeta(res))
      setError('')
    } catch (err) {
      setError('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }, [filter, page, searchTerm])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  // Reset to page 0 when filter changes
  useEffect(() => { setPage(0) }, [filter])

  const openAdd = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (txn) => {
    setEditTarget(txn)
    setForm({
      type:        txn.type ?? txn.transactionType ?? 'EXPENSE',
      categoryId:  String(txn.categoryId ?? ''),
      amount:      String(txn.amount ?? ''),
      description: txn.description ?? '',
      date:        String(txn.date ?? '').slice(0, 10),
      note:        txn.note ?? '',
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!form.amount || !form.description || !form.categoryId) return
    try {
      setSubmitting(true)
      const payload = {
        transactionType: form.type,
        categoryId:      Number(form.categoryId),
        amount:          Number(form.amount),
        description:     form.description,
        date:            form.date,
        note:            form.note,
        categoryName:    relevantCategories.find(c => String(c.id) === String(form.categoryId))?.name,
      }
      if (editTarget) {
        await transactionService.update(editTarget.id, payload)
      } else {
        await transactionService.create(payload)
        addTransactionNotification(payload, { monthlyBudget: user?.monthlyBudget, user })
      }
      await fetchTransactions()
      setShowModal(false)
      setForm(EMPTY_FORM)
      setEditTarget(null)
    } catch (err) {
      setError(editTarget ? 'Failed to update transaction' : 'Failed to add transaction')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    try {
      await transactionService.delete(id)
      await fetchTransactions()
    } catch {
      setError('Failed to delete transaction')
    }
  }

  const totalIncome  = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0)
  const relevantCategories = categories.filter(c => c.type === form.type)

  return (
      <div className="page">
        {error && (
            <div style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>
              {error}
            </div>
        )}

        <div className="page-header">
          <div>
            <div className="page-title">Transactions</div>
            <div className="page-subtitle">
              {transactions.length} records · ₹{totalIncome.toLocaleString('en-IN')} in · ₹{totalExpense.toLocaleString('en-IN')} out
            </div>
          </div>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Transaction</button>
        </div>

        {/* Summary row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Income',  val: totalIncome,              color: 'var(--accent-green)' },
            { label: 'Total Expense', val: totalExpense,             color: 'var(--accent-red)'   },
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
            <input className="form-input" placeholder="Search descriptions..."
                   style={{ padding: '6px 10px', flex: 1 }}
                   value={filter.search}
                   onChange={e => setFilter({ ...filter, search: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['ALL', 'INCOME', 'EXPENSE'].map(t => (
                <button key={t}
                        className={`btn ${filter.type === t ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                        onClick={() => setFilter({ ...filter, type: t })}>
                  {t === 'ALL' ? 'All' : t === 'INCOME' ? '↑ Income' : '↓ Expense'}
                </button>
            ))}
          </div>
          <input type="month" className="form-input"
                 style={{ width: 'auto', padding: '6px 10px' }}
                 value={filter.month}
                 onChange={e => setFilter({ ...filter, month: e.target.value })} />
          {(filter.search || filter.month || filter.type !== 'ALL') && (
              <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                      onClick={() => setFilter({ type: 'ALL', search: '', month: '' })}>
                <X size={13} /> Clear
              </button>
          )}
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
              <tr><th>Description</th><th>Date</th><th>Type</th><th>Amount</th><th>Actions</th></tr>
              </thead>
              <tbody>
              {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : transactions.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No transactions found</td></tr>
              ) : (
                  transactions.map(t => (
                      <TransactionRow key={t.id} transaction={t}
                                      showActions
                                      onDelete={handleDelete}
                                      onEdit={openEdit} />
                  ))
              )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pageMeta && pageMeta.totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Page {pageMeta.number + 1} of {pageMeta.totalPages} · {pageMeta.totalElements} total
            </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                          disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                          disabled={page >= pageMeta.totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              </div>
          )}
        </div>

        {/* Add / Edit Modal */}
        {showModal && createPortal(
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
              <div className="modal">
                <div className="modal-header">
                  <div className="modal-title">{editTarget ? 'Edit Transaction' : 'Add Transaction'}</div>
                  <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setShowModal(false)}>
                    <X size={18} />
                  </button>
                </div>

                {/* Income / Expense toggle */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  {['INCOME', 'EXPENSE'].map(t => (
                      <button key={t} className="btn" style={{
                        flex: 1, padding: '10px',
                        background: form.type === t
                            ? (t === 'INCOME' ? 'var(--accent-green)' : 'var(--accent-red)')
                            : 'var(--bg-secondary)',
                        color: form.type === t ? (t === 'INCOME' ? '#000' : '#fff') : 'var(--text-secondary)',
                        border: '1px solid var(--border)', fontWeight: 600
                      }} onClick={() => setForm({ ...form, type: t, categoryId: '' })}>
                        {t === 'INCOME' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />} {t}
                      </button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input className="form-input" placeholder="e.g. Monthly Salary"
                           value={form.description}
                           onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Amount (₹)</label>
                      <input
                          className="form-input"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={form.amount}
                          onChange={e => {
                            const value = e.target.value;

                            setForm({
                              ...form,
                              amount: value === "" ? "" : Math.max(0, Number(value))
                            });
                          }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input className="form-input" type="date"
                             value={form.date}
                             onChange={e => setForm({ ...form, date: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={form.categoryId}
                            onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                      <option value="">Select category</option>
                      {relevantCategories.map(c => (
                          <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Note (optional)</label>
                    <input className="form-input" placeholder="Any additional note..."
                           value={form.note}
                           onChange={e => setForm({ ...form, note: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 2 }}
                          onClick={handleSubmit} disabled={submitting}>
                    <Plus size={15} /> {submitting ? 'Saving...' : editTarget ? 'Update' : 'Add Transaction'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
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
