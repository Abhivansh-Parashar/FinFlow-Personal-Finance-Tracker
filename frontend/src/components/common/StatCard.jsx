import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, change, changeLabel, icon: Icon, accentColor = 'green', prefix = '₹', large = false }) {
  const isPositive = change >= 0
  const colorMap = {
    green:  { bg: 'var(--accent-green-dim)',  border: 'rgba(0,200,150,0.15)',  text: 'var(--accent-green)' },
    red:    { bg: 'var(--accent-red-dim)',    border: 'rgba(255,92,122,0.15)', text: 'var(--accent-red)' },
    blue:   { bg: 'var(--accent-blue-dim)',   border: 'rgba(77,159,255,0.15)', text: 'var(--accent-blue)' },
    amber:  { bg: 'var(--accent-amber-dim)',  border: 'rgba(255,183,77,0.15)', text: 'var(--accent-amber)' },
    purple: { bg: 'var(--accent-purple-dim)', border: 'rgba(167,139,250,0.15)', text: 'var(--accent-purple)' },
  }
  const colors = colorMap[accentColor] || colorMap.green

  return (
    <div className="stat-card card fade-in" style={{ '--accent-bg': colors.bg, '--accent-border': colors.border, '--accent-text': colors.text }}>
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div className="stat-icon-wrap">
            <Icon size={16} strokeWidth={1.8} />
          </div>
        )}
      </div>
      <div className="stat-value" style={{ fontSize: large ? '2rem' : '1.65rem' }}>
        {prefix}{Number(value).toLocaleString('en-IN')}
      </div>
      {change !== undefined && (
        <div className="stat-change">
          {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span style={{ color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="change-label">{changeLabel || 'vs last month'}</span>
        </div>
      )}

      <style>{`
        .stat-card {
          background: linear-gradient(135deg, var(--bg-card) 0%, color-mix(in srgb, var(--bg-card) 95%, transparent) 100%);
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 100px; height: 100px;
          background: var(--accent-bg);
          border-radius: 50%;
          transform: translate(30%, -30%);
          pointer-events: none;
        }
        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .stat-title {
          font-size: 0.78rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          font-weight: 600;
        }
        .stat-icon-wrap {
          width: 32px; height: 32px;
          background: var(--accent-bg);
          border: 1px solid var(--accent-border);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: var(--accent-text);
        }
        .stat-value {
          font-family: var(--font-display);
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: 10px;
          line-height: 1;
        }
        .stat-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.78rem;
          font-weight: 500;
        }
        .change-label {
          color: var(--text-muted);
          font-weight: 400;
        }
      `}</style>
    </div>
  )
}
