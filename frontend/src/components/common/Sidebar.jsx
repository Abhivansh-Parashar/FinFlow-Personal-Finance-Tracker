import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, TrendingUp, TrendingDown, List,
  PieChart, Target, BarChart2, User, LogOut, Wallet,
  ChevronLeft, ChevronRight, Tag
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/income',       icon: TrendingUp,      label: 'Income' },
  { to: '/expenses',     icon: TrendingDown,    label: 'Expenses' },
  { to: '/transactions', icon: List,            label: 'Transactions' },
  { to: '/budget',       icon: Target,          label: 'Budget' },
  { to: '/categories',   icon: Tag,             label: 'Categories' },
  { to: '/reports',      icon: BarChart2,       label: 'Reports' },
  { to: '/profile',      icon: User,            label: 'Profile' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <aside className="sidebar" style={{ width: collapsed ? 72 : 240 }}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Wallet size={18} color="#000" strokeWidth={2.5} />
        </div>
        {!collapsed && <span className="logo-text">FinFlow</span>}
      </div>

      {/* Collapse toggle */}
      <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} strokeWidth={1.8} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom user */}
      <div className="sidebar-footer">
        {!collapsed ? (
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div className="user-details">
              <div className="user-name">{user?.name?.split(' ')[0]}</div>
              <div className="user-email" title={user?.email}>{user?.email}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button className="logout-btn collapsed" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        )}
      </div>

      <style>{`
        .sidebar {
          position: fixed;
          top: 0; left: 0; bottom: 0;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
          overflow: hidden;
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 16px 16px;
          border-bottom: 1px solid var(--border);
          height: var(--topbar-height);
          flex-shrink: 0;
        }
        .logo-icon {
          width: 32px; height: 32px;
          background: var(--accent-green);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .logo-text {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          white-space: nowrap;
          letter-spacing: -0.01em;
        }
        .collapse-btn {
          position: absolute;
          top: 80px;
          right: -12px;
          width: 24px; height: 24px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-secondary);
          transition: var(--transition);
          z-index: 10;
        }
        .collapse-btn:hover { color: var(--text-primary); border-color: var(--border-light); }
        .sidebar-nav {
          flex: 1;
          padding: 12px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          transition: var(--transition);
          white-space: nowrap;
          position: relative;
        }
        .nav-item:hover { background: var(--bg-card); color: var(--text-primary); }
        .nav-item.active {
          background: var(--accent-green-dim);
          color: var(--accent-green);
        }
        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 25%; bottom: 25%;
          width: 3px;
          background: var(--accent-green);
          border-radius: 0 3px 3px 0;
        }
        .sidebar-footer {
          padding: 12px 10px;
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }
        .user-info {
          display: flex; align-items: center; gap: 8px;
        }
        .user-avatar {
          width: 32px; height: 32px;
          background: var(--accent-green-dim);
          border: 1px solid rgba(0,200,150,0.3);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-green);
          flex-shrink: 0;
        }
        .user-details { flex: 1; min-width: 0; }
        .user-name { font-size: 0.8rem; font-weight: 600; white-space: nowrap; }
        .user-email { font-size: 0.7rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .logout-btn {
          background: transparent; border: none;
          color: var(--text-muted);
          padding: 6px;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          transition: var(--transition);
          flex-shrink: 0;
        }
        .logout-btn:hover { color: var(--accent-red); background: var(--accent-red-dim); }
        .logout-btn.collapsed { width: 100%; }
      `}</style>
    </aside>
  )
}
