import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Phone, Calendar, Edit2, Save, Shield, Bell, Palette, LogOut } from 'lucide-react'

export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name, email: user?.email, phone: '+91 98765 43210', currency: '₹', monthlyBudget: user?.monthlyBudget })
  const [activeSection, setActiveSection] = useState('personal')

  const handleSave = () => {
    setUser({ ...user, ...form })
    setEditing(false)
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const sections = ['personal', 'preferences', 'security', 'notifications']

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Profile</div>
          <div className="page-subtitle">Manage your account and preferences</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        {/* Left panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Avatar card */}
          <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{
              width: 80, height: 80,
              background: 'var(--accent-green-dim)',
              border: '3px solid rgba(0,200,150,0.3)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              fontWeight: 700,
              color: 'var(--accent-green)',
              margin: '0 auto 16px'
            }}>
              {initials}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>{user?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>{user?.email}</div>
            <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
              ✓ Verified Account
            </span>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Member since Jan 2024
            </div>
          </div>

          {/* Section nav */}
          <div className="card" style={{ padding: '8px' }}>
            {[
              { id: 'personal',      icon: User,    label: 'Personal Info' },
              { id: 'preferences',   icon: Palette, label: 'Preferences' },
              { id: 'security',      icon: Shield,  label: 'Security' },
              { id: 'notifications', icon: Bell,    label: 'Notifications' },
            ].map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className="btn" style={{
                  width: '100%', justifyContent: 'flex-start',
                  padding: '10px 14px', gap: 10,
                  background: activeSection === s.id ? 'var(--accent-green-dim)' : 'transparent',
                  color: activeSection === s.id ? 'var(--accent-green)' : 'var(--text-secondary)',
                  fontWeight: activeSection === s.id ? 600 : 400,
                  marginBottom: 2,
                }}>
                <s.icon size={15} strokeWidth={1.8} />
                {s.label}
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
              <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', gap: 10 }} onClick={logout}>
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div>
          {activeSection === 'personal' && (
            <div className="card fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>Personal Information</div>
                {editing
                  ? <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={handleSave}><Save size={14} /> Save Changes</button>
                  : <button className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={() => setEditing(true)}><Edit2 size={14} /> Edit</button>
                }
              </div>

              <div className="grid-2" style={{ gap: 18 }}>
                {[
                  { label: 'Full Name',    key: 'name',          icon: User,     type: 'text',  placeholder: 'Your full name' },
                  { label: 'Email',        key: 'email',         icon: Mail,     type: 'email', placeholder: 'your@email.com' },
                  { label: 'Phone',        key: 'phone',         icon: Phone,    type: 'tel',   placeholder: '+91 xxxxx xxxxx' },
                  { label: 'Monthly Budget (₹)', key: 'monthlyBudget', icon: null, type: 'number', placeholder: '50000' },
                ].map(field => (
                  <div key={field.key} className="form-group">
                    <label className="form-label">{field.label}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={field.type}
                        className="form-input"
                        value={form[field.key] || ''}
                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        disabled={!editing}
                        placeholder={field.placeholder}
                        style={{ opacity: editing ? 1 : 0.7 }}
                      />
                    </div>
                  </div>
                ))}

                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-input" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} disabled={!editing} style={{ opacity: editing ? 1 : 0.7 }}>
                    <option value="₹">₹ Indian Rupee (INR)</option>
                    <option value="$">$ US Dollar (USD)</option>
                    <option value="€">€ Euro (EUR)</option>
                    <option value="£">£ British Pound (GBP)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Member Since</label>
                  <input className="form-input" value="January 15, 2024" disabled style={{ opacity: 0.5 }} />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'preferences' && (
            <div className="card fade-in">
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 24 }}>Preferences</div>
              {[
                { label: 'Default Currency',    value: 'Indian Rupee (₹)' },
                { label: 'Date Format',         value: 'DD/MM/YYYY' },
                { label: 'Theme',               value: 'Dark' },
                { label: 'Language',            value: 'English' },
                { label: 'Start of Week',       value: 'Monday' },
                { label: 'Financial Year Start', value: 'April' },
              ].map(pref => (
                <div key={pref.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{pref.label}</span>
                  <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{pref.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'security' && (
            <div className="card fade-in">
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 24 }}>Security Settings</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input type="password" className="form-input" placeholder="Enter current password" />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" placeholder="Enter new password" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" className="form-input" placeholder="Confirm new password" />
                </div>
                <button className="btn btn-primary" style={{ width: 'fit-content' }}><Shield size={14} /> Update Password</button>
              </div>
              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Two-Factor Authentication</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>Add an extra layer of security to your account.</div>
                <button className="btn btn-secondary"><Shield size={14} /> Enable 2FA</button>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="card fade-in">
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 24 }}>Notification Settings</div>
              {[
                { label: 'Budget Alerts',          desc: 'Get notified when you\'re close to your budget limit', enabled: true },
                { label: 'Transaction Reminders',  desc: 'Reminders to log daily transactions', enabled: false },
                { label: 'Monthly Summary Email',  desc: 'Receive monthly financial summary via email', enabled: true },
                { label: 'Large Transaction Alert',desc: 'Alert for transactions above ₹10,000', enabled: true },
                { label: 'Weekly Report',          desc: 'Weekly spending insights every Monday', enabled: false },
              ].map(notif => (
                <div key={notif.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: 2 }}>{notif.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{notif.desc}</div>
                  </div>
                  <div style={{
                    width: 40, height: 22, borderRadius: 100,
                    background: notif.enabled ? 'var(--accent-green)' : 'var(--bg-secondary)',
                    border: `1px solid ${notif.enabled ? 'var(--accent-green)' : 'var(--border)'}`,
                    position: 'relative', cursor: 'pointer', flexShrink: 0,
                    transition: 'var(--transition)'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 2, left: notif.enabled ? 20 : 2,
                      width: 16, height: 16, borderRadius: '50%',
                      background: notif.enabled ? '#000' : 'var(--text-muted)',
                      transition: 'left 0.2s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media(max-width: 900px) {
          .page > div[style*='280px'] {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
