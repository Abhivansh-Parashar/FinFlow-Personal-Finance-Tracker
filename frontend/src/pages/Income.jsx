import React, { useState } from 'react'
import { TrendingUp, ArrowUpRight, Plus } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { TRANSACTIONS, CATEGORIES, MONTHLY_SUMMARY, formatCurrency, getCategoryById } from '../utils/dummyData'
import TransactionRow from '../components/common/TransactionRow'
import StatCard from '../components/common/StatCard'

const incomeCategories = CATEGORIES.filter(c => c.type === 'INCOME')

export default function Income() {
  const incomeTransactions = TRANSACTIONS.filter(t => t.type === 'INCOME')
  const totalIncome = incomeTransactions.reduce((s, t) => s + t.amount, 0)
  const juneIncome = incomeTransactions.filter(t => t.date.startsWith('2025-06')).reduce((s, t) => s + t.amount, 0)

  const chartData = MONTHLY_SUMMARY.map(m => ({ month: m.month, income: m.income }))

  const categoryStats = incomeCategories.map(cat => ({
    ...cat,
    total: incomeTransactions.filter(t => t.categoryId === cat.id).reduce((s, t) => s + t.amount, 0),
    count: incomeTransactions.filter(t => t.categoryId === cat.id).length,
  })).filter(c => c.total > 0)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Income</div>
          <div className="page-subtitle">{incomeTransactions.length} income entries tracked</div>
        </div>
        <button className="btn btn-primary"><Plus size={15} /> Add Income</button>
      </div>

      <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
        <StatCard title="Total Income"   value={totalIncome}  change={8.2} icon={TrendingUp} accentColor="green" />
        <StatCard title="This Month"     value={juneIncome}   change={5.3} icon={ArrowUpRight} accentColor="blue" />
        <StatCard title="Avg / Month"    value={Math.round(totalIncome / 6)} change={3.1} icon={TrendingUp} accentColor="purple" />
        <StatCard title="Income Sources" value={categoryStats.length} prefix="" change={0} icon={TrendingUp} accentColor="amber" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card fade-in">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>Monthly Income Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Income']}
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.82rem' }}
                labelStyle={{ color: 'var(--text-muted)' }} />
              <Bar dataKey="income" fill="var(--accent-green)" radius={[6,6,0,0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card fade-in">
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>By Source</div>
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
                    <div className="progress-fill" style={{ width: `${pct}%`, background: cat.color }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>{pct}% of total</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Income History</div>
        </div>
        <table className="table">
          <thead><tr><th>Description</th><th>Date</th><th>Type</th><th>Amount</th></tr></thead>
          <tbody>
            {incomeTransactions.map(t => <TransactionRow key={t.id} transaction={t} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
