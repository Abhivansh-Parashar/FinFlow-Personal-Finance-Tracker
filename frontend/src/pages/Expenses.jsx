import React, { useState } from 'react'
import { TrendingDown, Plus, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TRANSACTIONS, CATEGORIES, MONTHLY_SUMMARY, CATEGORY_BREAKDOWN, getCategoryById } from '../utils/dummyData'
import TransactionRow from '../components/common/TransactionRow'
import StatCard from '../components/common/StatCard'

export default function Expenses() {
  const expenseTransactions = TRANSACTIONS.filter(t => t.type === 'EXPENSE')
  const totalExpense = expenseTransactions.reduce((s, t) => s + t.amount, 0)
  const juneExpense = expenseTransactions.filter(t => t.date.startsWith('2025-06')).reduce((s, t) => s + t.amount, 0)

  const chartData = MONTHLY_SUMMARY.map(m => ({ month: m.month, expense: m.expense }))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Expenses</div>
          <div className="page-subtitle">{expenseTransactions.length} expense records</div>
        </div>
        <button className="btn btn-primary"><Plus size={15} /> Add Expense</button>
      </div>

      <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
        <StatCard title="Total Spent"  value={totalExpense}  change={-5.1} icon={TrendingDown} accentColor="red" />
        <StatCard title="This Month"   value={juneExpense}   change={-2.3} icon={TrendingDown} accentColor="amber" />
        <StatCard title="Daily Avg"    value={Math.round(juneExpense / 30)} change={3.2} icon={TrendingDown} accentColor="purple" />
        <StatCard title="Categories"   value={CATEGORY_BREAKDOWN.length} prefix="" change={0} icon={TrendingDown} accentColor="blue" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card fade-in">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>Monthly Expense Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Expense']}
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.82rem' }}
                labelStyle={{ color: 'var(--text-muted)' }} />
              <Bar dataKey="expense" radius={[6,6,0,0]} maxBarSize={48}>
                {chartData.map((e, i) => <Cell key={i} fill={i === chartData.length - 1 ? '#ff5c7a' : '#ff5c7a66'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card fade-in">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>Top Categories</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CATEGORY_BREAKDOWN.slice(0, 5).map((item, i) => {
              const pct = Math.round((item.value / juneExpense) * 100)
              return (
                <div key={item.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent-red)' }}>₹{item.value.toLocaleString()}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: item.color }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>{pct}% of spending</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Expense History</div>
        </div>
        <table className="table">
          <thead><tr><th>Description</th><th>Date</th><th>Type</th><th>Amount</th></tr></thead>
          <tbody>
            {expenseTransactions.map(t => <TransactionRow key={t.id} transaction={t} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
