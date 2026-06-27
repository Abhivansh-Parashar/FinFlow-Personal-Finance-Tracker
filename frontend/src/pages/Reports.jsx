import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { reportService, getApiList } from '../services/api'
import { BarChart2, TrendingUp, TrendingDown, Wallet, Download } from 'lucide-react'

const FALLBACK_COLORS = ['#00c896','#ff5c7a','#4d9fff','#ffb74d','#a78bfa','#ff8f5c','#60c8ff','#f87171']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: '0.8rem' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
        {payload.map(p => (
            <div key={p.name} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
              <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{p.name}:</span>
              <span style={{ fontWeight: 600 }}>
            {typeof p.value === 'number' && p.value > 100
                ? `₹${Number(p.value).toLocaleString('en-IN')}`
                : `${p.value}%`}
          </span>
            </div>
        ))}
      </div>
  )
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview')
  const [monthlySummary, setMonthlySummary] = useState([])
  const [categoryBreakdown, setCategoryBreakdown] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const summaryRes = await reportService.monthlySummary(6)
        const summary = getApiList(summaryRes).map(item => ({
          month:   item.month,
          income:  Number(item.totalIncome  ?? item.income  ?? 0),
          expense: Number(item.totalExpense ?? item.expense ?? 0),
          savings: Number(item.netSavings   ?? 0),
          rate:    Number(item.savingsRate  ?? 0),
        }))
        setMonthlySummary(summary)

        const currentMonth = new Date().toISOString().slice(0, 7)
        const breakdownRes = await reportService.categoryBreakdown(currentMonth)
        const breakdown = getApiList(breakdownRes).map((item, i) => ({
          name:  item.categoryName ?? item.name ?? 'Other',
          value: Number(item.totalAmount ?? item.value ?? 0),
          color: item.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
          percentage: Number(item.percentage ?? 0),
        }))
        setCategoryBreakdown(breakdown)

        setError('')
      } catch (err) {
        console.error('Error fetching report data:', err)
        setError('Failed to load report data. Make sure the backend is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalIncome  = monthlySummary.reduce((s, m) => s + m.income, 0)
  const totalExpense = monthlySummary.reduce((s, m) => s + m.expense, 0)
  const totalSavings = monthlySummary.reduce((s, m) => s + m.savings, 0)
  const avgSavingsRate = monthlySummary.length > 0
      ? Math.round(monthlySummary.reduce((s, m) => s + m.rate, 0) / monthlySummary.length)
      : 0

  const tabs = ['overview', 'income', 'expenses', 'savings']

  // CSV export handler
  const handleExportCSV = () => {
    if (monthlySummary.length === 0) return
    const headers = ['Month', 'Income', 'Expense', 'Net Savings', 'Savings Rate (%)']
    const rows = monthlySummary.map(m => [m.month, m.income, m.expense, m.savings, m.rate])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `finflow-report-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Determine which chart sections to show based on activeTab
  const showIncome  = activeTab === 'overview' || activeTab === 'income'
  const showExpense = activeTab === 'overview' || activeTab === 'expenses'
  const showSavings = activeTab === 'overview' || activeTab === 'savings'

  return (
      <div className="page">
        {error && (
            <div style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>
              {error}
            </div>
        )}

        <div className="page-header">
          <div>
            <div className="page-title">Reports & Analytics</div>
            <div className="page-subtitle">Insights into your financial patterns</div>
          </div>
          <button className="btn btn-secondary" onClick={handleExportCSV}><Download size={14} /> Export CSV</button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: 4, border: '1px solid var(--border)', marginBottom: 24, width: 'fit-content' }}>
          {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className="btn" style={{
                padding: '7px 18px', fontSize: '0.82rem', textTransform: 'capitalize',
                background: activeTab === tab ? 'var(--accent-green)' : 'transparent',
                color: activeTab === tab ? '#000' : 'var(--text-secondary)',
                fontWeight: activeTab === tab ? 600 : 400,
              }}>{tab}</button>
          ))}
        </div>

        {/* Quick stats */}
        <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Income (6M)',  val: totalIncome,  icon: TrendingUp,  color: 'green' },
            { label: 'Total Expenses (6M)',val: totalExpense, icon: TrendingDown, color: 'red'   },
            { label: 'Net Savings (6M)',   val: totalSavings, icon: Wallet,       color: 'blue'  },
            { label: 'Avg Savings Rate',   val: `${avgSavingsRate}%`, icon: BarChart2, color: 'purple', isText: true },
          ].map(s => (
              <div key={s.label} className="card" style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
                  <s.icon size={16} style={{ color: `var(--accent-${s.color})` }} strokeWidth={1.8} />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem' }}>
                  {s.isText ? s.val : `₹${Number(s.val).toLocaleString('en-IN')}`}
                </div>
              </div>
          ))}
        </div>

        {/* Charts grid */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          {/* Income vs Expense — shown on overview and income tabs */}
          {showIncome && (
          <div className="card fade-in">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>Income vs Expenses</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>6-month comparison</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlySummary} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income"  fill="#00c896" radius={[4,4,0,0]} maxBarSize={28} />
                <Bar dataKey="expense" fill="#ff5c7a" radius={[4,4,0,0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}

          {/* Savings Rate — shown on overview and savings tabs */}
          {showSavings && (
          <div className="card fade-in">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>Savings Rate (%)</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>Monthly savings percentage</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlySummary} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="saveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4d9fff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4d9fff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="rate" stroke="#4d9fff" strokeWidth={2} fill="url(#saveGrad)" dot={{ fill: '#4d9fff', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          )}

          {/* Expense Breakdown Pie — shown on overview and expenses tabs */}
          {showExpense && (
          <div className="card fade-in">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>Expense Breakdown</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>By category · {new Date().toISOString().slice(0, 7)}</div>
            {categoryBreakdown.length === 0
                ? <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '20px 0' }}>No expense data for this month</div>
                : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                          <Pie data={categoryBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} strokeWidth={0}>
                            {categoryBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {categoryBreakdown.slice(0, 5).map(item => (
                            <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                      </span>
                              <span style={{ fontWeight: 500 }}>₹{Number(item.value).toLocaleString()}</span>
                            </div>
                        ))}
                      </div>
                    </div>
                )
            }
          </div>
          )}

          {/* Net savings bar — shown on overview and savings tabs */}
          {showSavings && (
          <div className="card fade-in">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>Net Savings</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>Monthly net savings</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlySummary} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="savings" fill="#a78bfa" radius={[6,6,0,0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>
      </div>
  )
}
