import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Search, Plus } from 'lucide-react'

const PAGE_TITLES = {
  '/dashboard':    { title: 'Dashboard',        subtitle: 'Welcome back! Here\'s your financial overview.' },
  '/income':       { title: 'Income',           subtitle: 'Track all your income sources.' },
  '/expenses':     { title: 'Expenses',         subtitle: 'Monitor where your money goes.' },
  '/transactions': { title: 'Transactions',     subtitle: 'Complete history of all transactions.' },
  '/budget':       { title: 'Budget',           subtitle: 'Manage monthly spending limits.' },
  '/categories':   { title: 'Categories',       subtitle: 'Organize your transactions.' },
  '/reports':      { title: 'Reports',          subtitle: 'Detailed analytics and insights.' },
  '/profile':      { title: 'Profile',          subtitle: 'Manage your account settings.' },
}

export default function Topbar({ sidebarWidth = 240 }) {
  const { pathname } = useLocation()
  const info = PAGE_TITLES[pathname] || { title: 'FinFlow', subtitle: '' }
  const [searchVal, setSearchVal] = useState('')

  return (
    <header className="topbar" style={{ left: sidebarWidth }}>
      <div className="topbar-left">
        <div className="page-info">
          <h1 className="topbar-title">{info.title}</h1>
          <p className="topbar-sub">{info.subtitle}</p>
        </div>
      </div>

      <div className="topbar-right">
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input
            className="topbar-search"
            placeholder="Search transactions..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
          />
        </div>
        <button className="topbar-icon-btn notif-btn" title="Notifications">
          <Bell size={17} strokeWidth={1.8} />
          <span className="notif-dot" />
        </button>
      </div>

      <style>{`
        .topbar {
          position: fixed;
          top: 0; right: 0;
          height: var(--topbar-height);
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          z-index: 90;
          transition: left 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .topbar-left { display: flex; align-items: center; gap: 16px; }
        .topbar-title { font-size: 1.1rem; font-weight: 700; letter-spacing: -0.01em; }
        .topbar-sub { font-size: 0.75rem; color: var(--text-muted); }
        .topbar-right { display: flex; align-items: center; gap: 10px; }
        .search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 10px;
          color: var(--text-muted);
        }
        .topbar-search {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 7px 12px 7px 32px;
          color: var(--text-primary);
          font-size: 0.8rem;
          width: 200px;
          transition: var(--transition);
        }
        .topbar-search:focus {
          border-color: var(--accent-green);
          width: 240px;
          box-shadow: 0 0 0 3px var(--accent-green-dim);
        }
        .topbar-search::placeholder { color: var(--text-muted); }
        .topbar-icon-btn {
          width: 36px; height: 36px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          display: flex; align-items: center; justify-content: center;
          transition: var(--transition);
          position: relative;
        }
        .topbar-icon-btn:hover { color: var(--text-primary); border-color: var(--border-light); }
        .notif-dot {
          position: absolute;
          top: 7px; right: 7px;
          width: 7px; height: 7px;
          background: var(--accent-red);
          border-radius: 50%;
          border: 1.5px solid var(--bg-primary);
        }
        @media (max-width: 768px) {
          .topbar-search { display: none; }
          .topbar-sub { display: none; }
        }
      `}</style>
    </header>
  )
}
