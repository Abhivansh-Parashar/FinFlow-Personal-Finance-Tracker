import React, { useState, useEffect } from 'react'
import { TrendingDown, Plus, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { transactionService, reportService } from '../services/api'
import TransactionRow from '../components/common/TransactionRow'
import StatCard from '../components/common/StatCard'

export default function Expenses() {
  const [expenseTransactions, setExpenseTransactions] = useState([])
  const [monthlySummary, setMonthlySummary] = useState([])
  const [categoryBreakdown, setCategoryBreakdown] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const txnRes = await transactionService.getAll()
      const expenseOnly = txnRes.data.filter(t => t.type === 'EXPENSE')
      setExpenseTransactions(expenseOnly)

      const summaryRes = await reportService.monthlySummary('6')
      setMonthlySummary(summaryRes.data)

      const currentMonth = new Date().toISOString().slice(0, 7)
      const breakdownRes = await reportService.categoryBreakdown(currentMonth)
      setCategoryBreakdown(breakdownRes.data)

      setError('')
    } catch (err) {
      console.error('Error fetching expense data:', err)
      setError('Failed to load expense data')
    } finally {
      setLoading(false)
    }
  }

  const totalExpense = expenseTransactions.reduce((s, t) => s + t.amount, 0)
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthExpense = expenseTransactions.filter(t => t.date.startsWith(currentMonth)).reduce((s, t) => s + t.amount, 0)

  const chartData = monthlySummary.map(m => ({ month: m.month, expense: m.expense }))

  return (
    <div className="page">
      {error && <div style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>{error}</div>}

      <div className="page-header">
        <div>
          <div className="page-title">Expenses</div>
          <div className="page-subtitle">{expenseTransactions.length} expense records</div>
        </div>
        <button className="btn btn-primary"><Plus size={15} /> Add Expense</button>
      </div>

      <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
        <StatCard title="Total Spent"  value={totalExpense}  change={-5.1} icon={TrendingDown} accentColor="red" />
        <StatCard title="This Month"   value={monthExpense}   change={-2.3} icon={TrendingDown} accentColor="amber" />
        <StatCard title="Daily Avg"    value={Math.round(monthExpense / 30)} change={3.2} icon={TrendingDown} accentColor="purple" />
        <StatCard title="Categories"   value={categoryBreakdown.length} prefix="" change={0} icon={TrendingDown} accentColor="blue" />
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
            {categoryBreakdown.slice(0, 5).map((item, i) => {
              const pct = Math.round((item.value / monthExpense) * 100)
              return (
                <div key={item.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent-red)' }}>₹{item.value.toLocaleString()}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: item.color || '#ff5c7a' }} />
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
