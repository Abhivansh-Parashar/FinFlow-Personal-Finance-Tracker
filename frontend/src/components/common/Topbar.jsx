import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Search, X, TrendingUp, TrendingDown, Target } from 'lucide-react'

const PAGE_TITLES = {
  '/dashboard':    { title: 'Dashboard',    subtitle: "Welcome back! Here's your financial overview." },
  '/income':       { title: 'Income',       subtitle: 'Track all your income sources.' },
  '/expenses':     { title: 'Expenses',     subtitle: 'Monitor where your money goes.' },
  '/transactions': { title: 'Transactions', subtitle: 'Complete history of all transactions.' },
  '/budget':       { title: 'Budget',       subtitle: 'Manage monthly spending limits.' },
  '/categories':   { title: 'Categories',   subtitle: 'Organize your transactions.' },
  '/reports':      { title: 'Reports',      subtitle: 'Detailed analytics and insights.' },
  '/profile':      { title: 'Profile',      subtitle: 'Manage your account settings.' },
}

// Static demo notifications — replace with a real API call when you build the notifications backend
const DEMO_NOTIFICATIONS = [
  { id: 1, icon: Target,      color: 'var(--accent-red)',   title: 'Budget Alert',        body: 'Shopping budget is 90% used this month.',     time: '2m ago',  read: false },
  { id: 2, icon: TrendingDown, color: 'var(--accent-amber)', title: 'Large Expense',       body: '₹15,000 rent payment recorded.',               time: '1h ago',  read: false },
  { id: 3, icon: TrendingUp,   color: 'var(--accent-green)', title: 'Income Added',        body: 'Salary of ₹75,000 added for this month.',      time: '3h ago',  read: true  },
  { id: 4, icon: Target,       color: 'var(--accent-blue)',  title: 'Monthly Summary',     body: "June summary is ready. You saved 45% this month!", time: '1d ago', read: true },
]

export default function Topbar({ sidebarWidth = 240, onSearch }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const info = PAGE_TITLES[pathname] || { title: 'FinFlow', subtitle: '' }

  const [searchVal, setSearchVal]       = useState('')
  const [showNotifs, setShowNotifs]     = useState(false)
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS)
  const debounceRef  = useRef(null)
  const notifPanelRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Debounced search
  useEffect(() => {
    if (!onSearch) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onSearch(searchVal), 300)
    return () => clearTimeout(debounceRef.current)
  }, [searchVal, onSearch])

  // Close notification panel when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target)) {
        setShowNotifs(false)
      }
    }
    if (showNotifs) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showNotifs])

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const dismiss  = (id) => setNotifications(prev => prev.filter(n => n.id !== id))

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

        {/* Notification button — now functional */}
        <div style={{ position: 'relative' }} ref={notifPanelRef}>
          <button
            className="topbar-icon-btn notif-btn"
            title="Notifications"
            onClick={() => setShowNotifs(v => !v)}
            style={{ background: showNotifs ? 'var(--bg-card-hover)' : undefined }}
          >
            <Bell size={17} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>

          {/* Dropdown panel */}
          {showNotifs && (
            <div className="notif-panel">
              <div className="notif-panel-header">
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>
                  Notifications
                </span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{ fontSize: '0.72rem', color: 'var(--accent-green)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifs(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.read ? 'unread' : ''}`}
                      onClick={() => markRead(n.id)}
                    >
                      <div className="notif-icon-wrap" style={{ background: n.color + '20' }}>
                        <n.icon size={14} style={{ color: n.color }} strokeWidth={2} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: n.read ? 400 : 600, marginBottom: 2 }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {n.body}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          {n.time}
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); dismiss(n.id) }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 4px', flexShrink: 0 }}
                        title="Dismiss"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                  <button
                    onClick={() => { setNotifications([]); setShowNotifs(false) }}
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .topbar {
          position: fixed; top: 0; right: 0;
          height: var(--topbar-height);
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px; z-index: 90;
          transition: left 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .topbar-left { display: flex; align-items: center; gap: 16px; }
        .topbar-title { font-size: 1.1rem; font-weight: 700; letter-spacing: -0.01em; }
        .topbar-sub { font-size: 0.75rem; color: var(--text-muted); }
        .topbar-right { display: flex; align-items: center; gap: 10px; }
        .search-wrap { position: relative; display: flex; align-items: center; }
        .search-icon { position: absolute; left: 10px; color: var(--text-muted); }
        .topbar-search {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-md); padding: 7px 12px 7px 32px;
          color: var(--text-primary); font-size: 0.8rem; width: 200px;
          transition: var(--transition);
        }
        .topbar-search:focus { border-color: var(--accent-green); width: 240px; box-shadow: 0 0 0 3px var(--accent-green-dim); }
        .topbar-search::placeholder { color: var(--text-muted); }
        .topbar-icon-btn {
          width: 36px; height: 36px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-md); color: var(--text-secondary);
          display: flex; align-items: center; justify-content: center;
          transition: var(--transition); position: relative; cursor: pointer;
        }
        .topbar-icon-btn:hover { color: var(--text-primary); border-color: var(--border-light); }
        .notif-badge {
          position: absolute; top: -4px; right: -4px;
          min-width: 16px; height: 16px; padding: 0 4px;
          background: var(--accent-red); color: white;
          border-radius: 100px; font-size: 0.6rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--bg-primary);
        }
        .notif-panel {
          position: absolute; top: calc(100% + 10px); right: 0;
          width: 340px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          z-index: 200;
          animation: fadeIn 0.18s ease;
        }
        .notif-panel-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-bottom: 1px solid var(--border);
        }
        .notif-list { max-height: 340px; overflow-y: auto; }
        .notif-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 16px; cursor: pointer;
          border-bottom: 1px solid var(--border);
          transition: var(--transition);
        }
        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: var(--bg-card-hover); }
        .notif-item.unread { background: rgba(0,200,150,0.04); }
        .notif-icon-wrap {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 2px;
        }
        @media (max-width: 768px) {
          .topbar-search { display: none; }
          .topbar-sub { display: none; }
          .notif-panel { width: 300px; right: -10px; }
        }
      `}</style>
    </header>
  )
}
