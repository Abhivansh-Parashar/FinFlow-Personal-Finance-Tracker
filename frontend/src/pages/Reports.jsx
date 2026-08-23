import React, { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { reportService, transactionService, getApiList, normaliseTransaction } from '../services/api'
import { BarChart2, TrendingUp, TrendingDown, Wallet, Download, Calendar, Loader2 } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import TransactionRow from '../components/common/TransactionRow'

const FALLBACK_COLORS = ['#00c896','#ff5c7a','#4d9fff','#ffb74d','#a78bfa','#ff8f5c','#60c8ff','#f87171']

const currentMonthStr = new Date().toISOString().slice(0, 7)

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
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr)
  const [monthlySummary, setMonthlySummary] = useState([])
  const [categoryBreakdown, setCategoryBreakdown] = useState([])
  const [monthTransactions, setMonthTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')

  const reportRef = useRef(null)

  useEffect(() => {
    fetchSummaryTrend()
  }, [])

  useEffect(() => {
    fetchMonthDetails(selectedMonth)
  }, [selectedMonth])

  const fetchSummaryTrend = async () => {
    try {
      const summaryRes = await reportService.monthlySummary(12)
      const summary = getApiList(summaryRes).map(item => ({
        month:   item.month,
        income:  Number(item.totalIncome  ?? item.income  ?? 0),
        expense: Number(item.totalExpense ?? item.expense ?? 0),
        savings: Number(item.netSavings   ?? 0),
        rate:    Number(item.savingsRate  ?? 0),
      }))
      setMonthlySummary(summary)
    } catch (err) {
      console.error('Error fetching summary trend:', err)
    }
  }

  const fetchMonthDetails = async (month) => {
    try {
      setLoading(true)
      const [breakdownRes, txnRes] = await Promise.all([
        reportService.categoryBreakdown(month),
        transactionService.getAll({ month, size: 500, sort: 'date,desc' }),
      ])

      const breakdown = getApiList(breakdownRes).map((item, i) => ({
        name:  item.categoryName ?? item.name ?? 'Other',
        value: Number(item.totalAmount ?? item.value ?? 0),
        color: item.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
        percentage: Number(item.percentage ?? 0),
      }))
      setCategoryBreakdown(breakdown)

      const txns = getApiList(txnRes).map(normaliseTransaction)
      setMonthTransactions(txns)

      setError('')
    } catch (err) {
      console.error('Error fetching month details:', err)
      setError('Failed to load report data for selected month.')
    } finally {
      setLoading(false)
    }
  }

  const selectedSummary = monthlySummary.find(m => m.month === selectedMonth)
  const monthIncome = monthTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0) || (selectedSummary?.income ?? 0)
  const monthExpense = monthTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0) || (selectedSummary?.expense ?? 0)
  const monthSavings = monthIncome - monthExpense
  const monthSavingsRate = monthIncome > 0 ? Math.round((monthSavings / monthIncome) * 100) : 0

  const getQuickMonths = () => {
    const list = []
    const now = new Date()
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mStr = d.toISOString().slice(0, 7)
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' })
      list.push({ month: mStr, label })
    }
    return list
  }

  const handleExportPDF = async () => {
    if (!reportRef.current) return
    try {
      setExporting(true)
      const element = reportRef.current

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0b0f19',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`finflow-report-${selectedMonth}.pdf`)
    } catch (err) {
      console.error('PDF export error:', err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const tabs = ['overview', 'income', 'expenses', 'savings', 'transactions']
  const showIncome  = activeTab === 'overview' || activeTab === 'income'
  const showExpense = activeTab === 'overview' || activeTab === 'expenses'
  const showSavings = activeTab === 'overview' || activeTab === 'savings'
  const showTransactions = activeTab === 'overview' || activeTab === 'transactions'

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
          <div className="page-subtitle">Historical financial review & PDF report export</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={handleExportPDF} disabled={exporting}>
            {exporting ? <Loader2 className="spin" size={14} /> : <Download size={14} />}
            {exporting ? 'Generating PDF...' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, padding: '16px 20px', background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(77,159,255,0.05) 100%)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={18} style={{ color: 'var(--accent-blue)' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Selected Month: <span style={{ color: 'var(--accent-green)' }}>{selectedMonth}</span></div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Inspect expenses, income, pie charts & transactions for any month</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quick Pick:</span>
            {getQuickMonths().map(m => (
              <button
                key={m.month}
                className={`btn ${selectedMonth === m.month ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                onClick={() => setSelectedMonth(m.month)}
              >
                {m.label}
              </button>
            ))}
            <input
              type="month"
              className="form-input"
              value={selectedMonth}
              style={{ width: 'auto', padding: '4px 10px', fontSize: '0.8rem' }}
              onChange={e => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>
      </div>

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

      <div ref={reportRef} style={{ padding: '8px', borderRadius: '12px' }}>
        <div style={{ marginBottom: 14, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Monthly Overview — {selectedMonth}
        </div>
        <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Income ({selectedMonth})</span>
              <TrendingUp size={16} style={{ color: 'var(--accent-green)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', color: 'var(--accent-green)' }}>
              ₹{monthIncome.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expenses ({selectedMonth})</span>
              <TrendingDown size={16} style={{ color: 'var(--accent-red)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', color: 'var(--accent-red)' }}>
              ₹{monthExpense.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Savings ({selectedMonth})</span>
              <Wallet size={16} style={{ color: 'var(--accent-blue)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', color: monthSavings >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              ₹{monthSavings.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Savings Rate</span>
              <BarChart2 size={16} style={{ color: 'var(--accent-purple)' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem' }}>
              {monthSavingsRate}%
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
          {showIncome && (
            <div className="card fade-in">
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>Income vs Expenses Trend</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>Multi-month comparison</div>
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

          {showSavings && (
            <div className="card fade-in">
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>Savings Rate Trend (%)</div>
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

          {showExpense && (
            <div className="card fade-in">
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>Expense Breakdown</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>By category · {selectedMonth}</div>
              {categoryBreakdown.length === 0
                ? <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '30px 0', textAlign: 'center' }}>No expense data recorded for {selectedMonth}</div>
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
                      {categoryBreakdown.map(item => (
                        <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                            <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                          </span>
                          <span style={{ fontWeight: 500 }}>₹{Number(item.value).toLocaleString('en-IN')} ({item.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
            </div>
          )}

          {showSavings && (
            <div className="card fade-in">
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>Net Savings Trend</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 18 }}>Monthly net savings balance</div>
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

        {showTransactions && (
          <div className="card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.98rem' }}>Month Transactions ({selectedMonth})</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>{monthTransactions.length} records found</div>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Loading month transactions...</td></tr>
                  ) : monthTransactions.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No transactions found for {selectedMonth}</td></tr>
                  ) : (
                    monthTransactions.map(t => <TransactionRow key={t.id} transaction={t} />)
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
