import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, Target, Plus, ArrowRight } from 'lucide-react'
import StatCard from '../components/common/StatCard'
import TransactionRow from '../components/common/TransactionRow'
import { transactionService, reportService, budgetService, getApiList, getApiPayload, normaliseTransaction } from '../services/api'
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
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{Number(p.value).toLocaleString('en-IN')}</span>
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
        <strong>₹{Number(payload[0].value).toLocaleString('en-IN')}</strong>
      </div>
  )
}

const PIE_COLORS = ['#00c896', '#4d9fff', '#ffb74d', '#a78bfa', '#ff5c7a', '#34d399']

export default function Dashboard() {
  const { user } = useAuth()
  const [recentTxns, setRecentTxns]         = useState([])
  const [monthlySummary, setMonthlySummary] = useState([])
  const [categoryBreakdown, setCategoryBreakdown] = useState([])
  // FIX: budget used was always 0 before — now fetched from real budget API
  const [budgetTotals, setBudgetTotals]     = useState({ budgeted: 0, spent: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const currentMonth = new Date().toISOString().slice(0, 7)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)

        const [txnRes, summaryRes, breakdownRes, budgetRes] = await Promise.all([
          transactionService.getAll({ size: 5, sort: 'date,desc' }),
          reportService.monthlySummary(6),
          reportService.categoryBreakdown(currentMonth),
          budgetService.getAll(currentMonth),
        ])

        setRecentTxns(getApiList(txnRes).map(normaliseTransaction))

        setMonthlySummary(getApiList(summaryRes).map(item => ({
          month:   item.month,
          income:  Number(item.totalIncome  ?? item.income  ?? 0),
          expense: Number(item.totalExpense ?? item.expense ?? 0),
        })))

        setCategoryBreakdown(getApiList(breakdownRes).map((item, i) => ({
          name:  item.categoryName ?? item.name ?? 'Other',
          value: Number(item.totalAmount ?? item.value ?? 0),
          color: item.color ?? PIE_COLORS[i % PIE_COLORS.length],
        })))

        // FIX: compute real budget used for the stat card
        const budgets = getApiList(budgetRes)
        const totalBudgeted = budgets.reduce((s, b) => s + Number(b.budgetAmount ?? 0), 0)
        const totalSpent    = budgets.reduce((s, b) => s + Number(b.spentAmount    ?? 0), 0)
        setBudgetTotals({ budgeted: totalBudgeted, spent: totalSpent })

        setError('')
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const currentSummary = monthlySummary.find(m => m.month === currentMonth)
  const prevMonthDate = new Date();
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const prevMonth = prevMonthDate.toISOString().slice(0, 7);
  const prevSummary = monthlySummary.find(m => m.month === prevMonth)

  const monthIncome  = currentSummary?.income  ?? 0
  const monthExpense = currentSummary?.expense ?? 0
  const savings      = monthIncome - monthExpense
  const savingsRate  = monthIncome > 0 ? ((savings / monthIncome) * 100).toFixed(0) : 0

  const getChange = (curr, prev) => prev === 0 ? null : Number((((curr - prev) / prev) * 100).toFixed(1));
  const incomeChange = getChange(monthIncome, prevSummary?.income ?? 0);
  const expenseChange = getChange(monthExpense, prevSummary?.expense ?? 0);
  const savingsChange = getChange(savings, (prevSummary?.income ?? 0) - (prevSummary?.expense ?? 0));

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
      <div className="page">
        {error && (
            <div style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>
              {error}
            </div>
        )}

        {/* Welcome banner */}
        <div className="welcome-banner fade-in">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, marginBottom: 4 }}>
              {greeting()}, {user?.name?.split(' ')[0] || 'User'} 👋
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {currentMonth} — You've saved <strong style={{ color: 'var(--accent-green)' }}>{savingsRate}%</strong> of your income this month.
            </p>
          </div>
          <Link to="/transactions" className="btn btn-primary">
            <Plus size={15} /> Add Transaction
          </Link>
        </div>

        {/* Stat cards — all now use real data */}
        <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
          <StatCard title="Total Income"  value={monthIncome}  change={incomeChange} icon={TrendingUp}   accentColor="green" />
          <StatCard title="Total Expense" value={monthExpense} change={expenseChange} icon={TrendingDown}  accentColor="red"   />
          <StatCard title="Net Savings"   value={savings}      change={savingsChange} icon={Wallet}        accentColor="blue"  />
          {/* FIX: Budget Used is now real — shows actual spent vs budgeted */}
          <StatCard
              title="Budget Used"
              value={budgetTotals.spent}
              change={null}
              icon={Target}
              accentColor="amber"
              subtitle={budgetTotals.budgeted > 0
                  ? `of ₹${budgetTotals.budgeted.toLocaleString('en-IN')} budgeted`
                  : 'No budgets set'}
          />
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
          <div className="card fade-in" style={{ animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>Income vs Expenses</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>Last 6 months</div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem' }}>
                {[['#00c896','Income'],['#ff5c7a','Expenses']].map(([c,l]) => (
                    <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                  <span style={{ width: 10, height: 3, background: c, display: 'inline-block', borderRadius: 2 }} /> {l}
                </span>
                ))}
              </div>
            </div>
            {monthlySummary.length === 0 && !loading ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '40px 0', textAlign: 'center' }}>
                  No data yet — add some transactions first
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthlySummary} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#00c896" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00c896" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#ff5c7a" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ff5c7a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="income"  stroke="#00c896" strokeWidth={2} fill="url(#incomeGrad)"  dot={false} />
                    <Area type="monotone" dataKey="expense" stroke="#ff5c7a" strokeWidth={2} fill="url(#expenseGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
            )}
          </div>

          <div className="card fade-in" style={{ animationDelay: '0.15s' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Spending Breakdown</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>{currentMonth}</div>
            {categoryBreakdown.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', padding: '20px 0' }}>No expenses this month</div>
            ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={categoryBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} strokeWidth={0}>
                        {categoryBreakdown.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {categoryBreakdown.slice(0, 4).map(item => (
                        <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                    </span>
                          <span style={{ fontWeight: 600 }}>₹{Number(item.value).toLocaleString()}</span>
                        </div>
                    ))}
                  </div>
                </>
            )}
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
              <tr><th>Description</th><th>Date</th><th>Type</th><th>Amount</th></tr>
              </thead>
              <tbody>
              {recentTxns.length === 0
                  ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No transactions yet</td></tr>
                  : recentTxns.map(t => <TransactionRow key={t.id} transaction={t} />)
              }
              </tbody>
            </table>
          </div>
        </div>

        <style>{`
        .welcome-banner {
          display: flex; align-items: center; justify-content: space-between;
          background: linear-gradient(135deg, var(--bg-card) 0%, rgba(0,200,150,0.06) 100%);
          border: 1px solid var(--border); border-radius: var(--radius-lg);
          padding: 24px 28px; margin-bottom: 24px;
        }
        @media(max-width:768px) { .welcome-banner { flex-direction: column; gap: 16px; align-items: flex-start; } }
      `}</style>
      </div>
  )
}
