import React from 'react'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'

/**
 * Normalises a transaction from the backend.
 * Backend returns:  { transactionType: "INCOME", date: "2025-06-01T00:00:00" }
 * Frontend expects: { type: "INCOME",             date: "2025-06-01..." }
 */
function normalise(t) {
    return {
        ...t,
        // backend field is transactionType; support both
        type: t.type ?? t.transactionType,
        // categoryId may come as categoryId directly or nested
        categoryId: t.categoryId ?? t.category?.id,
    }
}

export default function TransactionRow({ transaction, category, showActions, onDelete, onEdit }) {
    const t = normalise(transaction)
    const isIncome = t.type === 'INCOME'
    const formattedDate = formatDate(t.date)

    // Category can be passed as prop (from pages that already loaded categories),
    // or embedded in the transaction response from the backend.
    const cat = category ?? {
        name:  t.categoryName  ?? 'Uncategorized',
        icon:  t.categoryIcon  ?? '💰',
        color: t.categoryColor ?? '#666',
    }

    return (
        <tr className="txn-row">
            <td>
                <div className="txn-desc">
                    <div className="txn-icon-wrap" style={{ background: (cat.color || '#666') + '20' }}>
                        <span style={{ fontSize: '0.9rem' }}>{cat.icon || '💰'}</span>
                    </div>
                    <div>
                        <div className="txn-name">{t.description}</div>
                        <div className="txn-category">{cat.name || 'Uncategorized'}</div>
                    </div>
                </div>
            </td>
            <td>
                <span className="txn-date">{formattedDate}</span>
            </td>
            <td>
        <span className={`badge ${isIncome ? 'badge-green' : 'badge-red'}`}>
          {isIncome ? <ArrowUpRight size={11} /> : <ArrowDownLeft size={11} />}
            {isIncome ? 'Income' : 'Expense'}
        </span>
            </td>
            <td>
        <span className="txn-amount" style={{ color: isIncome ? 'var(--accent-green)' : 'var(--accent-red)' }}>
          {isIncome ? '+' : '-'}{formatCurrency(Number(t.amount ?? 0))}
        </span>
            </td>
            {showActions && (
                <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: '0.78rem' }} onClick={() => onEdit?.(t)}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '0.78rem' }} onClick={() => onDelete?.(t.id)}>Del</button>
                    </div>
                </td>
            )}
            <style>{`
        .txn-row { cursor: default; }
        .txn-desc { display: flex; align-items: center; gap: 12px; }
        .txn-icon-wrap { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .txn-name { font-size: 0.875rem; font-weight: 500; }
        .txn-category { font-size: 0.75rem; color: var(--text-muted); margin-top: 1px; }
        .txn-date { font-size: 0.8rem; color: var(--text-secondary); }
        .txn-amount { font-family: var(--font-display); font-weight: 600; font-size: 0.95rem; }
      `}</style>
        </tr>
    )
}
