import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts'
import {
  TrendingUp, TrendingDown, Wallet, Target,
  ArrowUpRight, Plus, ArrowRight
} from 'lucide-react'
import StatCard from '../components/common/StatCard'
import TransactionRow from '../components/common/TransactionRow'
import { transactionService, reportService, categoryService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.85rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{p.value.toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  )
}

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', fontSize: '0.82rem' }}>
      <span style={{ color: payload[0].payload.fill }}>{payload[0].name}: </span>
      <strong>₹{payload[0].value.toLocaleString('en-IN')}</strong>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [monthlySummary, setMonthlySummary] = useState([])
  const [categoryBreakdown, setCategoryBreakdown] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch recent transactions
        const txnRes = await transactionService.getAll({ limit: 5, sort: 'date,desc' })
        setTransactions(txnRes.data)

        // Fetch monthly summary for reports
        const summaryRes = await reportService.monthlySummary('6')
        setMonthlySummary(summaryRes.data)

        // Get current month for category breakdown
        const currentMonth = new Date().toISOString().slice(0, 7)
        const breakdownRes = await reportService.categoryBreakdown(currentMonth)
        setCategoryBreakdown(breakdownRes.data)

        setError('')
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const recent = transactions.slice(0, 5)
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthIncome = transactions
    .filter(t => t.date.startsWith(currentMonth) && t.type === 'INCOME')
    .reduce((s, t) => s + t.amount, 0)
  const monthExpense = transactions
    .filter(t => t.date.startsWith(currentMonth) && t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0)
  const savings = monthIncome - monthExpense
  const savingsRate = monthIncome > 0 ? ((savings / monthIncome) * 100).toFixed(0) : 0

  return (
    <div className="page">
      {error && <div style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>{error}</div>}

      {/* Welcome banner */}
      <div className="welcome-banner fade-in">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, marginBottom: 4 }}>
            Good morning, {user?.name || 'User'} 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {currentMonth} — You've saved <strong style={{ color: 'var(--accent-green)' }}>{savingsRate}%</strong> of your income this month.
          </p>
        </div>
        <Link to="/transactions" className="btn btn-primary">
          <Plus size={15} /> Add Transaction
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
        <StatCard title="Total Income"  value={monthIncome}  change={8.2}  icon={TrendingUp}   accentColor="green" />
        <StatCard title="Total Expense" value={monthExpense} change={-5.1} icon={TrendingDown}  accentColor="red"   />
        <StatCard title="Net Savings"   value={savings}     change={12.4} icon={Wallet}        accentColor="blue"  />
        <StatCard title="Budget Used"   value={0}       change={-2.3} icon={Target}        accentColor="amber" prefix="₹" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Area chart */}
        <div className="card fade-in" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>Income vs Expenses</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>Last 6 months</div>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                <span style={{ width: 10, height: 3, background: 'var(--accent-green)', display: 'inline-block', borderRadius: 2 }} /> Income
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                <span style={{ width: 10, height: 3, background: 'var(--accent-red)', display: 'inline-block', borderRadius: 2 }} /> Expenses
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlySummary} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c896" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00c896" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff5c7a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ff5c7a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income"  stroke="#00c896" strokeWidth={2} fill="url(#incomeGrad)" dot={false} />
              <Area type="monotone" dataKey="expense" stroke="#ff5c7a" strokeWidth={2} fill="url(#expenseGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card fade-in" style={{ animationDelay: '0.15s' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Spending Breakdown</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>{currentMonth}</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} strokeWidth={0}>
                {categoryBreakdown.map((entry, idx) => <Cell key={idx} fill={entry.color || '#a78bfa'} />)}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {categoryBreakdown.slice(0, 4).map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color || '#a78bfa', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card fade-in" style={{ animationDelay: '0.2s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>Recent Transactions</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>Latest 5 entries</div>
          </div>
          <Link to="/transactions" className="btn btn-ghost" style={{ fontSize: '0.8rem', gap: 4 }}>
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Description</th><th>Date</th><th>Type</th><th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(t => <TransactionRow key={t.id} transaction={t} />)}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .welcome-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, var(--bg-card) 0%, rgba(0,200,150,0.06) 100%);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px 28px;
          margin-bottom: 24px;
        }
        @media(max-width:768px) {
          .welcome-banner { flex-direction: column; gap: 16px; align-items: flex-start; }
        }
      `}</style>
    </div>
  )

}
